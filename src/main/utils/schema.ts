import { z } from "zod";

// --- Beat Saber vocabulary ---

/** Ordered weakest -> strongest. Index is used for ">= minDifficulty" comparisons. */
export const DIFFICULTY_ORDER = [
  "Easy",
  "Normal",
  "Hard",
  "Expert",
  "ExpertPlus",
] as const;

export const DifficultyEnum = z.enum(DIFFICULTY_ORDER);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export function difficultyRank(d: string): number {
  const i = (DIFFICULTY_ORDER as readonly string[]).indexOf(d);
  return i === -1 ? -1 : i;
}

/** Game modes BeatSaver reports as "characteristic". */
export const CHARACTERISTICS = [
  "Standard",
  "OneSaber",
  "NoArrows",
  "90Degree",
  "360Degree",
  "Lawless",
  "Legacy",
] as const;

// --- Config ---

export const ConfigSchema = z.object({
  version: z.literal(1),
  /** Where extracted maps are written (a Beat Saber CustomLevels folder). */
  mapsDir: z.string(),
  /** Keep the downloaded .zip next to the extracted folder. */
  keepZip: z.boolean(),
  /** Minimum difficulty a map must offer to be considered a match. */
  minDifficulty: DifficultyEnum,
  /** Minimum BeatSaver rating (0-1). 0.8 == "80%+". */
  minRating: z.number().min(0).max(1),
  /** Only accept maps with at least this many votes (guards against 100% of 1 vote). */
  minVotes: z.number().int().min(0),
  /** Game modes to accept. */
  characteristics: z.array(z.string()).min(1),
  /** Reject maps flagged as AI/automapped. */
  excludeAutomapper: z.boolean(),
  /** How many candidate maps to offer per song. */
  candidatesPerSong: z.number().int().min(1).max(20),
  /** Parallel map downloads. */
  concurrency: z.number().int().min(1).max(8),
  /** Reject a candidate whose length differs from the YouTube track by more than this. */
  durationToleranceSeconds: z.number().int().min(0),
  /** Minimum match confidence (0-1) before a candidate is shown at all. */
  minMatchScore: z.number().min(0).max(1),
  /**
   * Order candidates by match confidence first, then break near-ties in
   * favour of curated maps, then ranked ones, then everything else.
   * Optional so configs written before this setting existed still load.
   */
  preferCuratedRanked: z.boolean().default(true),
  /** Consult ScoreSaber when BeatSaver text search comes up empty. */
  useScoreSaberFallback: z.boolean(),
  /** Consult the BeastSaber-curated pool when plain search comes up empty. */
  useCuratedFallback: z.boolean(),
  lastOpenedAt: z.string().nullable(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = {
  version: 1,
  mapsDir: "",
  keepZip: false,
  minDifficulty: "Expert",
  minRating: 0.8,
  minVotes: 10,
  characteristics: ["Standard"],
  excludeAutomapper: true,
  candidatesPerSong: 5,
  concurrency: 3,
  durationToleranceSeconds: 30,
  minMatchScore: 0.45,
  preferCuratedRanked: true,
  useScoreSaberFallback: true,
  useCuratedFallback: true,
  lastOpenedAt: null,
};

// --- Auth (YouTube Music cookies) ---

export const AuthSchema = z.object({
  version: z.literal(1),
  provider: z.string(),
  encrypted: z.boolean(),
  ciphertextBase64: z.string(),
});

export type Auth = z.infer<typeof AuthSchema>;

// --- Library (YouTube Music liked songs) ---

export const ThumbnailSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type Thumbnail = z.infer<typeof ThumbnailSchema>;

export const LibraryItemSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  title: z.string(),
  artists: z.array(z.string()),
  album: z.string().nullable(),
  durationText: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  thumbnails: z.array(ThumbnailSchema),
  isAvailable: z.boolean(),
  inLibrary: z.boolean(),
  /**
   * How this song entered the library: pulled from your likes, or added by
   * hand from a search. Optional so libraries written before this field
   * existed still load.
   */
  source: z.enum(["liked", "search"]).optional().default("liked"),
  lastSeenAt: z.string(),
});

export type LibraryItem = z.infer<typeof LibraryItemSchema>;

export const LibrarySchema = z.object({
  version: z.literal(1),
  lastFullSyncAt: z.string().nullable(),
  lastSyncStatus: z.enum(["success", "failed", "never"]),
  items: z.array(LibraryItemSchema),
});

export type Library = z.infer<typeof LibrarySchema>;

export const DEFAULT_LIBRARY: Library = {
  version: 1,
  lastFullSyncAt: null,
  lastSyncStatus: "never",
  items: [],
};

// --- Beat Saber map candidates ---

export const MapDiffSchema = z.object({
  characteristic: z.string(),
  difficulty: z.string(),
  /** Notes per second - the practical "speed" of the chart. */
  nps: z.number(),
  /** Note jump speed - how fast blocks fly at you. */
  njs: z.number(),
  /** Block count. */
  notes: z.number(),
  bombs: z.number(),
  obstacles: z.number(),
  /** Chart length in seconds. */
  seconds: z.number(),
  stars: z.number().nullable(),
});

export type MapDiff = z.infer<typeof MapDiffSchema>;

export const MapCandidateSchema = z.object({
  /** BeatSaver key, e.g. "1fef". */
  mapId: z.string(),
  hash: z.string(),
  name: z.string(),
  songName: z.string(),
  songAuthorName: z.string(),
  levelAuthorName: z.string(),
  uploader: z.string(),
  bpm: z.number(),
  /** Song length in seconds. */
  duration: z.number(),
  /** BeatSaver score, 0-1. */
  rating: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  downloads: z.number(),
  automapper: z.boolean(),
  ranked: z.boolean(),
  curated: z.boolean(),
  tags: z.array(z.string()),
  coverURL: z.string(),
  previewURL: z.string(),
  downloadURL: z.string(),
  uploaded: z.string(),
  diffs: z.array(MapDiffSchema),
  /** Which provider surfaced this candidate. */
  source: z.enum(["beatsaver", "beatsaver-curated", "scoresaber"]),
  /** 0-1 confidence that this map is the same song as the YouTube track. */
  matchScore: z.number(),
  /** Human-readable reasons behind matchScore, for the card. */
  matchReasons: z.array(z.string()),
});

export type MapCandidate = z.infer<typeof MapCandidateSchema>;

// --- Matches (one per liked song) ---

export const MatchStatusEnum = z.enum([
  "pending", // awaiting an Add/Skip decision
  "added", // user accepted a map
  "skipped", // user rejected the song
  "no_match", // search found nothing that passed the filters
]);

export type MatchStatus = z.infer<typeof MatchStatusEnum>;

export const MatchSchema = z.object({
  songId: z.string(),
  videoId: z.string(),
  status: MatchStatusEnum,
  candidates: z.array(MapCandidateSchema),
  /**
   * First map accepted for this song. Retained so older data keeps working
   * and so there is always a single "primary" pick.
   */
  chosenMapId: z.string().nullable(),
  /**
   * Every map accepted for this song - a song can legitimately be worth
   * several charts. Optional so matches written before multi-select still
   * load; read it through `chosenMapIdsOf` rather than directly.
   */
  chosenMapIds: z.array(z.string()).optional(),
  /** When this song was last searched; changes on every re-search. */
  searchedAt: z.string(),
  /**
   * When this song was *first* searched, preserved across re-searches.
   *
   * Drives the review list's "found order". Using `searchedAt` for that would
   * let a re-search shuffle entries the user is part-way through reviewing,
   * which is exactly what a stable order is meant to prevent.
   * Optional so matches written before this field existed still load.
   */
  foundAt: z.string().optional(),
  decidedAt: z.string().nullable(),
});

export type Match = z.infer<typeof MatchSchema>;

/**
 * Every map accepted for a song, reading either the multi-select field or the
 * single-pick one that predates it.
 */
export function chosenMapIdsOf(match: {
  chosenMapId: string | null;
  chosenMapIds?: string[];
}): string[] {
  if (match.chosenMapIds && match.chosenMapIds.length > 0) {
    return match.chosenMapIds;
  }
  return match.chosenMapId ? [match.chosenMapId] : [];
}

export const MatchesSchema = z.object({
  version: z.literal(1),
  lastSearchAt: z.string().nullable(),
  items: z.record(z.string(), MatchSchema),
});

export type Matches = z.infer<typeof MatchesSchema>;

export const DEFAULT_MATCHES: Matches = {
  version: 1,
  lastSearchAt: null,
  items: {},
};

// --- Downloads ---

export const DownloadStatusEnum = z.enum([
  "queued",
  "downloading",
  "extracting",
  "completed",
  "failed",
]);

export type DownloadStatus = z.infer<typeof DownloadStatusEnum>;

export const DownloadRecordSchema = z.object({
  mapId: z.string(),
  songId: z.string(),
  hash: z.string(),
  name: z.string(),
  status: DownloadStatusEnum,
  folderPath: z.string(),
  downloadedAt: z.string(),
  sourceUrl: z.string(),
  error: z.string().nullable(),
  /**
   * Snapshot of the map as it was when queued.
   *
   * Keeps a download self-contained: the Downloads view can render a full card
   * without reaching into `matches.json`, and a later re-search that rewrites
   * a song's candidates cannot strip an installed map of its details.
   * Optional so records written before this field existed still load.
   */
  candidate: MapCandidateSchema.optional(),
});

export type DownloadRecord = z.infer<typeof DownloadRecordSchema>;

export const DownloadsSchema = z.object({
  version: z.literal(1),
  /** Keyed by mapId, so the same map is never installed twice. */
  items: z.record(z.string(), DownloadRecordSchema),
});

export type Downloads = z.infer<typeof DownloadsSchema>;

export const DEFAULT_DOWNLOADS: Downloads = {
  version: 1,
  items: {},
};

// --- Queue ---

export const JobSchema = z.object({
  id: z.string(),
  songId: z.string(),
  mapId: z.string(),
  status: z.enum(["pending", "active", "completed", "failed"]),
  attempts: z.number().int(),
  error: z.string().nullable(),
  createdAt: z.string(),
});

export type Job = z.infer<typeof JobSchema>;

export const QueueSchema = z.object({
  version: z.literal(1),
  active: z.array(JobSchema),
  pending: z.array(JobSchema),
  failed: z.array(JobSchema),
});

export type Queue = z.infer<typeof QueueSchema>;

export const DEFAULT_QUEUE: Queue = {
  version: 1,
  active: [],
  pending: [],
  failed: [],
};
