export type Difficulty = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";

export const DIFFICULTY_ORDER: Difficulty[] = [
  "Easy",
  "Normal",
  "Hard",
  "Expert",
  "ExpertPlus",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  Easy: "Easy",
  Normal: "Normal",
  Hard: "Hard",
  Expert: "Expert",
  ExpertPlus: "Expert+",
};

export const CHARACTERISTICS = [
  "Standard",
  "OneSaber",
  "NoArrows",
  "90Degree",
  "360Degree",
  "Lawless",
  "Legacy",
] as const;

export type Config = {
  version: number;
  mapsDir: string;
  keepZip: boolean;
  minDifficulty: Difficulty;
  minRating: number;
  minVotes: number;
  characteristics: string[];
  excludeAutomapper: boolean;
  candidatesPerSong: number;
  concurrency: number;
  durationToleranceSeconds: number;
  minMatchScore: number;
  preferCuratedRanked: boolean;
  useScoreSaberFallback: boolean;
  useCuratedFallback: boolean;
  lastOpenedAt: string | null;
};

export type Thumbnail = { url: string; width?: number; height?: number };

export type LibraryItem = {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  album: string | null;
  durationText: string | null;
  durationSeconds: number | null;
  thumbnails: Thumbnail[];
  isAvailable: boolean;
  inLibrary: boolean;
  source?: "liked" | "search";
  lastSeenAt: string;
};

/** A YouTube Music search hit, before it is added to the library. */
export type SongSearchResult = {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  album: string | null;
  durationText: string | null;
  durationSeconds: number | null;
  thumbnails: Thumbnail[];
  isAvailable: boolean;
};

export type Library = {
  version: number;
  lastFullSyncAt: string | null;
  lastSyncStatus: string;
  items: LibraryItem[];
};

export type MapDiff = {
  characteristic: string;
  difficulty: string;
  nps: number;
  njs: number;
  notes: number;
  bombs: number;
  obstacles: number;
  seconds: number;
  stars: number | null;
};

export type MapCandidate = {
  mapId: string;
  hash: string;
  name: string;
  songName: string;
  songAuthorName: string;
  levelAuthorName: string;
  uploader: string;
  bpm: number;
  duration: number;
  rating: number;
  upvotes: number;
  downvotes: number;
  downloads: number;
  automapper: boolean;
  ranked: boolean;
  curated: boolean;
  tags: string[];
  coverURL: string;
  previewURL: string;
  downloadURL: string;
  uploaded: string;
  diffs: MapDiff[];
  source: "beatsaver" | "beatsaver-curated" | "scoresaber";
  matchScore: number;
  matchReasons: string[];
};

export type MatchStatus = "pending" | "added" | "skipped" | "no_match";

export type Match = {
  songId: string;
  videoId: string;
  status: MatchStatus;
  candidates: MapCandidate[];
  chosenMapId: string | null;
  /** Every map accepted for this song; read via chosenMapIdsOf. */
  chosenMapIds?: string[];
  searchedAt: string;
  /** When first found; preserved across re-searches. Drives "Found order". */
  foundAt?: string;
  decidedAt: string | null;
};

/** Accepted maps for a song, tolerating records from before multi-select. */
export function chosenMapIdsOf(match: {
  chosenMapId: string | null;
  chosenMapIds?: string[];
}): string[] {
  if (match.chosenMapIds && match.chosenMapIds.length > 0) {
    return match.chosenMapIds;
  }
  return match.chosenMapId ? [match.chosenMapId] : [];
}

export type Matches = {
  version: number;
  lastSearchAt: string | null;
  items: Record<string, Match>;
};

export type DownloadRecord = {
  mapId: string;
  songId: string;
  hash: string;
  name: string;
  status: "queued" | "downloading" | "extracting" | "completed" | "failed";
  folderPath: string;
  downloadedAt: string;
  sourceUrl: string;
  error: string | null;
  /** Map details as of queueing; absent on records written before this existed. */
  candidate?: MapCandidate;
};

export type Downloads = {
  version: number;
  items: Record<string, DownloadRecord>;
};

export type Job = {
  id: string;
  songId: string;
  mapId: string;
  status: string;
  attempts: number;
  error: string | null;
  createdAt: string;
};

export type Queue = {
  version: number;
  active: Job[];
  pending: Job[];
  failed: Job[];
};

export type DecisionResult = {
  success: boolean;
  queued: number;
  error?: string;
};

export type ElectronAPI = {
  auth: {
    status: () => Promise<{ isAuthenticated: boolean; provider: string | null }>;
    import: (cookies: string) => Promise<{ success: boolean; error?: string }>;
    browserLogin: () => Promise<{ success: boolean; error?: string }>;
    clear: () => Promise<{ success: boolean }>;
  };
  library: {
    getAll: () => Promise<Library>;
    sync: () => Promise<{ success: boolean; count?: number; error?: string }>;
    search: (query: string) => Promise<{
      success: boolean;
      songs: SongSearchResult[];
      error?: string;
    }>;
    addSong: (song: SongSearchResult) => Promise<{
      success: boolean;
      item?: LibraryItem;
      error?: string;
    }>;
    /** Top of the YouTube Music listening history; null when it is empty. */
    lastPlayed: () => Promise<{
      success: boolean;
      song: SongSearchResult | null;
      error?: string;
    }>;
  };
  matches: {
    getAll: () => Promise<Matches>;
    search: (options?: {
      includeDecided?: boolean;
      retryNoMatch?: boolean;
    }) => Promise<{
      success: boolean;
      searched?: number;
      found?: number;
      noMatch?: number;
      error?: string;
    }>;
    searchOne: (songId: string) => Promise<{
      success: boolean;
      candidateCount?: number;
      error?: string;
    }>;
    cancelSearch: () => Promise<{ success: boolean }>;
    isSearching: () => Promise<boolean>;
    add: (songId: string, mapIds: string[]) => Promise<DecisionResult>;
    skip: (songId: string) => Promise<DecisionResult>;
    reset: (songId: string) => Promise<DecisionResult>;
    resetAll: () => Promise<DecisionResult>;
    addMany: (
      selections: { songId: string; mapId: string }[]
    ) => Promise<DecisionResult>;
    addAll: () => Promise<DecisionResult>;
    openBeatSaver: (mapId: string) => Promise<void>;
    openYouTube: (videoId: string) => Promise<void>;
  };
  downloads: {
    getQueue: () => Promise<Queue>;
    getDownloads: () => Promise<Downloads>;
    retryFailed: () => Promise<{ success: boolean; count?: number; error?: string }>;
    resume: () => Promise<{ success: boolean }>;
    pauseAll: () => Promise<{ success: boolean }>;
    openFolder: (mapId?: string) => Promise<void>;
  };
  settings: {
    get: () => Promise<Config>;
    update: (
      partial: Partial<Config>
    ) => Promise<{ success: boolean; settings?: Config; error?: string }>;
    reset: () => Promise<{ success: boolean; settings?: Config; error?: string }>;
    selectMapsDir: () => Promise<string | null>;
    openAppData: () => Promise<void>;
  };
  diagnostics: {
    getLogs: () => Promise<string>;
  };
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
};

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
