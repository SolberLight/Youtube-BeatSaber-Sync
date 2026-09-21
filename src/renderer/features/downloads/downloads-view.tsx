import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapCard } from "../match/map-card";
import { stopPreview } from "../../lib/preview-player";
import {
  statusLabel,
  type Config,
  type DownloadRecord,
  type Downloads,
  type Library,
  type MapCandidate,
  type Matches,
  type Queue,
} from "../../lib/types";

type StatusFilter = "all" | "active" | "queued" | "failed" | "completed";

interface ProgressInfo {
  received: number;
  total: number | null;
  percent: number | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsView() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [downloads, setDownloads] = useState<Downloads | null>(null);
  const [library, setLibrary] = useState<Library | null>(null);
  const [matches, setMatches] = useState<Matches | null>(null);
  const [config, setConfig] = useState<Config | null>(null);

  const [progress, setProgress] = useState<Record<string, ProgressInfo>>({});
  const [filter, setFilter] = useState<StatusFilter>("all");

  const loadGenRef = useRef(0);

  const load = useCallback(async () => {
    const gen = ++loadGenRef.current;
    try {
      const [q, dl, lib, mt, cfg] = await Promise.all([
        window.api.downloads.getQueue(),
        window.api.downloads.getDownloads(),
        window.api.library.getAll(),
        window.api.matches.getAll(),
        window.api.settings.get(),
      ]);
      if (gen !== loadGenRef.current) return;
      setQueue(q);
      setDownloads(dl);
      setLibrary(lib);
      setMatches(mt);
      setConfig(cfg);
    } catch {
      // A transient IPC failure leaves the previous snapshot on screen.
    }
  }, []);

  useEffect(() => {
    void load();

    const unsubs = [
      window.api.on("download:queued", () => void load()),
      window.api.on("download:started", () => void load()),
      window.api.on("download:extracting", () => void load()),
      window.api.on("download:finished", (data: unknown) => {
        const d = data as { mapId: string };
        setProgress((prev) => {
          const next = { ...prev };
          delete next[d.mapId];
          return next;
        });
        void load();
      }),
      window.api.on("download:failed", () => void load()),
      window.api.on("download:paused", () => void load()),
      window.api.on("download:allFinished", () => void load()),
      window.api.on("download:progress", (data: unknown) => {
        const d = data as { mapId: string } & ProgressInfo;
        setProgress((prev) => ({
          ...prev,
          [d.mapId]: { received: d.received, total: d.total, percent: d.percent },
        }));
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
      stopPreview();
    };
  }, [load]);

  /**
   * Recover the full map details for a download.
   *
   * Records queued by this version carry their own snapshot; older ones fall
   * back to the candidate list on the match that produced them.
   */
  const candidateFor = useCallback(
    (record: DownloadRecord): MapCandidate | null => {
      if (record.candidate) return record.candidate;
      const match = matches?.items[record.songId];
      return match?.candidates.find((c) => c.mapId === record.mapId) ?? null;
    },
    [matches]
  );

  /** The liked song a map was downloaded for. */
  const songTitleFor = useCallback(
    (record: DownloadRecord): string | null => {
      const song = library?.items.find((i) => i.id === record.songId);
      if (!song) return null;
      const artist = song.artists[0];
      return artist ? `${song.title} — ${artist}` : song.title;
    },
    [library]
  );

  if (!downloads || !queue || !config) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading…</p>;
  }

  const records = Object.values(downloads.items);

  // Queue order drives the active/queued lists so position is meaningful.
  const activeIds = new Set(queue.active.map((j) => j.mapId));
  const pendingIds = new Set(queue.pending.map((j) => j.mapId));
  const failedIds = new Set(queue.failed.map((j) => j.mapId));

  const active = queue.active
    .map((j) => downloads.items[j.mapId])
    .filter((r): r is DownloadRecord => Boolean(r));
  const pending = queue.pending
    .map((j) => downloads.items[j.mapId])
    .filter((r): r is DownloadRecord => Boolean(r));
  const failed = queue.failed
    .map((j) => downloads.items[j.mapId])
    .filter((r): r is DownloadRecord => Boolean(r));

  const completed = records
    .filter(
      (r) =>
        r.status === "completed" &&
        !activeIds.has(r.mapId) &&
        !pendingIds.has(r.mapId) &&
        !failedIds.has(r.mapId)
    )
    .sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt));

  const sections: { key: StatusFilter; title: string; items: DownloadRecord[] }[] =
    [
      { key: "active", title: "Downloading", items: active },
      { key: "queued", title: "Queued", items: pending },
      { key: "failed", title: "Failed", items: failed },
      { key: "completed", title: "Installed", items: completed },
    ];

  const visible = sections.filter(
    (s) => s.items.length > 0 && (filter === "all" || filter === s.key)
  );

  const totalCount = active.length + pending.length + failed.length + completed.length;

  return (
    <div>
      <div className="page-header">
        <h2>Downloads</h2>
        <span className="sync-info">
          {completed.length} installed · {active.length} active ·{" "}
          {pending.length} queued · {failed.length} failed
        </span>
      </div>

      <div className="action-bar">
        <button
          className="btn btn-primary"
          onClick={() => void window.api.downloads.resume()}
          disabled={pending.length === 0}
        >
          Resume
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => void window.api.downloads.pauseAll()}
          disabled={active.length === 0 && pending.length === 0}
        >
          Pause
        </button>
        <button
          className="btn btn-secondary"
          onClick={async () => {
            await window.api.downloads.retryFailed();
            void load();
          }}
          disabled={failed.length === 0}
        >
          Retry failed ({failed.length})
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => void window.api.downloads.openFolder()}
        >
          Open maps folder
        </button>

        <span className="spacer" />

        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All ({totalCount})</option>
          <option value="active">Downloading ({active.length})</option>
          <option value="queued">Queued ({pending.length})</option>
          <option value="failed">Failed ({failed.length})</option>
          <option value="completed">Installed ({completed.length})</option>
        </select>
      </div>

      {totalCount === 0 ? (
        <div className="empty-state">
          <h3>No downloads yet</h3>
          <p>
            Accept some maps in <strong>Review</strong> or <strong>Search</strong>{" "}
            and they will appear here.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here</h3>
          <p>No downloads have that status.</p>
        </div>
      ) : (
        visible.map((section) => (
          <div className="queue-section" key={section.key}>
            <h3>
              {section.title} ({section.items.length})
            </h3>
            <div className="download-grid">
              {section.items.map((record) => (
                <DownloadCard
                  key={record.mapId}
                  record={record}
                  candidate={candidateFor(record)}
                  songTitle={songTitleFor(record)}
                  progress={progress[record.mapId]}
                  config={config}
                  onReload={load}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// --- Card ---

interface CardProps {
  record: DownloadRecord;
  candidate: MapCandidate | null;
  songTitle: string | null;
  progress?: ProgressInfo;
  config: Config;
  onReload: () => void;
}

function DownloadCard({
  record,
  candidate,
  songTitle,
  progress,
  config,
  onReload,
}: CardProps) {
  const openBeatSaver = () =>
    void window.api.matches.openBeatSaver(record.mapId);

  const actions = (
    <>
      {record.status === "completed" && (
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => void window.api.downloads.openFolder(record.mapId)}
        >
          Show in folder
        </button>
      )}
      {record.status === "failed" && (
        <button
          className="btn btn-sm btn-primary"
          onClick={async () => {
            await window.api.downloads.retryFailed();
            onReload();
          }}
        >
          Retry
        </button>
      )}
      <button className="btn btn-sm btn-secondary" onClick={openBeatSaver}>
        BeatSaver
      </button>
    </>
  );

  const footer = (
    <div className="download-status">
      <span className={`badge badge-${record.status}`}>
        {statusLabel(record.status)}
      </span>

      {record.status === "downloading" && (
        <>
          <div className="queue-progress">
            <div
              className="progress-fill"
              style={{ width: `${progress?.percent ?? 0}%` }}
            />
          </div>
          {progress && (
            <span className="download-bytes">
              {formatBytes(progress.received)}
              {progress.total ? ` / ${formatBytes(progress.total)}` : ""}
            </span>
          )}
        </>
      )}

      {record.status === "failed" && record.error && (
        <span className="download-error" title={record.error}>
          {record.error}
        </span>
      )}
    </div>
  );

  // Records from before map snapshots were stored, whose match has since been
  // re-searched, have no card data left - show what the record itself holds.
  if (!candidate) {
    return (
      <div className="map-card">
        <div className="map-body">
          <div className="map-title" title={record.name}>
            {record.name}
          </div>
          <div className="map-mapper">{record.mapId}</div>
          {songTitle && <div className="map-subtitle">for {songTitle}</div>}
          {footer}
          <div className="map-actions">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <MapCard
      candidate={candidate}
      minDifficulty={config.minDifficulty}
      characteristics={config.characteristics}
      onOpen={openBeatSaver}
      showMatch={false}
      subtitle={songTitle ? `for ${songTitle}` : undefined}
      footer={footer}
      actions={actions}
    />
  );
}
