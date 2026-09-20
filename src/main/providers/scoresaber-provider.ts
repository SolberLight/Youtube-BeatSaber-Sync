import { getJson } from "./http";
import type { MapSearchFilters, MapSource, RawCandidate } from "./map-source";
import { BeatSaverProvider } from "./beatsaver-provider";
import log from "electron-log/main";

const API_BASE = "https://scoresaber.com/api";

interface SsLeaderboard {
  songHash?: string;
  songName?: string;
  songAuthorName?: string;
  levelAuthorName?: string;
}

interface SsResponse {
  leaderboards?: SsLeaderboard[];
}

/**
 * ScoreSaber indexes leaderboards, not downloadable maps - but every
 * leaderboard carries the map's SHA1 hash, which BeatSaver can resolve back
 * into a real map with a download URL.
 *
 * This is the last resort: it finds maps whose metadata reads differently on
 * BeatSaver than on YouTube, because ScoreSaber's search sometimes indexes
 * the song under a name BeatSaver's text search misses.
 */
export class ScoreSaberProvider implements MapSource {
  readonly id = "scoresaber";

  constructor(private readonly beatSaver: BeatSaverProvider) {}

  async search(
    query: string,
    filters: MapSearchFilters,
    signal?: AbortSignal
  ): Promise<RawCandidate[]> {
    if (!query.trim()) return [];

    const url = `${API_BASE}/leaderboards?search=${encodeURIComponent(
      query
    )}&page=1`;

    let leaderboards: SsLeaderboard[];
    try {
      const data = await getJson<SsResponse>(url, { signal });
      leaderboards = data.leaderboards ?? [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`ScoreSaber search failed for "${query}": ${msg}`);
      return [];
    }

    // One leaderboard exists per difficulty, so the same map appears several
    // times. Collapse to distinct hashes before hitting BeatSaver.
    const hashes: string[] = [];
    const seen = new Set<string>();
    for (const lb of leaderboards) {
      const hash = lb.songHash?.toLowerCase();
      if (!hash || seen.has(hash)) continue;
      seen.add(hash);
      hashes.push(hash);
    }

    if (hashes.length === 0) return [];

    const limit = filters.pageSize ?? 20;
    const candidates = await this.beatSaver.getByHashes(
      hashes.slice(0, limit),
      "scoresaber",
      signal
    );

    log.info(
      `ScoreSaber fallback for "${query}": ${hashes.length} hashes -> ${candidates.length} maps`
    );

    return candidates;
  }
}
