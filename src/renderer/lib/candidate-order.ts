import type { MapCandidate } from "./types";

/**
 * Candidate ordering, applied at display time.
 *
 * Mirrors `compareCandidates` in the main process's `services/matching.ts`.
 * The duplication is deliberate: sorting here as well as at search time means
 * changing the preference re-orders every match already on disk immediately,
 * instead of only affecting songs searched from then on. Keep the two in step.
 *
 * Match confidence leads, compared on the *displayed* whole percentage so the
 * order can never contradict what the card shows, and so the comparison stays
 * transitive. Equal percentages are a genuine tie, and that is where the
 * quality signals decide: curated first, then ranked, then rating and
 * popularity.
 */
export function compareCandidates(
  a: MapCandidate,
  b: MapCandidate,
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

/** A song's candidates in display order. Never mutates the input. */
export function orderCandidates(
  candidates: MapCandidate[],
  preferCuratedRanked: boolean
): MapCandidate[] {
  return [...candidates].sort((a, b) =>
    compareCandidates(a, b, preferCuratedRanked)
  );
}
