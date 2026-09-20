import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Library, Matches } from "../../lib/types";

const PAGE_SIZE = 50;

type StatusFilter = "all" | "pending" | "added" | "skipped" | "no_match" | "unsearched";

export function LibraryView() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [matches, setMatches] = useState<Matches | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const [lib, mt] = await Promise.all([
        window.api.library.getAll(),
        window.api.matches.getAll(),
      ]);
      setLibrary(lib);
      setMatches(mt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library.");
    }
  }, []);

  useEffect(() => {
    void load();

    const unsubs = [
      window.api.on("sync:finished", (data: unknown) => {
        const d = data as { success: boolean; error?: string };
        setSyncing(false);
        if (!d.success && d.error) setError(d.error);
        void load();
      }),
      window.api.on("match:finished", () => void load()),
      window.api.on("decision:changed", () => void load()),
    ];

    return () => unsubs.forEach((u) => u());
  }, [load]);

  const handleSync = async () => {
    setError(null);
    setSyncing(true);
    try {
      const result = await window.api.library.sync();
      if (!result.success) {
        setError(result.error ?? "Sync failed.");
        setSyncing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.");
      setSyncing(false);
    }
  };

  const statusOf = useCallback(
    (songId: string): StatusFilter => {
      const match = matches?.items[songId];
      if (!match) return "unsearched";
      return match.status;
    },
    [matches]
  );

  const filteredItems = useMemo(() => {
    if (!library) return [];

    let items = library.items;

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.artists.some((a) => a.toLowerCase().includes(q)) ||
          (i.album && i.album.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      items = items.filter((i) => statusOf(i.id) === statusFilter);
    }

    return items;
  }, [library, search, statusFilter, statusOf]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (!library) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading…</p>;
  }

  const likedCount = library.items.filter((i) => i.inLibrary).length;

  return (
    <div>
      <div className="page-header">
        <h2>Library</h2>
        <span className="sync-info">
          {library.lastFullSyncAt
            ? `Last synced: ${new Date(library.lastFullSyncAt).toLocaleString()}`
            : "Never synced"}
          <br />
          {likedCount} liked songs
          {library.items.length !== likedCount &&
            ` · ${library.items.length - likedCount} no longer liked`}
        </span>
      </div>

      {error && <div className="inline-error">{error}</div>}

      <div className="action-bar">
        <button
          className="btn btn-primary"
          onClick={() => void handleSync()}
          disabled={syncing}
        >
          {syncing ? "Syncing…" : "Sync likes"}
        </button>

        <span className="spacer" />

        <input
          className="search-input"
          type="text"
          placeholder="Search songs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All songs</option>
          <option value="unsearched">Not searched</option>
          <option value="pending">Pending review</option>
          <option value="added">Added</option>
          <option value="skipped">Skipped</option>
          <option value="no_match">No match</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>
            {library.items.length === 0 ? "No songs yet" : "Nothing matches"}
          </h3>
          <p>
            {library.items.length === 0
              ? 'Click "Sync likes" to pull your YouTube Music liked songs.'
              : "No songs match this filter."}
          </p>
        </div>
      ) : (
        <>
          <table className="song-table">
            <thead>
              <tr>
                <th style={{ width: 56 }} />
                <th>Title</th>
                <th>Artist</th>
                <th>Album</th>
                <th style={{ width: 90 }}>Length</th>
                <th style={{ width: 120 }}>Map status</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map((item) => {
                const status = statusOf(item.id);
                return (
                  <tr key={item.id}>
                    <td>
                      {item.thumbnails[0] && (
                        <img
                          className="song-thumb"
                          src={item.thumbnails[0].url}
                          alt=""
                          loading="lazy"
                        />
                      )}
                    </td>
                    <td>
                      {item.title}
                      {!item.inLibrary && (
                        <span
                          className="badge badge-skipped"
                          style={{ marginLeft: 8 }}
                        >
                          unliked
                        </span>
                      )}
                    </td>
                    <td>{item.artists.join(", ") || "-"}</td>
                    <td>{item.album || "-"}</td>
                    <td>{item.durationText || "-"}</td>
                    <td>
                      <span className={`badge badge-${status}`}>
                        {status === "no_match"
                          ? "no match"
                          : status === "unsearched"
                            ? "not searched"
                            : status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filteredItems.length)} of{" "}
                {filteredItems.length}
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
