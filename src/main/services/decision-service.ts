import { BrowserWindow } from "electron";
import { getMatches, saveMatches, getDownloads } from "./cache-service";
import { enqueueMaps } from "./download-service";
import { getSettings } from "./settings-service";
import { compareCandidates } from "./matching";
import { chosenMapIdsOf, type MapCandidate } from "../utils/schema";
import log from "electron-log/main";

function sendToRenderer(channel: string, ...args: unknown[]) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send(channel, ...args);
}

export interface DecisionResult {
  success: boolean;
  queued: number;
  error?: string;
}

/**
 * Accept one or more maps for a song.
 *
 * A song can be worth several charts, so the accepted set is additive: adding
 * again keeps what was already chosen rather than replacing it.
 *
 * The decision is recorded before the downloads are queued, so a failed or
 * interrupted download never costs the user their choice - a retry picks it
 * straight back up.
 */
export async function addMatch(
  songId: string,
  mapIds: string[]
): Promise<DecisionResult> {
  const matches = getMatches();
  const match = matches.items[songId];

  if (!match) {
    return { success: false, queued: 0, error: "No match found for that song." };
  }

  const wanted = [...new Set(mapIds)].filter(Boolean);
  if (wanted.length === 0) {
    return { success: false, queued: 0, error: "No maps selected." };
  }

  const chosen: MapCandidate[] = [];
  for (const mapId of wanted) {
    const candidate = match.candidates.find((c) => c.mapId === mapId);
    if (!candidate) {
      return {
        success: false,
        queued: 0,
        error: `Map ${mapId} is not a candidate for this song.`,
      };
    }
    chosen.push(candidate);
  }

  // Additive: previously accepted maps stay accepted.
  const merged = [...new Set([...chosenMapIdsOf(match), ...wanted])];

  match.status = "added";
  match.chosenMapIds = merged;
  match.chosenMapId = merged[0] ?? null;
  match.decidedAt = new Date().toISOString();
  await saveMatches(matches);

  const queued = await enqueueMaps(
    chosen.map((candidate) => ({ songId, candidate }))
  );

  log.info(`Added ${chosen.length} map(s) for song ${songId}: ${wanted.join(", ")}`);
  sendToRenderer("decision:changed", {
    songId,
    status: "added",
    mapIds: merged,
  });

  return { success: true, queued };
}

/** Reject a song. It will not be offered again until the decision is reset. */
export async function skipMatch(songId: string): Promise<DecisionResult> {
  const matches = getMatches();
  const match = matches.items[songId];

  if (!match) {
    return { success: false, queued: 0, error: "No match found for that song." };
  }

  match.status = "skipped";
  match.chosenMapId = null;
  match.chosenMapIds = [];
  match.decidedAt = new Date().toISOString();
  await saveMatches(matches);

  log.info(`Skipped song ${songId}`);
  sendToRenderer("decision:changed", { songId, status: "skipped" });

  return { success: true, queued: 0 };
}

/** Put a song back in the review queue, undoing a previous add or skip. */
export async function resetDecision(songId: string): Promise<DecisionResult> {
  const matches = getMatches();
  const match = matches.items[songId];

  if (!match) {
    return { success: false, queued: 0, error: "No match found for that song." };
  }

  match.status = match.candidates.length > 0 ? "pending" : "no_match";
  match.chosenMapId = null;
  match.chosenMapIds = [];
  match.decidedAt = null;
  await saveMatches(matches);

  sendToRenderer("decision:changed", { songId, status: match.status });
  return { success: true, queued: 0 };
}

/** Clear every decision, returning all searched songs to review. */
export async function resetAllDecisions(): Promise<DecisionResult> {
  const matches = getMatches();
  let reset = 0;

  for (const match of Object.values(matches.items)) {
    if (match.status === "added" || match.status === "skipped") {
      match.status = match.candidates.length > 0 ? "pending" : "no_match";
      match.chosenMapId = null;
      match.chosenMapIds = [];
      match.decidedAt = null;
      reset++;
    }
  }

  await saveMatches(matches);
  log.info(`Reset ${reset} decisions`);
  sendToRenderer("decision:changed", { songId: null, status: "reset" });

  return { success: true, queued: 0 };
}

interface BulkSelection {
  songId: string;
  mapId: string;
}

/**
 * Accept many songs at once and download them in the background.
 *
 * Used by "Add selected" and "Add all": every decision is written first, then
 * the whole set is handed to the queue as one batch so the downloads run
 * concurrently instead of one behind the other.
 */
export async function addManyMatches(
  selections: BulkSelection[]
): Promise<DecisionResult> {
  const matches = getMatches();
  const now = new Date().toISOString();
  const batch: { songId: string; candidate: MapCandidate }[] = [];

  for (const { songId, mapId } of selections) {
    const match = matches.items[songId];
    if (!match) continue;

    const candidate = match.candidates.find((c) => c.mapId === mapId);
    if (!candidate) continue;

    const merged = [...new Set([...chosenMapIdsOf(match), mapId])];

    match.status = "added";
    match.chosenMapIds = merged;
    match.chosenMapId = merged[0] ?? null;
    match.decidedAt = now;

    batch.push({ songId, candidate });
  }

  await saveMatches(matches);

  const queued = await enqueueMaps(batch);

  log.info(`Added ${batch.length} maps in bulk, ${queued} queued for download`);
  sendToRenderer("decision:changed", { songId: null, status: "bulk-added" });

  return { success: true, queued };
}

/**
 * Accept the top-scoring candidate for every song still awaiting review.
 * Songs whose chosen map is already installed are decided without re-queueing.
 */
export async function addAllPending(): Promise<DecisionResult> {
  const matches = getMatches();
  const downloads = getDownloads();

  const selections: BulkSelection[] = [];

  const { preferCuratedRanked } = getSettings();

  for (const match of Object.values(matches.items)) {
    if (match.status !== "pending" || match.candidates.length === 0) continue;

    // Re-rank rather than trusting the stored order: the ordering preference
    // may have changed since these candidates were searched.
    const best = [...match.candidates].sort((a, b) =>
      compareCandidates(a, b, preferCuratedRanked)
    )[0];

    // Prefer a map already on disk over downloading a near-identical one.
    const installed = match.candidates.find(
      (c) => downloads.items[c.mapId]?.status === "completed"
    );

    selections.push({ songId: match.songId, mapId: (installed ?? best).mapId });
  }

  return addManyMatches(selections);
}
