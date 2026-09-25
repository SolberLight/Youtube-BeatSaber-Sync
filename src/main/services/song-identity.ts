import { normalizeArtist, normalizeTitle } from "../utils/text";
import type { Library, LibraryItem, Match, Matches } from "../utils/schema";

/**
 * YouTube Music gives the same recording a different videoId per release, so
 * liking a track from its single, its album and the deluxe edition yields
 * three library entries. They would all map to the same Beat Saber charts, so
 * the review flow treats them as one song.
 */
export function songKey(song: Pick<LibraryItem, "title" | "artists">): string {
  const artists = song.artists.map(normalizeArtist).filter(Boolean).sort();
  return `${normalizeTitle(stripLooseFeat(song.title))}|${artists.join(",")}`;
}

const BRACKETED_FEAT_RE = /[\(\[]\s*(feat|ft|featuring|with)\b[^)\]]*[\)\]]/gi;
const LOOSE_FEAT_RE = /\b(feat|ft|featuring|with)\b\.?/gi;

/**
 * `normalizeTitle` drops everything after an unbracketed "ft." - right for
 * map matching, but it would fold "Obsidia Ft. CoMa - Falling" and
 * "Obsidia Ft. CoMa - Take Me" into one song. Only bracketed credits are
 * noise here; loose ones are defused so the rest of the title survives.
 */
function stripLooseFeat(title: string): string {
  return title
    .replace(BRACKETED_FEAT_RE, " ")
    .replace(LOOSE_FEAT_RE, (word) => `${word.replace(".", "")}x`);
}

/** A decision the user already made should be the copy that stays visible. */
const STATUS_RANK: Record<Match["status"], number> = {
  added: 0,
  skipped: 1,
  pending: 2,
  no_match: 3,
};

function compareForCanonical(a: Match, b: Match): number {
  const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (byStatus !== 0) return byStatus;
  const byFound = (a.foundAt ?? a.searchedAt).localeCompare(
    b.foundAt ?? b.searchedAt
  );
  return byFound !== 0 ? byFound : a.songId.localeCompare(b.songId);
}

/**
 * Song ids whose match record duplicates another release of the same song.
 * One record per song is kept; the rest are hidden from review and bulk
 * actions. Nothing is deleted, so the hidden records keep their decisions.
 */
export function duplicateSongIds(library: Library, matches: Matches): Set<string> {
  const groups = new Map<string, Match[]>();

  for (const song of library.items) {
    const match = matches.items[song.id];
    if (!match) continue;
    const key = songKey(song);
    const group = groups.get(key);
    if (group) group.push(match);
    else groups.set(key, [match]);
  }

  const hidden = new Set<string>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.sort(compareForCanonical);
    for (const dup of group.slice(1)) hidden.add(dup.songId);
  }
  return hidden;
}
