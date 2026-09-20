import type { MapCandidate, MapDiff } from "../utils/schema";

/** Filters pushed down to the remote API where it supports them. */
export interface MapSearchFilters {
  minRating?: number;
  minVotes?: number;
  excludeAutomapper?: boolean;
  /** Restrict to the BeastSaber-curated pool. */
  curatedOnly?: boolean;
  pageSize?: number;
}

/** A candidate before match scoring has been applied. */
export type RawCandidate = Omit<MapCandidate, "matchScore" | "matchReasons">;

export interface MapSource {
  readonly id: string;
  search(
    query: string,
    filters: MapSearchFilters,
    signal?: AbortSignal
  ): Promise<RawCandidate[]>;
}

export type { MapDiff };
