import React, { useEffect, useRef, useState } from "react";
import type { SongSearchResult } from "../../lib/types";

/**
 * How often the listening history is re-read while the window is visible.
 * Open-source YTM scrobblers poll this same endpoint every 10-60 s without
 * reported bans (multi-scrobbler: 10 s backing off to 30 s), so 30 s is safe.
 */
const POLL_INTERVAL_MS = 30_000;

/** Focus/visibility refreshes closer together than this are skipped. */
const MIN_REFRESH_GAP_MS = 5_000;

/** Smallest thumbnail that still looks sharp at the card's size. */
function pickThumbnail(song: SongSearchResult): string | null {
  const sorted = [...song.thumbnails].sort(
    (a, b) => (a.width ?? 0) - (b.width ?? 0)
  );
  return (sorted.find((t) => (t.width ?? 0) >= 96) ?? sorted.at(-1))?.url ?? null;
}

/**
 * Floating card at the bottom of the sidebar showing the track at the top of
 * the YouTube Music history. That is the song playing now, or the last one
 * played; the history cannot tell the two apart.
 */
export function LastPlayedCard({
  onFindMaps,
}: {
  onFindMaps: (song: SongSearchResult) => void;
}) {
  const [song, setSong] = useState<SongSearchResult | null>(null);
  const inFlightRef = useRef(false);
  const lastPollAtRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      // No point hitting YouTube while nobody can see the card.
      if (document.hidden || inFlightRef.current) return;
      inFlightRef.current = true;
      lastPollAtRef.current = Date.now();
      try {
        const result = await window.api.library.lastPlayed();
        // On failure keep showing the last known track rather than blanking.
        if (!cancelled && result.success) setSong(result.song);
      } catch {
        // Same as above: a missed poll is not worth surfacing.
      } finally {
        inFlightRef.current = false;
      }
    };

    // Coming back to the app (restore or alt-tab) usually means a new song
    // was started elsewhere; refresh now instead of waiting for the timer.
    const onReturn = () => {
      if (Date.now() - lastPollAtRef.current >= MIN_REFRESH_GAP_MS) void poll();
    };

    void poll();
    const timer = setInterval(() => void poll(), POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, []);

  if (!song) return null;

  const thumb = pickThumbnail(song);
  const artists = song.artists.join(", ") || "Unknown artist";

  return (
    <div className="last-played">
      <div className="last-played-label">
        <span className="last-played-dot" />
        Last played
      </div>

      <div className="last-played-song">
        {thumb && <img className="last-played-thumb" src={thumb} alt="" />}
        <div className="last-played-info">
          <div className="last-played-title" title={song.title}>
            {song.title}
          </div>
          <div className="last-played-artist" title={artists}>
            {artists}
          </div>
        </div>
      </div>

      <button
        className="btn btn-sm btn-primary last-played-btn"
        onClick={() => onFindMaps(song)}
      >
        Find maps
      </button>
    </div>
  );
}
