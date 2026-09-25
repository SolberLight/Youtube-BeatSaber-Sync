import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapCard } from "./map-card";
import { orderCandidates } from "../../lib/candidate-order";
import {
  chosenMapIdsOf,
  type Config,
  type Downloads,
  type Library,
  type LibraryItem,
  type Match,
  type Matches,
  type MatchStatus,
  statusLabel,
} from "../../lib/types";

type StatusFilter = "pending" | "added" | "skipped" | "no_match" | "all";

/**
 * "found" keeps songs in the order the search turned them up, oldest first.
 * New results append to the bottom, so a list you are part-way through
 * reviewing never reshuffles underneath you while a search is still running.
 */
type SortOrder = "found" | "score";

const PAGE_SIZE = 25;

/** Progress samples kept for the rate estimate behind the ETA. */
const RATE_WINDOW = 24;

interface SearchProgress {
  searched: number;
  total: number;
  title: string;
}

/** Seconds -> "45s", "3m 20s", "1h 4m". */
function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;

  const totalMinutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  if (totalMinutes < 60) {
    return secs > 0 ? `${totalMinutes}m ${secs}s` : `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/** A liked song paired with whatever the matcher found for it. */
interface Row {
  song: LibraryItem;
  match: Match;
}

export function MatchView() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [matches, setMatches] = useState<Matches | null>(null);
  const [downloads, setDownloads] = useState<Downloads | null>(null);
  const [config, setConfig] = useState<Config | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [sortOrder, setSortOrder] = useState<SortOrder>("found");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);

  /** Timestamps of recent progress events, used to estimate the rate. */
  const rateSamplesRef = useRef<number[]>([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busySongs, setBusySongs] = useState<Set<string>>(new Set());

  /** Maps ticked per song, so several charts can be accepted for one track. */
  const [ticked, setTicked] = useState<Record<string, string[]>>({});

  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState<SearchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadGenRef = useRef(0);

  const load = useCallback(async () => {
    const gen = ++loadGenRef.current;
    try {
      const [lib, mt, dl, cfg] = await Promise.all([
        window.api.library.getAll(),
        window.api.matches.getAll(),
        window.api.downloads.getDownloads(),
        window.api.settings.get(),
      ]);
      if (gen !== loadGenRef.current) return; // a newer load superseded this one
      setLibrary(lib);
      setMatches(mt);
      setDownloads(dl);
      setConfig(cfg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches.");
    }
  }, []);

  useEffect(() => {
    void load();
    void window.api.matches.isSearching().then(setSearching);

    const unsubs = [
      window.api.on("match:started", (data: unknown) => {
        const d = data as { total: number };
        setSearching(true);
        setProgress({ searched: 0, total: d.total, title: "" });
        setEtaSeconds(null);
        rateSamplesRef.current = [Date.now()];
      }),
      window.api.on("match:progress", (data: unknown) => {
        const d = data as SearchProgress & { match?: Match };
        setProgress({ searched: d.searched, total: d.total, title: d.title });

        // Estimate from a rolling window rather than the whole run: per-song
        // cost varies a lot once fallback sources get involved, and a recent
        // window tracks that better than a lifetime average.
        const samples = rateSamplesRef.current;
        samples.push(Date.now());
        if (samples.length > RATE_WINDOW) {
          samples.splice(0, samples.length - RATE_WINDOW);
        }

        if (samples.length >= 2) {
          const span = samples[samples.length - 1] - samples[0];
          const perSong = span / (samples.length - 1);
          const remaining = Math.max(0, d.total - d.searched);
          setEtaSeconds(perSong > 0 ? (remaining * perSong) / 1000 : null);
        }

        // Fold the result in as it lands so the list fills while you review.
        if (d.match) {
          const found = d.match;
          setMatches((prev) =>
            prev
              ? { ...prev, items: { ...prev.items, [found.songId]: found } }
              : prev
          );
        }
      }),
      window.api.on("match:finished", () => {
        setSearching(false);
        setProgress(null);
        setEtaSeconds(null);
        rateSamplesRef.current = [];
        void load();
      }),
      window.api.on("download:finished", () => void load()),
      window.api.on("download:failed", () => void load()),
    ];

    return () => unsubs.forEach((u) => u());
  }, [load]);

  // --- Derived data ---

  const rows = useMemo<Row[]>(() => {
    if (!library || !matches) return [];

    const songsById = new Map(library.items.map((s) => [s.id, s]));
    const duplicates = new Set(matches.duplicateSongIds ?? []);
    const out: Row[] = [];

    for (const match of Object.values(matches.items)) {
      if (duplicates.has(match.songId)) continue;
      const song = songsById.get(match.songId);
      if (!song) continue;
      out.push({ song, match });
    }

    if (sortOrder === "score") {
      return out.sort((a, b) => {
        const aScore = a.match.candidates[0]?.matchScore ?? 0;
        const bScore = b.match.candidates[0]?.matchScore ?? 0;
        return bScore - aScore;
      });
    }

    // Discovery order: least recently found first, so a run in progress
    // appends to the bottom and never moves what you are looking at.
    // Keyed on when a song was *first* found, which a re-search preserves.
    return out.sort((a, b) => {
      const aAt = a.match.foundAt ?? a.match.searchedAt;
      const bAt = b.match.foundAt ?? b.match.searchedAt;
      const byTime = aAt.localeCompare(bAt);
      // Same millisecond: fall back to a stable key rather than leaving the
      // comparator's result up to the input order.
      return byTime !== 0 ? byTime : a.song.id.localeCompare(b.song.id);
    });
  }, [library, matches, sortOrder]);

  const filteredRows = useMemo(() => {
    let items = rows;

    if (statusFilter !== "all") {
      items = items.filter((r) => r.match.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.song.title.toLowerCase().includes(q) ||
          r.song.artists.some((a) => a.toLowerCase().includes(q)) ||
          r.match.candidates.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    return items;
  }, [rows, statusFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const counts = useMemo(() => {
    const c: Record<MatchStatus | "all", number> = {
      pending: 0,
      added: 0,
      skipped: 0,
      no_match: 0,
      all: rows.length,
    };
    for (const r of rows) c[r.match.status]++;
    return c;
  }, [rows]);

  /** Selection only ever applies to rows the user can actually act on. */
  const selectablePageIds = useMemo(
    () =>
      pagedRows
        .filter((r) => r.match.status === "pending" && r.match.candidates.length > 0)
        .map((r) => r.song.id),
    [pagedRows]
  );

  // --- Actions ---

  const withBusy = async (songIds: string[], fn: () => Promise<void>) => {
    setBusySongs((prev) => new Set([...prev, ...songIds]));
    try {
      await fn();
    } finally {
      setBusySongs((prev) => {
        const next = new Set(prev);
        for (const id of songIds) next.delete(id);
        return next;
      });
    }
  };

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSearch = async (options?: { retryNoMatch?: boolean }) => {
    setError(null);
    setSearching(true);
    try {
      const result = await window.api.matches.search(options);
      if (!result.success) {
        setError(result.error ?? "Map search failed.");
        setSearching(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Map search failed.");
      setSearching(false);
    }
  };

  const toggleMap = (songId: string, mapId: string) => {
    setTicked((prev) => {
      const current = prev[songId] ?? [];
      return {
        ...prev,
        [songId]: current.includes(mapId)
          ? current.filter((m) => m !== mapId)
          : [...current, mapId],
      };
    });
  };

  const handleAdd = (songId: string, mapIds: string[]) =>
    withBusy([songId], async () => {
      const result = await window.api.matches.add(songId, mapIds);
      if (!result.success) {
        setError(result.error ?? "Could not add that map.");
      } else {
        // The ticks have been committed; clear them for this song.
        setTicked((prev) => ({ ...prev, [songId]: [] }));
      }
      await load();
    });

  const handleSkip = (songId: string) =>
    withBusy([songId], async () => {
      const result = await window.api.matches.skip(songId);
      if (!result.success) setError(result.error ?? "Could not skip that song.");
      await load();
    });

  const handleReset = (songId: string) =>
    withBusy([songId], async () => {
      await window.api.matches.reset(songId);
      await load();
    });

  /** Add the top candidate for every currently selected song. */
  const handleAddSelected = async () => {
    const selections = rows
      .filter(
        (r) =>
          selected.has(r.song.id) &&
          r.match.status === "pending" &&
          r.match.candidates.length > 0
      )
      .map((r) => ({ songId: r.song.id, mapId: r.match.candidates[0].mapId }));

    if (selections.length === 0) return;

    await withBusy(
      selections.map((s) => s.songId),
      async () => {
        const result = await window.api.matches.addMany(selections);
        if (!result.success) {
          setError(result.error ?? "Bulk add failed.");
        } else {
          flash(
            `Added ${selections.length} songs · ${result.queued} map${result.queued === 1 ? "" : "s"} downloading in the background.`
          );
        }
        setSelected(new Set());
        await load();
      }
    );
  };

  /** Add the top candidate for every pending song, not just this page. */
  const handleAddAll = async () => {
    const pendingIds = rows
      .filter((r) => r.match.status === "pending" && r.match.candidates.length > 0)
      .map((r) => r.song.id);

    if (pendingIds.length === 0) return;

    await withBusy(pendingIds, async () => {
      const result = await window.api.matches.addAll();
      if (!result.success) {
        setError(result.error ?? "Bulk add failed.");
      } else {
        flash(
          `Added ${pendingIds.length} songs · ${result.queued} map${result.queued === 1 ? "" : "s"} downloading in the background.`
        );
      }
      setSelected(new Set());
      await load();
    });
  };

  const toggleSelect = (songId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });
  };

  const toggleSelectPage = () => {
    const allSelected =
      selectablePageIds.length > 0 &&
      selectablePageIds.every((id) => selected.has(id));

    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of selectablePageIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  // --- Render ---

  if (!library || !matches || !config) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading…</p>;
  }

  const pendingCount = counts.pending;
  const selectedCount = selected.size;

  return (
    <div>
      <div className="page-header">
        <h2>Review matches</h2>
        <span className="sync-info">
          {matches.lastSearchAt
            ? `Last search: ${new Date(matches.lastSearchAt).toLocaleString()}`
            : "No search run yet"}
          <br />
          {counts.pending} pending · {counts.added} added · {counts.skipped} skipped ·{" "}
          {counts.no_match} no match
        </span>
      </div>

      {error && <div className="inline-error">{error}</div>}

      {notice && (
        <div
          className="progress-banner"
          style={{ borderColor: "var(--success)" }}
        >
          <span className="progress-label" style={{ maxWidth: "none" }}>
            {notice}
          </span>
        </div>
      )}

      {searching && (
        <div className="progress-banner">
          <div className="progress-main">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: progress?.total
                    ? `${Math.round((progress.searched / progress.total) * 100)}%`
                    : "0%",
                }}
              />
            </div>
            <div className="progress-meta">
              <span className="progress-count">
                {progress
                  ? `${progress.searched} / ${progress.total}`
                  : "Starting…"}
              </span>
              {progress?.title && (
                <span className="progress-current" title={progress.title}>
                  {progress.title}
                </span>
              )}
              <span className="progress-eta">
                {etaSeconds !== null && etaSeconds > 0
                  ? `~${formatEta(etaSeconds)} left`
                  : "estimating…"}
              </span>
            </div>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => void window.api.matches.cancelSearch()}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="action-bar">
        <button
          className="btn btn-primary"
          onClick={() => void handleSearch()}
          disabled={searching}
        >
          {searching ? "Searching…" : "Find maps"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => void handleSearch({ retryNoMatch: true })}
          disabled={searching}
          title="Search again, including songs previously marked as no match"
        >
          Retry no-match
        </button>

        <button
          className="btn btn-success"
          onClick={() => void handleAddSelected()}
          disabled={selectedCount === 0 || searching}
        >
          Add selected ({selectedCount})
        </button>

        <button
          className="btn btn-success"
          onClick={() => void handleAddAll()}
          disabled={pendingCount === 0 || searching}
          title="Accept the best candidate for every pending song"
        >
          Add all ({pendingCount})
        </button>

        <span className="spacer" />

        <input
          className="search-input"
          type="text"
          placeholder="Search songs or maps…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          title="Found order keeps new results at the bottom while a search runs"
        >
          <option value="found">Found order</option>
          <option value="score">Best match first</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="pending">Pending ({counts.pending})</option>
          <option value="added">Added ({counts.added})</option>
          <option value="skipped">Skipped ({counts.skipped})</option>
          <option value="no_match">No match ({counts.no_match})</option>
          <option value="all">All ({counts.all})</option>
        </select>
      </div>

      {selectablePageIds.length > 0 && (
        <div className="action-bar">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            <input
              type="checkbox"
              checked={selectablePageIds.every((id) => selected.has(id))}
              onChange={toggleSelectPage}
            />
            Select all on this page ({selectablePageIds.length})
          </label>
        </div>
      )}

      {filteredRows.length === 0 ? (
        <EmptyState
          statusFilter={statusFilter}
          hasLibrary={library.items.length > 0}
          hasMatches={Object.keys(matches.items).length > 0}
        />
      ) : (
        <>
          <div className="match-list">
            {pagedRows.map(({ song, match }) => (
              <MatchGroup
                key={song.id}
                song={song}
                match={match}
                config={config}
                downloads={downloads}
                busy={busySongs.has(song.id)}
                selected={selected.has(song.id)}
                onToggleSelect={() => toggleSelect(song.id)}
                tickedMapIds={ticked[song.id] ?? []}
                onToggleMap={(mapId) => toggleMap(song.id, mapId)}
                onAdd={(mapIds) => void handleAdd(song.id, mapIds)}
                onSkip={() => void handleSkip(song.id)}
                onReset={() => void handleReset(song.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filteredRows.length)} of{" "}
                {filteredRows.length}
              </span>
              <div className="pagination-controls">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage(1)}
                >
                  First
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span className="pagination-page">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Sub-components ---

interface MatchGroupProps {
  song: LibraryItem;
  match: Match;
  config: Config;
  downloads: Downloads | null;
  busy: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  tickedMapIds: string[];
  onToggleMap: (mapId: string) => void;
  onAdd: (mapIds: string[]) => void;
  onSkip: () => void;
  onReset: () => void;
}

function MatchGroup({
  song,
  match,
  config,
  downloads,
  busy,
  selected,
  onToggleSelect,
  tickedMapIds,
  onToggleMap,
  onAdd,
  onSkip,
  onReset,
}: MatchGroupProps) {
  const decided = match.status === "added" || match.status === "skipped";
  const selectable = match.status === "pending" && match.candidates.length > 0;
  const hasCandidates = match.candidates.length > 0;

  const alreadyAdded = chosenMapIdsOf(match);

  // Display order follows the current preference, so toggling the setting
  // re-ranks matches that were searched before it changed.
  const ordered = orderCandidates(match.candidates, config.preferCuratedRanked);

  // Nothing ticked falls back to the top candidate, so the common
  // "this one's right" case stays a single click.
  const toAdd = tickedMapIds.length > 0 ? tickedMapIds : [];
  const fallback = ordered[0]?.mapId;

  return (
    <div className={`match-group ${decided ? "is-decided" : ""}`}>
      <div className="match-song">
        {selectable && (
          <input
            className="match-song-check"
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            disabled={busy}
          />
        )}

        {song.thumbnails[0] && (
          <img
            className="match-song-thumb"
            src={song.thumbnails[0].url}
            alt=""
            loading="lazy"
          />
        )}

        <div className="match-song-info">
          <div className="match-song-title" title={song.title}>
            {song.title}
          </div>
          <div className="match-song-meta">
            {song.artists.join(", ") || "Unknown artist"}
            {song.durationText ? ` · ${song.durationText}` : ""}
            {" · "}
            <button
              className="yt-link"
              onClick={() => void window.api.matches.openYouTube(song.videoId)}
            >
              YouTube
            </button>
          </div>
        </div>

        <div className="match-song-actions">
          <span className={`badge badge-${match.status}`}>
            {statusLabel(match.status)}
          </span>

          {decided && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={onReset}
              disabled={busy}
            >
              Undo
            </button>
          )}
        </div>
      </div>

      {match.candidates.length === 0 ? (
        <div
          style={{
            padding: "14px 16px",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          No map cleared your filters for this song.
        </div>
      ) : (
        <div className="match-candidates">
          {ordered.map((candidate) => (
            <MapCard
              key={candidate.mapId}
              candidate={candidate}
              minDifficulty={config.minDifficulty}
              characteristics={config.characteristics}
              isChosen={alreadyAdded.includes(candidate.mapId)}
              isInstalled={
                downloads?.items[candidate.mapId]?.status === "completed"
              }
              busy={busy}
              selectable
              isBest={candidate.mapId === ordered[0]?.mapId}
              selected={tickedMapIds.includes(candidate.mapId)}
              onToggleSelect={() => onToggleMap(candidate.mapId)}
              onOpen={() =>
                void window.api.matches.openBeatSaver(candidate.mapId)
              }
            />
          ))}
        </div>
      )}

      {hasCandidates && (
        <div className="match-footer">
          <button
            className="btn btn-success"
            onClick={() => onAdd(toAdd.length > 0 ? toAdd : fallback ? [fallback] : [])}
            disabled={busy || (toAdd.length === 0 && !fallback)}
            title={
              toAdd.length > 0
                ? `Add the ${toAdd.length} ticked map${toAdd.length === 1 ? "" : "s"}`
                : "Tick maps to choose, or add the best match"
            }
          >
            {toAdd.length > 0
              ? `Add ${toAdd.length} map${toAdd.length === 1 ? "" : "s"}`
              : "Add best match"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={onSkip}
            disabled={busy}
          >
            Skip
          </button>

          {alreadyAdded.length > 0 && (
            <span className="match-footer-note">
              {alreadyAdded.length} already added
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  statusFilter,
  hasLibrary,
  hasMatches,
}: {
  statusFilter: StatusFilter;
  hasLibrary: boolean;
  hasMatches: boolean;
}) {
  if (!hasLibrary) {
    return (
      <div className="empty-state">
        <h3>No liked songs yet</h3>
        <p>Go to Library and sync your YouTube Music likes first.</p>
      </div>
    );
  }

  if (!hasMatches) {
    return (
      <div className="empty-state">
        <h3>No maps searched yet</h3>
        <p>
          Click <strong>Find maps</strong> to search BeatSaver for every liked
          song.
        </p>
      </div>
    );
  }

  if (statusFilter === "pending") {
    return (
      <div className="empty-state">
        <h3>Nothing left to review</h3>
        <p>
          Every song has been decided. Sync new likes, then run{" "}
          <strong>Find maps</strong> again.
        </p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <h3>Nothing here</h3>
      <p>No songs match this filter.</p>
    </div>
  );
}
