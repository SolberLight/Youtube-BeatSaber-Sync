import { BrowserWindow } from "electron";
import { BeatSaverProvider } from "../providers/beatsaver-provider";
import { ScoreSaberProvider } from "../providers/scoresaber-provider";
import type { RawCandidate } from "../providers/map-source";
import { getLibrary, getMatches, saveMatches } from "./cache-service";
import { getSettings } from "./settings-service";
import {
  buildQueries,
  compareCandidates,
  passesFilters,
  scoreCandidate,
} from "./matching";
import type { Config, LibraryItem, MapCandidate, Match } from "../utils/schema";
import log from "electron-log/main";

const beatSaver = new BeatSaverProvider();
const scoreSaber = new ScoreSaberProvider(beatSaver);

let searchAbort: AbortController | null = null;
let isSearching = false;

function sendToRenderer(channel: string, ...args: unknown[]) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send(channel, ...args);
}

/**
 * Find the best Beat Saber maps for one liked song.
 *
 * Sources are tried in order of trust and only escalated while the result set
 * is still thin, which keeps the common case to a single API call.
 */
export async function findCandidatesForSong(
  song: LibraryItem,
  config: Config,
  signal?: AbortSignal
): Promise<MapCandidate[]> {
  const queries = buildQueries(song);
  const filters = {
    minRating: config.minRating,
    minVotes: config.minVotes,
    excludeAutomapper: config.excludeAutomapper,
    pageSize: 20,
  };

  const byMapId = new Map<string, MapCandidate>();

  const absorb = (raw: RawCandidate[]) => {
    for (const candidate of raw) {
      if (byMapId.has(candidate.mapId)) continue;

      const scored = scoreCandidate(song, candidate, config);
      if (!passesFilters(candidate, scored, config)) continue;

      byMapId.set(candidate.mapId, {
        ...candidate,
        matchScore: scored.score,
        matchReasons: scored.reasons,
      });
    }
  };

  // 1. BeatSaver text search.
  for (const query of queries) {
    if (signal?.aborted) break;
    absorb(await beatSaver.search(query, filters, signal));
    if (byMapId.size >= config.candidatesPerSong) break;
  }

  // 2. The BeastSaber-curated pool, reachable through BeatSaver's curated flag.
  if (byMapId.size === 0 && config.useCuratedFallback && !signal?.aborted) {
    absorb(
      await beatSaver.search(
        queries[0],
        { ...filters, curatedOnly: true },
        signal
      )
    );
  }

  // 3. ScoreSaber leaderboards, resolved back through BeatSaver by hash.
  if (byMapId.size === 0 && config.useScoreSaberFallback && !signal?.aborted) {
    absorb(await scoreSaber.search(queries[0], filters, signal));
  }

  return [...byMapId.values()]
    .sort((a, b) => compareCandidates(a, b, config.preferCuratedRanked))
    .slice(0, config.candidatesPerSong);
}

/**
 * Search maps for one song right now, outside the bulk run.
 *
 * Used by the "Find maps" button on a search result, so a single lookup does
 * not require sweeping the whole library. Any existing decision for the song
 * is preserved - only the candidate list is refreshed.
 */
export async function searchMatchForSong(songId: string): Promise<{
  candidateCount: number;
}> {
  const config = getSettings();
  const library = getLibrary();
  const matches = getMatches();

  const song = library.items.find((i) => i.id === songId);
  if (!song) {
    throw new Error("That song is not in the library.");
  }

  log.info(`Searching maps on demand for "${song.title}"`);

  const candidates = await findCandidatesForSong(song, config);

  const now = new Date().toISOString();
  const existing = matches.items[songId];
  const keepsDecision =
    existing && (existing.status === "added" || existing.status === "skipped");

  matches.items[songId] = {
    songId,
    videoId: song.videoId,
    status: keepsDecision
      ? existing.status
      : candidates.length > 0
        ? "pending"
        : "no_match",
    candidates,
    chosenMapId: keepsDecision ? existing.chosenMapId : null,
    chosenMapIds: keepsDecision ? existing.chosenMapIds : [],
    searchedAt: now,
    foundAt: existing?.foundAt ?? existing?.searchedAt ?? now,
    decidedAt: keepsDecision ? existing.decidedAt : null,
  } satisfies Match;

  matches.lastSearchAt = now;
  await saveMatches(matches);

  sendToRenderer("match:finished", {
    searched: 1,
    found: candidates.length > 0 ? 1 : 0,
    noMatch: candidates.length > 0 ? 0 : 1,
  });

  return { candidateCount: candidates.length };
}

export function isSearchRunning(): boolean {
  return isSearching;
}

export function cancelSearch(): void {
  searchAbort?.abort();
  log.info("Map search cancelled");
}

export interface SearchOptions {
  /** Re-search songs that already have a decision. Decisions are preserved. */
  includeDecided?: boolean;
  /** Re-search songs previously marked no_match. */
  retryNoMatch?: boolean;
}

/**
 * Search maps for every liked song that still needs one.
 *
 * Songs the user already decided on are left alone, so a re-sync only ever
 * surfaces genuinely new work.
 */
export async function searchMatches(options: SearchOptions = {}): Promise<{
  searched: number;
  found: number;
  noMatch: number;
}> {
  if (isSearching) {
    throw new Error("A map search is already running.");
  }

  isSearching = true;
  searchAbort = new AbortController();
  const signal = searchAbort.signal;

  const config = getSettings();
  const library = getLibrary();
  const matches = getMatches();

  const targets = library.items.filter((item) => {
    if (!item.isAvailable) return false;
    // Liked songs, plus anything added by hand from search.
    if (!item.inLibrary && item.source !== "search") return false;

    const existing = matches.items[item.id];
    if (!existing) return true;

    if (existing.status === "added" || existing.status === "skipped") {
      return options.includeDecided === true;
    }
    if (existing.status === "no_match") {
      return options.retryNoMatch === true;
    }
    // "pending" entries are refreshed so filter changes take effect.
    return true;
  });

  log.info(`Searching maps for ${targets.length} songs...`);
  sendToRenderer("match:started", { total: targets.length });

  let found = 0;
  let noMatch = 0;
  let searched = 0;

  try {
    for (const song of targets) {
      if (signal.aborted) break;

      let candidates: MapCandidate[] = [];
      try {
        candidates = await findCandidatesForSong(song, config, signal);
      } catch (err: unknown) {
        if (signal.aborted) break;
        const msg = err instanceof Error ? err.message : String(err);
        log.warn(`Search failed for "${song.title}": ${msg}`);
      }

      const now = new Date().toISOString();
      const existing = matches.items[song.id];

      // A decided song keeps its decision; only its candidate list refreshes.
      const keepsDecision =
        existing &&
        (existing.status === "added" || existing.status === "skipped");

      const record: Match = {
        songId: song.id,
        videoId: song.videoId,
        status: keepsDecision
          ? existing.status
          : candidates.length > 0
            ? "pending"
            : "no_match",
        candidates,
        chosenMapId: keepsDecision ? existing.chosenMapId : null,
        chosenMapIds: keepsDecision ? existing.chosenMapIds : [],
        searchedAt: now,
        // Set once and kept, so the review list never reorders on a re-search.
        // Older records predate the field, so fall back to when they were
        // originally searched rather than jumping them to the bottom.
        foundAt: existing?.foundAt ?? existing?.searchedAt ?? now,
        decidedAt: keepsDecision ? existing.decidedAt : null,
      };

      matches.items[song.id] = record;

      if (candidates.length > 0) found++;
      else noMatch++;
      searched++;

      // The match travels with the progress event so the review list can fill
      // in as results arrive, rather than only once the whole run finishes.
      sendToRenderer("match:progress", {
        searched,
        total: targets.length,
        title: song.title,
        candidateCount: candidates.length,
        match: record,
      });

      // Persist periodically so a crash or quit does not lose the work.
      if (searched % 10 === 0) {
        matches.lastSearchAt = now;
        await saveMatches(matches);
      }
    }
  } finally {
    matches.lastSearchAt = new Date().toISOString();
    await saveMatches(matches);
    isSearching = false;
    searchAbort = null;
  }

  log.info(
    `Map search complete: ${searched} searched, ${found} with candidates, ${noMatch} without`
  );
  sendToRenderer("match:finished", { searched, found, noMatch });

  return { searched, found, noMatch };
}
