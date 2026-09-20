/**
 * Pure matching logic: deciding whether a Beat Saber map is the same song as a
 * YouTube Music track, and whether it clears the user's filters.
 *
 * Deliberately free of Electron and I/O so it can be reasoned about and
 * exercised on its own; `match-service` wraps it with the API calls,
 * persistence and progress events.
 */
import type { RawCandidate } from "../providers/map-source";
import { difficultyRank, type Config, type LibraryItem } from "../utils/schema";
import { normalizeArtist, normalizeTitle, similarity } from "../utils/text";

export interface Scored {
  score: number;
  reasons: string[];
  durationDelta: number | null;
  /** Title similarity on its own, kept so it can be gated independently. */
  titleScore: number;
}

/**
 * A map whose title barely resembles the track is never the right answer, no
 * matter how well the artist and length line up - that combination describes
 * a *different song by the same artist*, which is the most common way a
 * naive scorer goes wrong.
 */
export const MIN_TITLE_SIMILARITY = 0.4;

/**
 * How close two track lengths are, 0-1.
 * Near-exact (<=3s) scores 1; the score decays to 0 at the tolerance limit.
 */
export function durationScore(
  songSeconds: number | null,
  mapSeconds: number,
  toleranceSeconds: number
): number | null {
  if (songSeconds == null || songSeconds <= 0 || mapSeconds <= 0) return null;

  const delta = Math.abs(songSeconds - mapSeconds);
  if (delta <= 3) return 1;
  if (toleranceSeconds <= 0) return 0;

  return Math.max(0, 1 - delta / toleranceSeconds);
}

/**
 * Confidence that `candidate` is the same song as `song`.
 *
 * Compared three ways, because mappers split artist and title inconsistently:
 * the YouTube title against the map's song name, the YouTube artist against
 * the map's song author, and the whole "artist title" string against the map's
 * display name (which is very often "Artist - Title").
 */
export function scoreCandidate(
  song: LibraryItem,
  candidate: RawCandidate,
  config: Config
): Scored {
  const ytTitle = normalizeTitle(song.title);
  const ytArtist = normalizeArtist(song.artists[0] ?? "");
  const ytCombined = `${ytArtist} ${ytTitle}`.trim();

  const mapSong = normalizeTitle(candidate.songName);
  const mapArtist = normalizeArtist(candidate.songAuthorName);
  const mapName = normalizeTitle(candidate.name);

  const titleScore = Math.max(
    similarity(ytTitle, mapSong),
    similarity(ytTitle, mapName)
  );

  const artistScore = ytArtist
    ? Math.max(
        similarity(ytArtist, mapArtist),
        // "Imagine Dragons - Believer" as the map name still carries the artist.
        mapName.includes(ytArtist) ? 0.9 : 0
      )
    : 0;

  const combinedScore = Math.max(
    similarity(ytCombined, mapName),
    similarity(ytCombined, `${mapArtist} ${mapSong}`.trim())
  );

  const dur = durationScore(
    song.durationSeconds,
    candidate.duration,
    config.durationToleranceSeconds
  );

  // Title carries the most signal; artist disambiguates covers; duration
  // separates the real track from remixes and extended edits.
  let score: number;
  if (dur == null) {
    score = titleScore * 0.6 + artistScore * 0.4;
  } else {
    score = titleScore * 0.45 + artistScore * 0.3 + dur * 0.25;
  }

  // A strong whole-string match rescues cases where the split went wrong.
  score = Math.max(score, combinedScore * 0.9);

  const durationDelta =
    song.durationSeconds != null && candidate.duration > 0
      ? Math.abs(song.durationSeconds - candidate.duration)
      : null;

  const reasons: string[] = [];
  if (titleScore >= 0.85) reasons.push("Title match");
  else if (titleScore >= 0.6) reasons.push("Similar title");

  if (artistScore >= 0.85) reasons.push("Artist match");
  else if (artistScore >= 0.6) reasons.push("Similar artist");

  if (dur != null && dur >= 0.9) reasons.push("Length match");
  else if (durationDelta != null) {
    reasons.push(`Length off by ${Math.round(durationDelta)}s`);
  }

  if (candidate.ranked) reasons.push("Ranked");
  if (candidate.curated) reasons.push("Curated");

  return { score: Math.min(1, score), reasons, durationDelta, titleScore };
}

/** Does this map offer a chart at or above the configured difficulty? */
export function meetsDifficulty(
  candidate: RawCandidate,
  config: Config
): boolean {
  const wanted = difficultyRank(config.minDifficulty);
  const allowed = new Set(config.characteristics);

  return candidate.diffs.some(
    (d) =>
      allowed.has(d.characteristic) && difficultyRank(d.difficulty) >= wanted
  );
}

/** Hard gates a candidate must clear regardless of how well it matches. */
export function passesFilters(
  candidate: RawCandidate,
  scored: Scored,
  config: Config
): boolean {
  if (candidate.rating < config.minRating) return false;

  if (candidate.upvotes + candidate.downvotes < config.minVotes) return false;

  if (config.excludeAutomapper && candidate.automapper) return false;

  if (!meetsDifficulty(candidate, config)) return false;

  // Reject a strong artist/length coincidence on the wrong song.
  if (scored.titleScore < MIN_TITLE_SIMILARITY) return false;

  if (
    scored.durationDelta != null &&
    config.durationToleranceSeconds > 0 &&
    scored.durationDelta > config.durationToleranceSeconds
  ) {
    return false;
  }

  return scored.score >= config.minMatchScore;
}

/**
 * Search terms to try for a song, most specific first.
 * Artist plus title disambiguates covers; bare title is the safety net.
 */
export function buildQueries(song: LibraryItem): string[] {
  const title = song.title.trim();
  const artist = (song.artists[0] ?? "").replace(/\s*-\s*topic\s*$/i, "").trim();

  const queries: string[] = [];
  if (artist) queries.push(`${artist} ${title}`);
  queries.push(title);

  // The de-noised title, when normalisation actually changed something.
  const normalized = normalizeTitle(title);
  if (normalized && normalized !== title.toLowerCase()) {
    queries.push(normalized);
  }

  return [...new Set(queries.filter(Boolean))];
}

/** The fields candidate ordering depends on. */
export interface Orderable {
  matchScore: number;
  rating: number;
  upvotes: number;
  curated: boolean;
  ranked: boolean;
}

/**
 * Order candidates best-first: match confidence, then curated, then ranked,
 * then community rating and popularity.
 *
 * Confidence is compared on the *displayed* whole percentage rather than the
 * raw score. Two reasons: the order can never contradict what the card shows
 * (a 62% above a 64%), and it is transitive. A tolerance comparison like
 * `Math.abs(a - b) > 0.02` is not - with 0.645/0.624/0.635 the first pair
 * differs but the second ties, which lets `sort` produce an order that makes
 * no sense on screen.
 *
 * Equal percentages are a genuine tie, and that is where the quality signals
 * decide. With `preferCuratedRanked` off, those two tiers are skipped.
 *
 * NOTE: mirrored in the renderer's `lib/candidate-order.ts` so the list can be
 * re-ordered on screen the moment the setting changes. Keep the two in step.
 */
export function compareCandidates(
  a: Orderable,
  b: Orderable,
  preferCuratedRanked = true
): number {
  const aPercent = Math.round(a.matchScore * 100);
  const bPercent = Math.round(b.matchScore * 100);
  if (aPercent !== bPercent) return bPercent - aPercent;

  if (preferCuratedRanked) {
    if (a.curated !== b.curated) return a.curated ? -1 : 1;
    if (a.ranked !== b.ranked) return a.ranked ? -1 : 1;
  }

  const aRating = Math.round(a.rating * 100);
  const bRating = Math.round(b.rating * 100);
  if (aRating !== bRating) return bRating - aRating;

  return b.upvotes - a.upvotes;
}
