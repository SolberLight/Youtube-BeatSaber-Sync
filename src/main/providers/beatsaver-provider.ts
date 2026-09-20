import { getJson, httpGet } from "./http";
import type { MapSearchFilters, MapSource, RawCandidate } from "./map-source";
import type { MapDiff } from "../utils/schema";
import log from "electron-log/main";

const API_BASE = "https://api.beatsaver.com";

// --- Shape of the BeatSaver responses we consume ---

interface BsDiff {
  characteristic?: string;
  difficulty?: string;
  nps?: number;
  njs?: number;
  notes?: number;
  bombs?: number;
  obstacles?: number;
  seconds?: number;
  stars?: number | null;
}

interface BsVersion {
  hash?: string;
  key?: string;
  state?: string;
  diffs?: BsDiff[];
  downloadURL?: string;
  coverURL?: string;
  previewURL?: string;
}

interface BsMap {
  id?: string;
  name?: string;
  automapper?: boolean;
  ranked?: boolean;
  curator?: { name?: string } | null;
  curatedAt?: string | null;
  tags?: string[];
  uploaded?: string;
  uploader?: { name?: string };
  metadata?: {
    bpm?: number;
    duration?: number;
    songName?: string;
    songSubName?: string;
    songAuthorName?: string;
    levelAuthorName?: string;
  };
  stats?: {
    score?: number;
    upvotes?: number;
    downvotes?: number;
    downloads?: number;
  };
  versions?: BsVersion[];
}

interface BsSearchResponse {
  docs?: BsMap[];
}

function normalizeDiff(d: BsDiff): MapDiff {
  return {
    characteristic: d.characteristic ?? "Standard",
    difficulty: d.difficulty ?? "Expert",
    nps: d.nps ?? 0,
    njs: d.njs ?? 0,
    notes: d.notes ?? 0,
    bombs: d.bombs ?? 0,
    obstacles: d.obstacles ?? 0,
    seconds: d.seconds ?? 0,
    stars: d.stars ?? null,
  };
}

/**
 * Convert a BeatSaver map into our candidate shape.
 * Returns null for maps with no published, downloadable version.
 */
export function normalizeMap(
  map: BsMap,
  source: RawCandidate["source"] = "beatsaver"
): RawCandidate | null {
  const id = map.id;
  if (!id) return null;

  // Prefer the published version; fall back to the newest entry.
  const versions = map.versions ?? [];
  const version =
    versions.find((v) => v.state === "Published" && v.downloadURL) ??
    versions.find((v) => v.downloadURL);

  if (!version?.downloadURL || !version.hash) return null;

  const metadata = map.metadata ?? {};
  const stats = map.stats ?? {};

  return {
    mapId: id,
    hash: version.hash,
    name: map.name ?? metadata.songName ?? "Unknown",
    songName: metadata.songName ?? "",
    songAuthorName: metadata.songAuthorName ?? "",
    levelAuthorName: metadata.levelAuthorName ?? "",
    uploader: map.uploader?.name ?? "",
    bpm: metadata.bpm ?? 0,
    duration: metadata.duration ?? 0,
    rating: stats.score ?? 0,
    upvotes: stats.upvotes ?? 0,
    downvotes: stats.downvotes ?? 0,
    downloads: stats.downloads ?? 0,
    automapper: map.automapper === true,
    ranked: map.ranked === true,
    curated: Boolean(map.curatedAt) || Boolean(map.curator),
    tags: map.tags ?? [],
    coverURL: version.coverURL ?? "",
    previewURL: version.previewURL ?? "",
    downloadURL: version.downloadURL,
    uploaded: map.uploaded ?? "",
    diffs: (version.diffs ?? []).map(normalizeDiff),
    source,
  };
}

function buildSearchUrl(query: string, filters: MapSearchFilters): string {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("sortOrder", "Relevance");

  if (filters.minRating != null) {
    params.set("minRating", String(filters.minRating));
  }
  if (filters.minVotes != null && filters.minVotes > 0) {
    params.set("minVotes", String(filters.minVotes));
  }
  // BeatSaver already leaves automapped maps out unless asked for them, so
  // excluding is the default and needs no parameter. Note that sending
  // `automapper=false` does NOT mean "exclude" - it returns only AI maps.
  if (!filters.excludeAutomapper) {
    params.set("automapper", "true");
  }
  if (filters.curatedOnly) {
    params.set("curated", "true");
  }
  params.set("pageSize", String(filters.pageSize ?? 20));

  return `${API_BASE}/search/text/0?${params.toString()}`;
}

export class BeatSaverProvider implements MapSource {
  readonly id = "beatsaver";

  async search(
    query: string,
    filters: MapSearchFilters,
    signal?: AbortSignal
  ): Promise<RawCandidate[]> {
    if (!query.trim()) return [];

    const url = buildSearchUrl(query, filters);
    const source: RawCandidate["source"] = filters.curatedOnly
      ? "beatsaver-curated"
      : "beatsaver";

    try {
      const data = await getJson<BsSearchResponse>(url, { signal });
      const docs = data.docs ?? [];
      return docs
        .map((m) => normalizeMap(m, source))
        .filter((m): m is RawCandidate => m !== null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`BeatSaver search failed for "${query}": ${msg}`);
      return [];
    }
  }

  /** Resolve a map by its SHA1 hash - used to turn ScoreSaber hits into maps. */
  async getByHash(
    hash: string,
    source: RawCandidate["source"] = "beatsaver",
    signal?: AbortSignal
  ): Promise<RawCandidate | null> {
    try {
      const map = await getJson<BsMap>(
        `${API_BASE}/maps/hash/${hash.toLowerCase()}`,
        { signal }
      );
      return normalizeMap(map, source);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`BeatSaver hash lookup failed for ${hash}: ${msg}`);
      return null;
    }
  }

  /**
   * Resolve up to 50 hashes in one call.
   * The bulk endpoint returns an object keyed by (lowercase) hash.
   */
  async getByHashes(
    hashes: string[],
    source: RawCandidate["source"] = "beatsaver",
    signal?: AbortSignal
  ): Promise<RawCandidate[]> {
    if (hashes.length === 0) return [];

    const batch = hashes.slice(0, 50).map((h) => h.toLowerCase());

    try {
      const data = await getJson<Record<string, BsMap | null>>(
        `${API_BASE}/maps/hash/${batch.join(",")}`,
        { signal }
      );

      // A single hash returns the map directly rather than a keyed object.
      const maps: BsMap[] =
        data && typeof data === "object" && "id" in data
          ? [data as unknown as BsMap]
          : Object.values(data ?? {}).filter((m): m is BsMap => m != null);

      return maps
        .map((m) => normalizeMap(m, source))
        .filter((m): m is RawCandidate => m !== null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`BeatSaver bulk hash lookup failed: ${msg}`);
      return [];
    }
  }

  /** Stream a map archive into memory, reporting progress as bytes arrive. */
  async downloadZip(
    downloadURL: string,
    onProgress?: (received: number, total: number | null) => void,
    signal?: AbortSignal
  ): Promise<Uint8Array> {
    const response = await httpGet(downloadURL, {
      signal,
      timeoutMs: 120000,
      retries: 3,
    });

    const lengthHeader = response.headers.get("content-length");
    const total = lengthHeader ? Number(lengthHeader) : null;

    if (!response.body) {
      const buffer = await response.arrayBuffer();
      onProgress?.(buffer.byteLength, total);
      return new Uint8Array(buffer);
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      chunks.push(value);
      received += value.length;
      onProgress?.(received, total);
    }

    const out = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }

    return out;
  }
}
