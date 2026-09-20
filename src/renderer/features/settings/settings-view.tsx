import React, { useEffect, useState } from "react";
import type { Config, Difficulty } from "../../lib/types";
import { CHARACTERISTICS, DIFFICULTY_LABELS, DIFFICULTY_ORDER } from "../../lib/types";
import { useTheme } from "../../themes/theme-context";

interface Props {
  onLogout: () => void;
}

export function SettingsView({ onLogout }: Props) {
  const [config, setConfig] = useState<Config | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTheme, setTheme, themes } = useTheme();

  useEffect(() => {
    void window.api.settings.get().then(setConfig);
  }, []);

  const update = async (partial: Partial<Config>) => {
    // Show the new value immediately; the main process is the source of truth.
    setConfig((prev) => (prev ? { ...prev, ...partial } : prev));
    setError(null);

    const result = await window.api.settings.update(partial);
    if (result.success && result.settings) {
      setConfig(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(result.error ?? "Could not save that setting.");
      setConfig(await window.api.settings.get());
    }
  };

  const handleSelectDir = async () => {
    const dir = await window.api.settings.selectMapsDir();
    if (dir) await update({ mapsDir: dir });
  };

  const handleReset = async () => {
    const result = await window.api.settings.reset();
    if (result.success && result.settings) {
      setConfig(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const toggleCharacteristic = (name: string) => {
    if (!config) return;
    const active = config.characteristics.includes(name);
    // At least one game mode must stay on, or nothing can ever match.
    if (active && config.characteristics.length === 1) return;

    void update({
      characteristics: active
        ? config.characteristics.filter((c) => c !== name)
        : [...config.characteristics, name],
    });
  };

  if (!config) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading settings…</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        {saved && (
          <span style={{ color: "var(--success)", fontSize: 13 }}>Saved</span>
        )}
      </div>

      {error && <div className="inline-error">{error}</div>}

      <div className="settings-grid">
        {/* ---------- Match criteria ---------- */}
        <div className="settings-group">
          <h3>Match criteria</h3>

          <div className="settings-row">
            <div className="settings-label">
              <label>Minimum difficulty</label>
              <span className="settings-hint">
                A map must offer this difficulty or harder to be suggested.
              </span>
            </div>
            <div className="settings-control">
              <select
                className="filter-select"
                value={config.minDifficulty}
                onChange={(e) =>
                  void update({ minDifficulty: e.target.value as Difficulty })
                }
              >
                {DIFFICULTY_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Minimum rating</label>
              <span className="settings-hint">
                BeatSaver community score.
              </span>
            </div>
            <div className="settings-control">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(config.minRating * 100)}
                onChange={(e) =>
                  void update({ minRating: Number(e.target.value) / 100 })
                }
                style={{ width: 180, accentColor: "var(--accent)" }}
              />
              <span className="range-value">
                {Math.round(config.minRating * 100)}%
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Minimum votes</label>
              <span className="settings-hint">
                Ignores maps with too few votes for the rating to mean anything.
              </span>
            </div>
            <div className="settings-control">
              <input
                className="settings-input"
                type="number"
                min={0}
                max={10000}
                value={config.minVotes}
                onChange={(e) =>
                  void update({ minVotes: Math.max(0, Number(e.target.value) || 0) })
                }
                style={{ width: 90 }}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Game modes</label>
              <span className="settings-hint">
                Which characteristics count toward the difficulty check.
              </span>
            </div>
            <div className="char-grid">
              {CHARACTERISTICS.map((name) => (
                <button
                  key={name}
                  className={`char-toggle ${
                    config.characteristics.includes(name) ? "is-on" : ""
                  }`}
                  onClick={() => toggleCharacteristic(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Length tolerance</label>
              <span className="settings-hint">
                Reject maps whose length differs from the YouTube track by more
                than this. Guards against remixes and extended edits.
              </span>
            </div>
            <div className="settings-control">
              <input
                className="settings-input"
                type="number"
                min={0}
                max={600}
                value={config.durationToleranceSeconds}
                onChange={(e) =>
                  void update({
                    durationToleranceSeconds: Math.max(
                      0,
                      Number(e.target.value) || 0
                    ),
                  })
                }
                style={{ width: 80 }}
              />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                seconds
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Minimum match confidence</label>
              <span className="settings-hint">
                How sure the matcher must be before offering a map at all.
              </span>
            </div>
            <div className="settings-control">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(config.minMatchScore * 100)}
                onChange={(e) =>
                  void update({ minMatchScore: Number(e.target.value) / 100 })
                }
                style={{ width: 180, accentColor: "var(--accent)" }}
              />
              <span className="range-value">
                {Math.round(config.minMatchScore * 100)}%
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Prefer curated and ranked maps</label>
              <span className="settings-hint">
                Candidates are ordered by match confidence first. When two are
                equally good a curated map comes first, then a ranked one, then
                the rest by rating. Applies to matches you already have.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.preferCuratedRanked}
              onChange={(e) =>
                void update({ preferCuratedRanked: e.target.checked })
              }
            />
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Exclude AI / automapped</label>
              <span className="settings-hint">
                Hide maps generated automatically rather than charted by hand.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.excludeAutomapper}
              onChange={(e) =>
                void update({ excludeAutomapper: e.target.checked })
              }
            />
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Candidates per song</label>
              <span className="settings-hint">
                How many maps to offer for each liked song.
              </span>
            </div>
            <div className="settings-control">
              <input
                className="settings-input"
                type="number"
                min={1}
                max={20}
                value={config.candidatesPerSong}
                onChange={(e) =>
                  void update({
                    candidatesPerSong: Math.min(
                      20,
                      Math.max(1, Number(e.target.value) || 1)
                    ),
                  })
                }
                style={{ width: 70 }}
              />
            </div>
          </div>
        </div>

        {/* ---------- Sources ---------- */}
        <div className="settings-group">
          <h3>Sources</h3>

          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 14,
              marginTop: -4,
              lineHeight: 1.5,
            }}
          >
            BeatSaver is searched first and is the only site that actually hosts
            map downloads. The fallbacks below are only consulted when a plain
            search finds nothing.
          </p>

          <div className="settings-row">
            <div className="settings-label">
              <label>BeastSaber curated fallback</label>
              <span className="settings-hint">
                Retry within the BeastSaber-curated pool, reachable through
                BeatSaver's curation flag.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.useCuratedFallback}
              onChange={(e) =>
                void update({ useCuratedFallback: e.target.checked })
              }
            />
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>ScoreSaber fallback</label>
              <span className="settings-hint">
                Search ScoreSaber leaderboards and resolve the results back to
                BeatSaver maps by hash.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.useScoreSaberFallback}
              onChange={(e) =>
                void update({ useScoreSaberFallback: e.target.checked })
              }
            />
          </div>
        </div>

        {/* ---------- Downloads ---------- */}
        <div className="settings-group">
          <h3>Downloads</h3>

          <div className="settings-row">
            <div className="settings-label">
              <label>Maps folder</label>
              <span className="settings-hint">
                Your Beat Saber CustomLevels folder. Each map extracts into its
                own subfolder.
              </span>
            </div>
            <div className="settings-control">
              <input
                className="settings-input"
                value={config.mapsDir}
                onChange={(e) => setConfig({ ...config, mapsDir: e.target.value })}
                onBlur={(e) => void update({ mapsDir: e.target.value })}
                style={{ width: 260 }}
              />
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => void handleSelectDir()}
              >
                Browse
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Parallel downloads</label>
              <span className="settings-hint">
                How many maps download at once when you add in bulk.
              </span>
            </div>
            <div className="settings-control">
              <input
                className="settings-input"
                type="number"
                min={1}
                max={8}
                value={config.concurrency}
                onChange={(e) =>
                  void update({
                    concurrency: Math.min(
                      8,
                      Math.max(1, Number(e.target.value) || 1)
                    ),
                  })
                }
                style={{ width: 70 }}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Keep the .zip</label>
              <span className="settings-hint">
                Also save the original archive inside the map folder.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.keepZip}
              onChange={(e) => void update({ keepZip: e.target.checked })}
            />
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <label>Open maps folder</label>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => void window.api.downloads.openFolder()}
            >
              Open
            </button>
          </div>
        </div>

        {/* ---------- Skin ---------- */}
        <div className="settings-group">
          <h3>Skin</h3>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 14,
              marginTop: -4,
            }}
          >
            Transform the entire look and feel of the app
          </p>
          <div className="skin-grid">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`skin-card ${
                  currentTheme.id === theme.id ? "skin-card-active" : ""
                }`}
                onClick={() => setTheme(theme.id)}
              >
                <div className="skin-preview">
                  <div
                    className="skin-preview-bg"
                    style={{ background: theme.preview.bg }}
                  >
                    <div
                      className="skin-preview-sidebar"
                      style={{
                        background: `color-mix(in srgb, ${theme.preview.bg} 70%, white 10%)`,
                      }}
                    >
                      <div
                        className="skin-preview-dot"
                        style={{ background: theme.preview.accent }}
                      />
                      <div
                        className="skin-preview-line"
                        style={{ background: `${theme.preview.text}40` }}
                      />
                      <div
                        className="skin-preview-line"
                        style={{ background: `${theme.preview.text}40` }}
                      />
                      <div
                        className="skin-preview-line-active"
                        style={{
                          background: theme.preview.accent,
                          boxShadow: `0 0 6px ${theme.preview.accent}60`,
                        }}
                      />
                      <div
                        className="skin-preview-line"
                        style={{ background: `${theme.preview.text}40` }}
                      />
                    </div>
                    <div className="skin-preview-content">
                      <div
                        className="skin-preview-header"
                        style={{ background: `${theme.preview.text}20` }}
                      />
                      <div className="skin-preview-rows">
                        <div
                          className="skin-preview-row"
                          style={{ background: `${theme.preview.text}08` }}
                        />
                        <div
                          className="skin-preview-row"
                          style={{ background: `${theme.preview.text}05` }}
                        />
                        <div
                          className="skin-preview-row"
                          style={{ background: `${theme.preview.text}08` }}
                        />
                      </div>
                      <div
                        className="skin-preview-btn"
                        style={{ background: theme.preview.accent }}
                      />
                    </div>
                  </div>
                </div>
                <div className="skin-info">
                  <span className="skin-name">{theme.name}</span>
                  <span className="skin-desc">{theme.description}</span>
                </div>
                {currentTheme.id === theme.id && (
                  <div className="skin-active-badge">Active</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Decisions ---------- */}
        <div className="settings-group">
          <h3>Decisions</h3>
          <div className="settings-row">
            <div className="settings-label">
              <label>Reset every add / skip choice</label>
              <span className="settings-hint">
                Returns all decided songs to the review queue. Downloaded maps
                stay on disk.
              </span>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={async () => {
                await window.api.matches.resetAll();
              }}
            >
              Reset decisions
            </button>
          </div>
        </div>

        {/* ---------- Account ---------- */}
        <div className="settings-group">
          <h3>Account</h3>
          <div className="settings-row">
            <div className="settings-label">
              <label>Clear account data and sign out</label>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={async () => {
                await window.api.auth.clear();
                onLogout();
              }}
            >
              Clear account
            </button>
          </div>
        </div>

        {/* ---------- Advanced ---------- */}
        <div className="settings-group">
          <h3>Advanced</h3>
          <div className="settings-row">
            <div className="settings-label">
              <label>Open app data folder</label>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => void window.api.settings.openAppData()}
            >
              Open
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-label">
              <label>Restore default settings</label>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => void handleReset()}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
