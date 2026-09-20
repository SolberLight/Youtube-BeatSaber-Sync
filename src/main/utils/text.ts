/**
 * Text normalisation and similarity helpers used to decide whether a Beat Saber
 * map is the same song as a YouTube Music track.
 *
 * YouTube Music titles carry a lot of noise that mappers never reproduce
 * ("(Official Video)", "[Lyrics]", "feat. …", "- Topic"), so most of the work
 * here is stripping that away before anything is compared.
 */

/** Parenthetical/bracketed junk that never appears in a map's song name. */
const NOISE_PHRASES = [
  "official video",
  "official music video",
  "official audio",
  "official lyric video",
  "official visualizer",
  "music video",
  "lyric video",
  "lyrics",
  "audio",
  "visualizer",
  "hd",
  "hq",
  "4k",
  "explicit",
  "clean",
  "radio edit",
  "album version",
  "single version",
  "full version",
  "original mix",
  "bonus track",
];

/** Trailing qualifiers such as "(Remastered 2011)" or "(2019 Remaster)". */
const REMASTER_RE = /\b(re-?master(ed)?|anniversary|deluxe|expanded)\b/i;

/** Featuring credits: "feat. X", "ft X", "featuring X". */
const FEAT_RE = /\s*[\(\[]?\s*\b(feat|ft|featuring|with)\b\.?\s+[^)\]]*[\)\]]?/gi;

/**
 * Strip a parenthetical group only when it is noise. "(Acoustic)" or
 * "(Nightcore)" genuinely distinguish versions, so those are kept.
 */
function stripNoiseGroups(input: string): string {
  return input.replace(/[\(\[]([^)\]]*)[\)\]]/g, (whole, inner: string) => {
    const content = inner.trim().toLowerCase();
    if (!content) return " ";
    if (NOISE_PHRASES.includes(content)) return " ";
    if (REMASTER_RE.test(content)) return " ";
    // "(Official Video 2019)" etc. - noise phrase plus a year.
    const withoutYear = content.replace(/\b(19|20)\d{2}\b/g, "").trim();
    if (NOISE_PHRASES.includes(withoutYear)) return " ";
    return whole;
  });
}

/** Lowercase, de-noise and reduce to comparable words. */
export function normalizeTitle(raw: string): string {
  let s = raw.toLowerCase();

  s = stripNoiseGroups(s);
  s = s.replace(FEAT_RE, " ");

  // Unify separators and drop punctuation that mappers type inconsistently.
  s = s.replace(/[’'`´]/g, "");
  s = s.replace(/&/g, " and ");
  s = s.replace(/[_\-–—/\\|:;,.!?"“”\[\]\(\)\{\}*+~^=<>#@$%]/g, " ");

  // Strip accents (e.g. "Déjà" -> "deja").
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  return s.replace(/\s+/g, " ").trim();
}

/** Normalise an artist name and drop the "- Topic" suffix YouTube adds. */
export function normalizeArtist(raw: string): string {
  return normalizeTitle(raw.replace(/\s*-\s*topic\s*$/i, ""));
}

/** Words too common to carry matching signal on their own. */
const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "to",
  "in",
  "is",
  "it",
  "for",
  "on",
  "vs",
  "feat",
  "ft",
  "remix",
  "cover",
  "version",
  "ver",
]);

export function tokenize(normalized: string): string[] {
  return normalized.split(" ").filter((t) => t.length > 0);
}

function contentTokens(normalized: string): string[] {
  const all = tokenize(normalized);
  const kept = all.filter((t) => !STOP_WORDS.has(t));
  // If a title is nothing but stop words ("The A Team"), keep them all.
  return kept.length > 0 ? kept : all;
}

/** Levenshtein distance with a rolling two-row buffer. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[b.length];
}

/** Levenshtein similarity mapped to 0-1. */
export function levenshteinRatio(a: string, b: string): number {
  if (!a && !b) return 1;
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

/**
 * Token overlap weighted toward the shorter side, so
 * "believer" vs "believer imagine dragons 100k ver" still scores high.
 */
export function tokenOverlap(a: string, b: string): number {
  const ta = new Set(contentTokens(a));
  const tb = new Set(contentTokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;

  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;

  return shared / Math.min(ta.size, tb.size);
}

/**
 * Similarity of two free-text strings, 0-1.
 * Blends token overlap (robust to extra words) with edit distance
 * (robust to typos and spacing), and rewards a clean containment.
 */
export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const overlap = tokenOverlap(a, b);
  const edit = levenshteinRatio(a, b);

  let score = overlap * 0.7 + edit * 0.3;

  // One string fully containing the other is a strong signal that the
  // difference is only decoration ("believer" inside "believer 100k ver").
  if (a.includes(b) || b.includes(a)) {
    score = Math.max(score, 0.85);
  }

  return Math.min(1, score);
}

/** Seconds -> "3:24". */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !isFinite(seconds) || seconds < 0) return "-";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Make a string safe to use as a folder name on Windows and macOS. */
export function sanitizeFolderName(raw: string): string {
  return raw
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 120)
    .trim();
}
