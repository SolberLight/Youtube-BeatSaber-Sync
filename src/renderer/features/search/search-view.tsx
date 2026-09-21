import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapCard } from "../match/map-card";
import { orderCandidates } from "../../lib/candidate-order";
import {
  chosenMapIdsOf,
  type Config,
  type Downloads,
  type Match,
  type SongSearchResult,
  statusLabel,
} from "../../lib/types";
import { stopPreview } from "../../lib/preview-player";

type LookupState =
  | { phase: "idle" }
  | { phase: "searching" }
  | { phase: "done"; match: Match }
  | { phase: "error"; message: string };

/** A song handed over from elsewhere (the last-played card) to look up. */
export type LookupRequest = { song: SongSearchResult; nonce: number };

export function SearchView({
  request,
  onRequestHandled,
}: {
  request?: LookupRequest | null;
  onRequestHandled?: () => void;
} = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<Config | null>(null);
  const [downloads, setDownloads] = useState<Downloads | null>(null);

  /** Per-song map-lookup state, keyed by videoId. */
  const [lookups, setLookups] = useState<Record<string, LookupState>>({});
  const [notice, setNotice] = useState<string | null>(null);

  /** Maps ticked per song, keyed by videoId. */
  const [ticked, setTicked] = useState<Record<string, string[]>>({});

  const searchGenRef = useRef(0);
  const handledNonceRef = useRef<number | null>(null);

  const loadSideData = useCallback(async () => {
    const [cfg, dl] = await Promise.all([
      window.api.settings.get(),
      window.api.downloads.getDownloads(),
    ]);
    setConfig(cfg);
    setDownloads(dl);
  }, []);

  useEffect(() => {
    void loadSideData();

    const unsubs = [
      window.api.on("download:finished", () => void loadSideData()),
      window.api.on("download:failed", () => void loadSideData()),
    ];

    // Leaving the page should not leave a clip playing.
    return () => {
      unsubs.forEach((u) => u());
      stopPreview();
    };
  }, [loadSideData]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const gen = ++searchGenRef.current;
    setSearching(true);
    setError(null);
    setLookups({});
    stopPreview();

    try {
      const result = await window.api.library.search(trimmed);
      if (gen !== searchGenRef.current) return; // superseded by a newer search

      if (!result.success) {
        setError(result.error ?? "Search failed.");
        setResults([]);
      } else {
        setResults(result.songs);
      }
    } catch (err) {
      if (gen !== searchGenRef.current) return;
      setError(err instanceof Error ? err.message : "Search failed.");
      setResults([]);
    } finally {
      if (gen === searchGenRef.current) setSearching(false);
    }
  };

  /**
   * Add the song to the library, then search BeatSaver for it.
   * Adding first means the normal decision and download flow applies
   * unchanged once the user picks a map.
   */
  const handleFindMaps = async (song: SongSearchResult) => {
    setLookups((prev) => ({ ...prev, [song.videoId]: { phase: "searching" } }));

    try {
      const added = await window.api.library.addSong(song);
      if (!added.success || !added.item) {
        throw new Error(added.error ?? "Could not add that song.");
      }

      const songId = added.item.id;
      const found = await window.api.matches.searchOne(songId);
      if (!found.success) {
        throw new Error(found.error ?? "Map search failed.");
      }

      const matches = await window.api.matches.getAll();
      const match = matches.items[songId];

      setLookups((prev) => ({
        ...prev,
        [song.videoId]: match
          ? { phase: "done", match }
          : { phase: "error", message: "No result recorded." },
      }));
    } catch (err) {
      setLookups((prev) => ({
        ...prev,
        [song.videoId]: {
          phase: "error",
          message: err instanceof Error ? err.message : "Map search failed.",
        },
      }));
    }
  };

  // Show just the requested song and start its map lookup straight away.
  useEffect(() => {
    if (!request || handledNonceRef.current === request.nonce) return;
    handledNonceRef.current = request.nonce;
    onRequestHandled?.();

    searchGenRef.current++; // drop any text search still in flight
    setSearching(false);
    setError(null);
    setQuery([request.song.title, request.song.artists[0]].filter(Boolean).join(" "));
    setResults([request.song]);
    setLookups({});
    stopPreview();
    void handleFindMaps(request.song);
  }, [request]);

  const toggleMap = (videoId: string, mapId: string) => {
    setTicked((prev) => {
      const current = prev[videoId] ?? [];
      return {
        ...prev,
        [videoId]: current.includes(mapId)
          ? current.filter((m) => m !== mapId)
          : [...current, mapId],
      };
    });
  };

  const handleAdd = async (
    videoId: string,
    songId: string,
    mapIds: string[]
  ) => {
    if (mapIds.length === 0) return;

    const result = await window.api.matches.add(songId, mapIds);
    if (!result.success) {
      setError(result.error ?? "Could not add that map.");
      return;
    }

    setTicked((prev) => ({ ...prev, [videoId]: [] }));
    flash(
      `Added ${mapIds.length} map${mapIds.length === 1 ? "" : "s"} · downloading in the background.`
    );

    const matches = await window.api.matches.getAll();
    const match = matches.items[songId];
    if (match) {
      setLookups((prev) => ({ ...prev, [videoId]: { phase: "done", match } }));
    }
    void loadSideData();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Search</h2>
        <span className="sync-info">
          Find a map for any song on YouTube Music,
          <br />
          whether or not you have liked it.
        </span>
      </div>

      {error && <div className="inline-error">{error}</div>}

      {notice && (
        <div className="progress-banner" style={{ borderColor: "var(--success)" }}>
          <span className="progress-label" style={{ maxWidth: "none" }}>
            {notice}
          </span>
        </div>
      )}

      <div className="action-bar">
        <input
          className="search-input"
          style={{ width: 380 }}
          type="text"
          placeholder="Song or artist…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSearch();
          }}
          autoFocus
        />
        <button
          className="btn btn-primary"
          onClick={() => void handleSearch()}
          disabled={searching || !query.trim()}
        >
          {searching ? "Searching…" : "Search YouTube Music"}
        </button>
      </div>

      {results === null ? (
        <div className="empty-state">
          <h3>Search YouTube Music</h3>
          <p>
            Type a song or artist above. Each result gets a{" "}
            <strong>Find maps</strong> button, and you can play a clip of any
            map to check it is the right song before adding it.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <h3>No songs found</h3>
          <p>Nothing on YouTube Music matched that search.</p>
        </div>
      ) : (
        <div className="match-list">
          {results.map((song) => {
            const lookup = lookups[song.videoId] ?? { phase: "idle" };

            return (
              <div className="match-group" key={song.videoId}>
                <div className="match-song">
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
                      {song.album ? ` · ${song.album}` : ""}
                      {" · "}
                      <button
                        className="yt-link"
                        onClick={() =>
                          void window.api.matches.openYouTube(song.videoId)
                        }
                      >
                        YouTube
                      </button>
                    </div>
                  </div>

                  <div className="match-song-actions">
                    {lookup.phase === "done" && (
                      <span className={`badge badge-${lookup.match.status}`}>
                        {statusLabel(lookup.match.status)}
                      </span>
                    )}
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => void handleFindMaps(song)}
                      disabled={lookup.phase === "searching"}
                    >
                      {lookup.phase === "searching"
                        ? "Searching…"
                        : lookup.phase === "done"
                          ? "Search again"
                          : "Find maps"}
                    </button>
                  </div>
                </div>

                {lookup.phase === "error" && (
                  <div
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "var(--error)",
                    }}
                  >
                    {lookup.message}
                  </div>
                )}

                {lookup.phase === "done" &&
                  lookup.match.candidates.length === 0 && (
                    <div
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      No map cleared your filters for this song. Try loosening
                      the length tolerance or minimum rating in Settings.
                    </div>
                  )}

                {lookup.phase === "done" &&
                  lookup.match.candidates.length > 0 &&
                  config &&
                  (() => {
                    const picked = ticked[song.videoId] ?? [];
                    const added = chosenMapIdsOf(lookup.match);
                    const ordered = orderCandidates(
                      lookup.match.candidates,
                      config.preferCuratedRanked
                    );
                    const fallback = ordered[0]?.mapId;

                    return (
                      <>
                        <div className="match-candidates">
                          {ordered.map((candidate) => (
                            <MapCard
                              key={candidate.mapId}
                              candidate={candidate}
                              minDifficulty={config.minDifficulty}
                              characteristics={config.characteristics}
                              isChosen={added.includes(candidate.mapId)}
                              isInstalled={
                                downloads?.items[candidate.mapId]?.status ===
                                "completed"
                              }
                              busy={false}
                              selectable
                              isBest={candidate.mapId === ordered[0]?.mapId}
                              selected={picked.includes(candidate.mapId)}
                              onToggleSelect={() =>
                                toggleMap(song.videoId, candidate.mapId)
                              }
                              onOpen={() =>
                                void window.api.matches.openBeatSaver(
                                  candidate.mapId
                                )
                              }
                            />
                          ))}
                        </div>

                        <div className="match-footer">
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              void handleAdd(
                                song.videoId,
                                lookup.match.songId,
                                picked.length > 0
                                  ? picked
                                  : fallback
                                    ? [fallback]
                                    : []
                              )
                            }
                            disabled={picked.length === 0 && !fallback}
                          >
                            {picked.length > 0
                              ? `Add ${picked.length} map${picked.length === 1 ? "" : "s"}`
                              : "Add best match"}
                          </button>

                          {added.length > 0 && (
                            <span className="match-footer-note">
                              {added.length} already added
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
