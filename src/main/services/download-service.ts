import { BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { getSettings } from "./settings-service";
import {
  getDownloads,
  saveDownloads,
  getQueue,
  saveQueue,
} from "./cache-service";
import { BeatSaverProvider } from "../providers/beatsaver-provider";
import { extractZip, hasInfoDat } from "../utils/zip";
import { sanitizeFolderName } from "../utils/text";
import type { Job, MapCandidate } from "../utils/schema";
import log from "electron-log/main";

const beatSaver = new BeatSaverProvider();

let isProcessing = false;
let abortController: AbortController | null = null;

/**
 * Incremented on every run and every pause.
 *
 * Pausing and immediately resuming can leave the old run's cleanup racing the
 * new run's start-up; without this guard the stale `finally` would clear the
 * new run's state and the queue would stall silently.
 */
let runGeneration = 0;

/** Candidate metadata for queued jobs, so a job can be run without a match lookup. */
const pendingCandidates = new Map<string, MapCandidate>();

function sendToRenderer(channel: string, ...args: unknown[]) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send(channel, ...args);
}

/**
 * Beat Saber discovers custom levels by folder name. The community convention
 * is "<key> (<song> - <mapper>)", which keeps folders unique and readable.
 */
export function mapFolderName(candidate: MapCandidate): string {
  const song = sanitizeFolderName(candidate.songName || candidate.name);
  const mapper = sanitizeFolderName(
    candidate.levelAuthorName || candidate.uploader
  );
  const base = mapper ? `${song} - ${mapper}` : song;
  return sanitizeFolderName(`${candidate.mapId} (${base})`) || candidate.mapId;
}

export interface EnqueueEntry {
  songId: string;
  candidate: MapCandidate;
}

/**
 * Queue maps for download, skipping anything already installed or in flight,
 * then start the worker pool.
 */
export async function enqueueMaps(entries: EnqueueEntry[]): Promise<number> {
  if (entries.length === 0) return 0;

  const queue = getQueue();
  const downloads = getDownloads();
  const now = new Date().toISOString();

  const inFlight = new Set([
    ...queue.pending.map((j) => j.mapId),
    ...queue.active.map((j) => j.mapId),
  ]);

  let added = 0;

  for (const { songId, candidate } of entries) {
    if (inFlight.has(candidate.mapId)) continue;

    // The same map can back several liked songs; install it once.
    if (downloads.items[candidate.mapId]?.status === "completed") continue;

    inFlight.add(candidate.mapId);
    pendingCandidates.set(candidate.mapId, candidate);

    queue.pending.push({
      id: `job_${Date.now()}_${added}`,
      songId,
      mapId: candidate.mapId,
      status: "pending",
      attempts: 0,
      error: null,
      createdAt: now,
    });

    downloads.items[candidate.mapId] = {
      mapId: candidate.mapId,
      songId,
      hash: candidate.hash,
      name: candidate.name,
      status: "queued",
      folderPath: "",
      downloadedAt: now,
      sourceUrl: candidate.downloadURL,
      error: null,
      candidate,
    };

    added++;
  }

  if (added === 0) return 0;

  await Promise.all([saveQueue(queue), saveDownloads(downloads)]);

  log.info(`Queued ${added} maps for download`);
  sendToRenderer("download:queued", { count: added });

  kickProcessQueue();
  return added;
}

export function kickProcessQueue(): void {
  void processQueue().catch((err) => {
    log.error("Download queue processor crashed:", err);
    isProcessing = false;
    abortController = null;
  });
}

export function pauseAll(): void {
  abortController?.abort();
  isProcessing = false;
  // Retire the current run so its cleanup cannot touch a later one.
  runGeneration++;
  log.info("Downloads paused");
  sendToRenderer("download:paused", {});
}

export async function retryFailed(): Promise<number> {
  const queue = getQueue();
  const downloads = getDownloads();

  const retried = queue.failed.length;
  for (const job of queue.failed) {
    queue.pending.push({
      ...job,
      status: "pending",
      attempts: 0,
      error: null,
    });

    const record = downloads.items[job.mapId];
    if (record) {
      record.status = "queued";
      record.error = null;
    }
  }
  queue.failed = [];

  await Promise.all([saveQueue(queue), saveDownloads(downloads)]);

  if (retried > 0) kickProcessQueue();
  return retried;
}

/** Pull the next job, moving it from pending to active atomically. */
async function takeNextJob(): Promise<Job | null> {
  const queue = getQueue();
  const job = queue.pending.shift();
  if (!job) return null;

  const active: Job = { ...job, status: "active" };
  queue.active.push(active);
  await saveQueue(queue);

  return active;
}

async function finishJob(
  job: Job,
  outcome: "completed" | "failed",
  error?: string
): Promise<void> {
  const queue = getQueue();
  queue.active = queue.active.filter((j) => j.id !== job.id);

  if (outcome === "failed") {
    queue.failed.push({ ...job, status: "failed", error: error ?? "Unknown error" });
  }

  await saveQueue(queue);
}

/** Return a job to the front of the queue without counting it as a failure. */
async function requeueJob(job: Job): Promise<void> {
  const queue = getQueue();
  queue.active = queue.active.filter((j) => j.id !== job.id);
  queue.pending.unshift({ ...job, status: "pending" });
  await saveQueue(queue);

  const downloads = getDownloads();
  const record = downloads.items[job.mapId];
  if (record) {
    record.status = "queued";
    await saveDownloads(downloads);
  }
}

/**
 * Run the queue with a fixed-size pool of workers.
 *
 * Each worker takes the next job the moment it finishes one, so a slow
 * download never holds back the rest of the batch.
 */
async function processQueue(): Promise<void> {
  if (isProcessing) return;

  isProcessing = true;
  abortController = new AbortController();
  const signal = abortController.signal;
  const myGeneration = ++runGeneration;

  const { concurrency } = getSettings();

  const worker = async (): Promise<void> => {
    for (;;) {
      // Stop as soon as this run is aborted or superseded.
      if (signal.aborted || myGeneration !== runGeneration) return;

      const job = await takeNextJob();
      if (!job) return;

      if (signal.aborted) {
        await requeueJob(job);
        return;
      }

      await runJob(job, signal);
    }
  };

  try {
    await Promise.all(
      Array.from({ length: Math.max(1, concurrency) }, () => worker())
    );
  } finally {
    // Only tear down if a newer run has not already taken over.
    if (myGeneration === runGeneration) {
      isProcessing = false;
      abortController = null;

      const queue = getQueue();
      if (queue.pending.length === 0 && queue.active.length === 0) {
        sendToRenderer("download:allFinished", {
          failed: queue.failed.length,
        });
      }
    }
  }
}

async function runJob(job: Job, signal: AbortSignal): Promise<void> {
  const settings = getSettings();
  const downloads = getDownloads();

  const candidate = pendingCandidates.get(job.mapId);
  const record = downloads.items[job.mapId];

  const sourceUrl = candidate?.downloadURL ?? record?.sourceUrl ?? "";
  const displayName = candidate?.name ?? record?.name ?? job.mapId;

  if (!sourceUrl) {
    log.warn(`No download URL for map ${job.mapId}`);
    await markFailed(job, "No download URL available");
    return;
  }

  log.info(`Downloading map ${job.mapId} (${displayName})`);

  if (record) {
    record.status = "downloading";
    await saveDownloads(downloads);
  }

  sendToRenderer("download:started", {
    mapId: job.mapId,
    songId: job.songId,
    name: displayName,
  });

  try {
    const zipData = await beatSaver.downloadZip(
      sourceUrl,
      (received, total) => {
        sendToRenderer("download:progress", {
          mapId: job.mapId,
          received,
          total,
          percent: total ? Math.round((received / total) * 100) : null,
        });
      },
      signal
    );

    if (signal.aborted) {
      await requeueJob(job);
      return;
    }

    // Extract.
    const folderName = candidate
      ? mapFolderName(candidate)
      : sanitizeFolderName(`${job.mapId} (${displayName})`);
    const destDir = path.join(settings.mapsDir, folderName);

    const current = getDownloads();
    const currentRecord = current.items[job.mapId];
    if (currentRecord) {
      currentRecord.status = "extracting";
      await saveDownloads(current);
    }
    sendToRenderer("download:extracting", { mapId: job.mapId });

    const { fileCount, skipped } = await extractZip(zipData, destDir);

    if (skipped.length > 0) {
      log.warn(
        `Skipped ${skipped.length} unsafe entries in ${job.mapId}: ${skipped.join(", ")}`
      );
    }

    if (fileCount === 0) {
      throw new Error("Archive contained no usable files");
    }

    if (!(await hasInfoDat(destDir))) {
      log.warn(`${job.mapId} extracted without an Info.dat - Beat Saber may not see it`);
    }

    if (settings.keepZip) {
      await fs.promises.writeFile(
        path.join(destDir, `${job.mapId}.zip`),
        zipData
      );
    }

    const done = getDownloads();
    const doneRecord = done.items[job.mapId];
    if (doneRecord) {
      doneRecord.status = "completed";
      doneRecord.folderPath = destDir;
      doneRecord.downloadedAt = new Date().toISOString();
      doneRecord.error = null;
      await saveDownloads(done);
    }

    await finishJob(job, "completed");
    pendingCandidates.delete(job.mapId);

    log.info(`Installed ${job.mapId} -> ${destDir} (${fileCount} files)`);
    sendToRenderer("download:finished", {
      mapId: job.mapId,
      songId: job.songId,
      folderPath: destDir,
    });
  } catch (err: unknown) {
    if (signal.aborted) {
      await requeueJob(job);
      return;
    }

    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Download failed for ${job.mapId}: ${msg}`);
    await markFailed(job, msg);
  }
}

async function markFailed(job: Job, error: string): Promise<void> {
  const downloads = getDownloads();
  const record = downloads.items[job.mapId];
  if (record) {
    record.status = "failed";
    record.error = error;
    await saveDownloads(downloads);
  }

  await finishJob(job, "failed", error);

  sendToRenderer("download:failed", {
    mapId: job.mapId,
    songId: job.songId,
    error,
  });
}

/**
 * Restore candidate metadata for jobs that survived a restart, then resume.
 * Without this a queued job would have no download URL after a relaunch.
 *
 * The snapshot stored on each download record is the source of truth;
 * `lookup` only covers records written before that field existed.
 */
export function primeQueueFromMatches(
  lookup: (mapId: string) => MapCandidate | null
): void {
  const queue = getQueue();
  const downloads = getDownloads();

  for (const job of [...queue.pending, ...queue.active]) {
    if (pendingCandidates.has(job.mapId)) continue;

    const candidate =
      downloads.items[job.mapId]?.candidate ?? lookup(job.mapId);

    if (candidate) pendingCandidates.set(job.mapId, candidate);
  }

  if (queue.pending.length > 0) {
    log.info(`Resuming ${queue.pending.length} pending map downloads`);
    kickProcessQueue();
  }
}
