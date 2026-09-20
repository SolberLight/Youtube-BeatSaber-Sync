import {
  Library,
  LibrarySchema,
  DEFAULT_LIBRARY,
  Matches,
  MatchesSchema,
  DEFAULT_MATCHES,
  Downloads,
  DownloadsSchema,
  DEFAULT_DOWNLOADS,
  Queue,
  QueueSchema,
  DEFAULT_QUEUE,
} from "../utils/schema";
import { loadJson, saveJsonAtomic } from "../utils/json-store";
import {
  getLibraryPath,
  getMatchesPath,
  getDownloadsPath,
  getQueuePath,
} from "../utils/paths";

let libraryCache: Library | null = null;
let matchesCache: Matches | null = null;
let downloadsCache: Downloads | null = null;
let queueCache: Queue | null = null;

// --- Library ---

export async function loadLibrary(): Promise<Library> {
  libraryCache = await loadJson(
    getLibraryPath(),
    LibrarySchema,
    DEFAULT_LIBRARY
  );
  return libraryCache;
}

export function getLibrary(): Library {
  if (!libraryCache) throw new Error("Library not loaded");
  return libraryCache;
}

export async function saveLibrary(library: Library): Promise<void> {
  libraryCache = library;
  await saveJsonAtomic(getLibraryPath(), library);
}

// --- Matches ---

export async function loadMatches(): Promise<Matches> {
  matchesCache = await loadJson(
    getMatchesPath(),
    MatchesSchema,
    DEFAULT_MATCHES
  );
  return matchesCache;
}

export function getMatches(): Matches {
  if (!matchesCache) throw new Error("Matches not loaded");
  return matchesCache;
}

export async function saveMatches(matches: Matches): Promise<void> {
  matchesCache = matches;
  await saveJsonAtomic(getMatchesPath(), matches);
}

// --- Downloads ---

export async function loadDownloads(): Promise<Downloads> {
  downloadsCache = await loadJson(
    getDownloadsPath(),
    DownloadsSchema,
    DEFAULT_DOWNLOADS
  );
  return downloadsCache;
}

export function getDownloads(): Downloads {
  if (!downloadsCache) throw new Error("Downloads not loaded");
  return downloadsCache;
}

export async function saveDownloads(downloads: Downloads): Promise<void> {
  downloadsCache = downloads;
  await saveJsonAtomic(getDownloadsPath(), downloads);
}

// --- Queue ---

export async function loadQueue(): Promise<Queue> {
  queueCache = await loadJson(getQueuePath(), QueueSchema, DEFAULT_QUEUE);

  // Jobs left "active" by a crash or quit are returned to the queue.
  if (queueCache.active.length > 0) {
    queueCache.pending = [
      ...queueCache.active.map((j) => ({ ...j, status: "pending" as const })),
      ...queueCache.pending,
    ];
    queueCache.active = [];
    await saveJsonAtomic(getQueuePath(), queueCache);
  }

  return queueCache;
}

export function getQueue(): Queue {
  if (!queueCache) throw new Error("Queue not loaded");
  return queueCache;
}

export async function saveQueue(queue: Queue): Promise<void> {
  queueCache = queue;
  await saveJsonAtomic(getQueuePath(), queue);
}
