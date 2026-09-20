import React from "react";
import type { Difficulty, MapCandidate, MapDiff } from "../../lib/types";
import { DIFFICULTY_LABELS, DIFFICULTY_ORDER } from "../../lib/types";
import { togglePreview, usePreviewPlayer } from "../../lib/preview-player";

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "-";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function difficultyRank(d: string): number {
  return DIFFICULTY_ORDER.indexOf(d as Difficulty);
}

function ratingClass(rating: number): string {
  if (rating >= 0.9) return "rating-good";
  if (rating >= 0.7) return "rating-mid";
  return "rating-low";
}

function confidenceClass(score: number): string {
  if (score >= 0.75) return "confidence-high";
  if (score >= 0.55) return "confidence-mid";
  return "confidence-low";
}

const SOURCE_LABELS: Record<MapCandidate["source"], string> = {
  beatsaver: "BeatSaver",
  "beatsaver-curated": "BeastSaber",
  scoresaber: "ScoreSaber",
};

/**
 * Pick the chart the player will actually attempt: within the allowed game
 * modes, the easiest one that still meets the configured minimum. That is the
 * chart whose speed and block count are worth putting on the card.
 */
function representativeDiff(
  diffs: MapDiff[],
  minDifficulty: Difficulty,
  characteristics: string[]
): MapDiff | null {
  const allowed = new Set(characteristics);
  const minRank = difficultyRank(minDifficulty);

  const eligible = diffs
    .filter(
      (d) =>
        allowed.has(d.characteristic) && difficultyRank(d.difficulty) >= minRank
    )
    .sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty));

  return eligible[0] ?? null;
}

/** One pill per difficulty offered, strongest last, duplicates collapsed. */
function difficultyPills(
  diffs: MapDiff[],
  minDifficulty: Difficulty,
  characteristics: string[]
): { difficulty: string; nps: number; belowMinimum: boolean }[] {
  const allowed = new Set(characteristics);
  const minRank = difficultyRank(minDifficulty);

  const best = new Map<string, number>();
  for (const d of diffs) {
    if (!allowed.has(d.characteristic)) continue;
    // Several characteristics can share a difficulty name; keep the busiest.
    best.set(d.difficulty, Math.max(best.get(d.difficulty) ?? 0, d.nps));
  }

  return [...best.entries()]
    .map(([difficulty, nps]) => ({
      difficulty,
      nps,
      belowMinimum: difficultyRank(difficulty) < minRank,
    }))
    .sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty));
}

interface Props {
  candidate: MapCandidate;
  minDifficulty: Difficulty;
  characteristics: string[];
  onOpen: () => void;

  /** Review-mode props. Ignored when `actions` is supplied. */
  isChosen?: boolean;
  isInstalled?: boolean;
  busy?: boolean;
  onAdd?: () => void;

  /**
   * Replaces the default Add / BeatSaver buttons, so the same card can carry
   * download controls instead of review controls.
   */
  actions?: React.ReactNode;
  /** Slot above the actions - used for download progress. */
  footer?: React.ReactNode;
  /** Match confidence is meaningless once a map is installed. */
  showMatch?: boolean;
  /** Extra line under the mapper, e.g. which liked song this came from. */
  subtitle?: React.ReactNode;

  /**
   * Tick mode: the card carries a checkbox and the whole surface toggles it,
   * so several maps can be accepted for one song. The commit button lives
   * outside the card, next to Skip.
   */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;

  /** Top-ranked candidate for this song; called out so it reads at a glance. */
  isBest?: boolean;
}

export function MapCard({
  candidate,
  minDifficulty,
  characteristics,
  onOpen,
  isChosen = false,
  isInstalled = false,
  busy = false,
  onAdd,
  actions,
  footer,
  showMatch = true,
  subtitle,
  selectable = false,
  selected = false,
  onToggleSelect,
  isBest = false,
}: Props) {
  const pills = difficultyPills(candidate.diffs, minDifficulty, characteristics);
  const main = representativeDiff(candidate.diffs, minDifficulty, characteristics);
  const ratingPercent = Math.round(candidate.rating * 100);
  const confidencePercent = Math.round(candidate.matchScore * 100);

  const preview = usePreviewPlayer();
  const isThisPreview = preview.url === candidate.previewURL;
  const isPlayingThis = isThisPreview && preview.isPlaying;
  const isLoadingThis = isThisPreview && preview.isLoading;
  const previewFailed = isThisPreview && preview.error !== null;

  // In tick mode the card itself is the hit target, so inner controls must
  // not bubble their clicks up into a toggle.
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className={`map-card ${isChosen ? "is-chosen" : ""} ${
        selectable ? "is-selectable" : ""
      } ${selectable && selected ? "is-ticked" : ""} ${
        isBest ? "is-best" : ""
      }`}
      onClick={selectable ? onToggleSelect : undefined}
      role={selectable ? "checkbox" : undefined}
      aria-checked={selectable ? selected : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onToggleSelect?.();
              }
            }
          : undefined
      }
    >
      {isBest && <span className="map-best-badge">Best match</span>}

      {selectable && (
        <input
          className="map-tick"
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.()}
          onClick={stop}
          aria-label={`Select ${candidate.name}`}
        />
      )}

      {candidate.coverURL && (
        <div className="map-cover-wrap">
          <img
            className="map-cover"
            src={candidate.coverURL}
            alt=""
            loading="lazy"
          />
          {candidate.previewURL && (
            <button
              className={`preview-btn ${isPlayingThis ? "is-playing" : ""} ${
                previewFailed ? "is-failed" : ""
              }`}
              onClick={(e) => {
                stop(e);
                togglePreview(candidate.previewURL);
              }}
              title={
                previewFailed
                  ? "Preview unavailable"
                  : isPlayingThis
                    ? "Stop preview"
                    : "Play a clip of this map's song"
              }
              aria-label={isPlayingThis ? "Stop preview" : "Play preview"}
            >
              {isLoadingThis ? "…" : isPlayingThis ? "■" : "▶"}
            </button>
          )}
        </div>
      )}

      <div className="map-body">
        <div className="map-title" title={candidate.name}>
          {candidate.name}
        </div>

        <div className="map-mapper">
          by <strong>{candidate.levelAuthorName || candidate.uploader}</strong>
        </div>

        {subtitle && <div className="map-subtitle">{subtitle}</div>}

        <div className="diff-row">
          {pills.map((p) => (
            <span
              key={p.difficulty}
              className={`diff-pill diff-${p.difficulty} ${
                p.belowMinimum ? "is-below" : ""
              }`}
              title={
                p.belowMinimum
                  ? `${DIFFICULTY_LABELS[p.difficulty as Difficulty] ?? p.difficulty} - below your minimum`
                  : `${DIFFICULTY_LABELS[p.difficulty as Difficulty] ?? p.difficulty} - ${p.nps.toFixed(1)} notes/sec`
              }
            >
              {DIFFICULTY_LABELS[p.difficulty as Difficulty] ?? p.difficulty}
              {p.nps > 0 && (
                <span className="diff-pill-detail">{p.nps.toFixed(1)}</span>
              )}
            </span>
          ))}
        </div>

        <div className="map-stats">
          <span className="map-stat" title="BeatSaver rating">
            <span className={`map-stat-value ${ratingClass(candidate.rating)}`}>
              {ratingPercent}%
            </span>
            <span>({candidate.upvotes.toLocaleString()} up)</span>
          </span>

          {main && (
            <>
              <span className="map-stat" title="Blocks in this difficulty">
                <span className="map-stat-value">
                  {main.notes.toLocaleString()}
                </span>
                <span>blocks</span>
              </span>

              <span
                className="map-stat"
                title="Note jump speed - how fast blocks travel toward you"
              >
                <span className="map-stat-value">{main.njs.toFixed(0)}</span>
                <span>NJS</span>
              </span>
            </>
          )}

          <span className="map-stat" title="Song tempo">
            <span className="map-stat-value">{Math.round(candidate.bpm)}</span>
            <span>BPM</span>
          </span>

          <span className="map-stat" title="Map length">
            <span className="map-stat-value">
              {formatDuration(candidate.duration)}
            </span>
          </span>
        </div>

        {(candidate.ranked || candidate.curated || candidate.automapper) && (
          <div className="map-flags">
            {candidate.ranked && (
              <span className="map-flag map-flag-ranked">Ranked</span>
            )}
            {candidate.curated && (
              <span className="map-flag map-flag-curated">Curated</span>
            )}
            {candidate.automapper && (
              <span className="map-flag map-flag-ai">AI</span>
            )}
            {candidate.source !== "beatsaver" && (
              <span className="map-flag map-flag-source">
                via {SOURCE_LABELS[candidate.source]}
              </span>
            )}
          </div>
        )}

        {showMatch && (
          <div
            className="map-match"
            title={candidate.matchReasons.join(" · ") || "Match confidence"}
          >
            <span
              className={`confidence-dot ${confidenceClass(candidate.matchScore)}`}
            />
            <span>{confidencePercent}% match</span>
            {candidate.matchReasons.length > 0 && (
              <span>· {candidate.matchReasons.slice(0, 2).join(", ")}</span>
            )}
          </div>
        )}

        {footer}

        <div className="map-actions">
          {actions ??
            (selectable ? (
              // Accepting happens through the tick plus the Add button below
              // the whole group, so the card only needs the outbound link.
              <>
                {isChosen && <span className="badge badge-added">Added</span>}
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={(e) => {
                    stop(e);
                    onOpen();
                  }}
                >
                  BeatSaver
                </button>
              </>
            ) : (
              <>
                <button
                  className={`btn btn-sm ${isChosen ? "btn-success" : "btn-primary"}`}
                  onClick={onAdd}
                  disabled={busy}
                >
                  {isChosen ? "Added" : isInstalled ? "Add (installed)" : "Add"}
                </button>
                <button className="btn btn-sm btn-secondary" onClick={onOpen}>
                  BeatSaver
                </button>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}
