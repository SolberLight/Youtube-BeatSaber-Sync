import type { ThemeDefinition } from "./theme-types";

export const midnightEmber: ThemeDefinition = {
  id: "midnight-ember",
  name: "Midnight Ember",
  description: "Smoldering dark theme with warm ember accents",
  preview: { bg: "#0d0d0d", accent: "#e65100", text: "#fff3e0" },
  cssVariables: {
    "--bg-primary": "#0d0d0d",
    "--bg-secondary": "#141414",
    "--bg-surface": "#1c1c1c",
    "--bg-hover": "#2c2420",
    "--text-primary": "#fff3e0",
    "--text-secondary": "#bcaaa4",
    "--accent": "#e65100",
    "--accent-hover": "#bf360c",
    "--success": "#66bb6a",
    "--warning": "#ffc107",
    "--error": "#e53935",
    "--border": "#2c2420",
    "--radius": "10px",
  },
  customCSS: `
/* ============================================================
   Midnight Ember  -  Smoldering dark theme
   ============================================================ */

/* ---------- keyframes ---------- */

@keyframes ember-breathe {
  0%, 100% {
    box-shadow:
      0 0 8px  rgba(230, 81, 0, 0.35),
      0 0 20px rgba(191, 54, 12, 0.18);
  }
  50% {
    box-shadow:
      0 0 14px rgba(230, 81, 0, 0.55),
      0 0 36px rgba(191, 54, 12, 0.30),
      0 0 56px rgba(255, 171, 0, 0.10);
  }
}

@keyframes ember-glow-pulse {
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 0.75; }
}

@keyframes ember-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

/* ---------- sidebar ---------- */

[data-theme="midnight-ember"] .sidebar {
  background: linear-gradient(
    180deg,
    #141414 0%,
    #1a1410 38%,
    #181210 72%,
    #0d0d0d 100%
  );
  border-right: 1px solid #2c2420;
}

[data-theme="midnight-ember"] .sidebar::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 120% 80% at 50% 100%,
    rgba(230, 81, 0, 0.04) 0%,
    transparent 70%
  );
}

/* ---------- sidebar link - active ---------- */

[data-theme="midnight-ember"] .sidebar-link.active,
[data-theme="midnight-ember"] .sidebar-nav .active {
  position: relative;
  background: linear-gradient(
    90deg,
    rgba(230, 81, 0, 0.12) 0%,
    transparent 100%
  );
  border-left: 3px solid transparent;
  border-image: linear-gradient(
    180deg,
    #ffab00 0%,
    #e65100 50%,
    #bf360c 100%
  ) 1;
}

[data-theme="midnight-ember"] .sidebar-link:hover {
  background: rgba(230, 81, 0, 0.08);
}

/* ---------- buttons - warm glow hover ---------- */

[data-theme="midnight-ember"] button,
[data-theme="midnight-ember"] .btn {
  transition:
    background-color 0.25s ease,
    box-shadow 0.35s ease,
    transform 0.15s ease;
}

[data-theme="midnight-ember"] button:hover,
[data-theme="midnight-ember"] .btn:hover {
  box-shadow:
    0 0 10px rgba(230, 81, 0, 0.30),
    0 0 24px rgba(191, 54, 12, 0.12);
}

[data-theme="midnight-ember"] button:active,
[data-theme="midnight-ember"] .btn:active {
  transform: scale(0.97);
}

/* ---------- .btn-primary - breathing ember ---------- */

[data-theme="midnight-ember"] .btn-primary {
  background: linear-gradient(135deg, #e65100 0%, #bf360c 100%);
  color: #fff3e0;
  border: none;
  animation: ember-breathe 3.2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

[data-theme="midnight-ember"] .btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 171, 0, 0.18) 45%,
    rgba(255, 171, 0, 0.18) 55%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: ember-shimmer 4s ease-in-out infinite;
  pointer-events: none;
  border-radius: inherit;
}

[data-theme="midnight-ember"] .btn-primary:hover {
  background: linear-gradient(135deg, #ff6d00 0%, #d84315 100%);
  box-shadow:
    0 0 14px rgba(230, 81, 0, 0.55),
    0 0 40px rgba(191, 54, 12, 0.25),
    0 0 60px rgba(255, 171, 0, 0.10);
}

/* ---------- badges - warm glow ---------- */

[data-theme="midnight-ember"] .badge {
  background: linear-gradient(135deg, #e65100 0%, #bf360c 100%);
  color: #fff3e0;
  box-shadow: 0 0 8px rgba(230, 81, 0, 0.35);
  border: 1px solid rgba(255, 171, 0, 0.15);
  transition: box-shadow 0.3s ease;
}

[data-theme="midnight-ember"] .badge:hover {
  box-shadow:
    0 0 12px rgba(230, 81, 0, 0.50),
    0 0 28px rgba(191, 54, 12, 0.20);
}

/* ---------- song table rows - ember underline hover ---------- */

[data-theme="midnight-ember"] .song-row,
[data-theme="midnight-ember"] .track-row,
[data-theme="midnight-ember"] tr {
  position: relative;
  transition: background-color 0.2s ease;
}

[data-theme="midnight-ember"] .song-row::after,
[data-theme="midnight-ember"] .track-row::after,
[data-theme="midnight-ember"] tbody tr::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #bf360c, #e65100, #ffab00, #e65100, #bf360c);
  transition: width 0.35s ease, left 0.35s ease;
  border-radius: 1px;
}

[data-theme="midnight-ember"] .song-row:hover::after,
[data-theme="midnight-ember"] .track-row:hover::after,
[data-theme="midnight-ember"] tbody tr:hover::after {
  width: 92%;
  left: 4%;
}

[data-theme="midnight-ember"] .song-row:hover,
[data-theme="midnight-ember"] .track-row:hover,
[data-theme="midnight-ember"] tbody tr:hover {
  background: rgba(230, 81, 0, 0.06);
}

/* ---------- scrollbar ---------- */

[data-theme="midnight-ember"] ::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

[data-theme="midnight-ember"] ::-webkit-scrollbar-track {
  background: #0d0d0d;
}

[data-theme="midnight-ember"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3e2723, #4e342e);
  border-radius: 10px;
  border: 1px solid rgba(230, 81, 0, 0.10);
}

[data-theme="midnight-ember"] ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #4e342e, #5d4037);
  box-shadow: 0 0 6px rgba(230, 81, 0, 0.25);
}

[data-theme="midnight-ember"] ::-webkit-scrollbar-corner {
  background: #0d0d0d;
}

/* ---------- queue progress text ---------- */

[data-theme="midnight-ember"] .queue .progress-text,
[data-theme="midnight-ember"] .download-progress,
[data-theme="midnight-ember"] .progress-label,
[data-theme="midnight-ember"] .queue-progress {
  color: #ffab00;
  text-shadow: 0 0 6px rgba(255, 171, 0, 0.30);
}

/* ---------- .settings-group cards - warm border glow ---------- */

[data-theme="midnight-ember"] .settings-group,
[data-theme="midnight-ember"] .settings-card {
  background: #1c1c1c;
  border: 1px solid #2c2420;
  border-radius: 10px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

[data-theme="midnight-ember"] .settings-group:hover,
[data-theme="midnight-ember"] .settings-card:hover {
  border-color: rgba(230, 81, 0, 0.30);
  box-shadow:
    0 0 12px rgba(230, 81, 0, 0.10),
    0 0 28px rgba(191, 54, 12, 0.06),
    inset 0 0 20px rgba(230, 81, 0, 0.03);
}

/* ---------- auth page title - text-shadow glow ---------- */

[data-theme="midnight-ember"] .auth-title,
[data-theme="midnight-ember"] .auth h1,
[data-theme="midnight-ember"] .auth-page h1,
[data-theme="midnight-ember"] .login-title {
  color: #fff3e0;
  text-shadow:
    0 0 10px rgba(230, 81, 0, 0.50),
    0 0 30px rgba(191, 54, 12, 0.25),
    0 0 50px rgba(255, 171, 0, 0.10);
  letter-spacing: 0.03em;
}

/* ---------- search input - warm glow border on focus ---------- */

[data-theme="midnight-ember"] input[type="search"],
[data-theme="midnight-ember"] input[type="text"],
[data-theme="midnight-ember"] .search-input {
  background: #141414;
  border: 1px solid #2c2420;
  color: #fff3e0;
  border-radius: 10px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

[data-theme="midnight-ember"] input[type="search"]:focus,
[data-theme="midnight-ember"] input[type="text"]:focus,
[data-theme="midnight-ember"] .search-input:focus {
  border-color: #e65100;
  box-shadow:
    0 0 8px  rgba(230, 81, 0, 0.35),
    0 0 20px rgba(191, 54, 12, 0.15),
    0 0 40px rgba(255, 171, 0, 0.06);
  outline: none;
}

/* ---------- links & accent text ---------- */

[data-theme="midnight-ember"] a {
  color: #ffab00;
  text-decoration: none;
  transition: color 0.2s ease, text-shadow 0.2s ease;
}

[data-theme="midnight-ember"] a:hover {
  color: #e65100;
  text-shadow: 0 0 8px rgba(230, 81, 0, 0.30);
}

/* ---------- progress bars ---------- */

[data-theme="midnight-ember"] progress,
[data-theme="midnight-ember"] .progress-bar {
  border-radius: 10px;
  overflow: hidden;
  background: #1c1c1c;
}

[data-theme="midnight-ember"] progress::-webkit-progress-bar {
  background: #1c1c1c;
  border-radius: 10px;
}

[data-theme="midnight-ember"] progress::-webkit-progress-value {
  background: linear-gradient(90deg, #bf360c, #e65100, #ff8f00);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(230, 81, 0, 0.40);
}

[data-theme="midnight-ember"] .progress-fill {
  background: linear-gradient(90deg, #bf360c, #e65100, #ff8f00);
  box-shadow: 0 0 10px rgba(230, 81, 0, 0.40);
  border-radius: 10px;
  transition: width 0.4s ease;
}

/* ---------- cards, panels, modals ---------- */

[data-theme="midnight-ember"] .card,
[data-theme="midnight-ember"] .panel,
[data-theme="midnight-ember"] .modal {
  background: #1c1c1c;
  border: 1px solid #2c2420;
  border-radius: 10px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.50),
    0 0 1px rgba(230, 81, 0, 0.08);
}

/* ---------- tooltips ---------- */

[data-theme="midnight-ember"] .tooltip,
[data-theme="midnight-ember"] [role="tooltip"] {
  background: #1c1c1c;
  color: #fff3e0;
  border: 1px solid rgba(230, 81, 0, 0.20);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.60);
  border-radius: 8px;
}

/* ---------- selection highlight ---------- */

[data-theme="midnight-ember"] ::selection {
  background: rgba(230, 81, 0, 0.30);
  color: #fff3e0;
}

/* ---------- focus-visible outline for accessibility ---------- */

[data-theme="midnight-ember"] :focus-visible {
  outline: 2px solid rgba(230, 81, 0, 0.60);
  outline-offset: 2px;
}

/* ---------- header / toolbar area ---------- */

[data-theme="midnight-ember"] .header,
[data-theme="midnight-ember"] .toolbar,
[data-theme="midnight-ember"] .titlebar {
  background: linear-gradient(
    180deg,
    #141414 0%,
    #0d0d0d 100%
  );
  border-bottom: 1px solid #2c2420;
}

/* ---------- dividers ---------- */

[data-theme="midnight-ember"] hr,
[data-theme="midnight-ember"] .divider {
  border: none;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #2c2420 20%,
    rgba(230, 81, 0, 0.15) 50%,
    #2c2420 80%,
    transparent 100%
  );
}

/* ---------- now-playing / player bar ---------- */

[data-theme="midnight-ember"] .player-bar,
[data-theme="midnight-ember"] .now-playing {
  background: linear-gradient(
    0deg,
    #0a0a0a 0%,
    #141414 100%
  );
  border-top: 1px solid #2c2420;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.40);
}

/* ---------- album art glow ---------- */

[data-theme="midnight-ember"] .album-art,
[data-theme="midnight-ember"] .cover-art {
  border-radius: 8px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.50),
    0 0 20px rgba(230, 81, 0, 0.12);
  transition: box-shadow 0.3s ease;
}

[data-theme="midnight-ember"] .album-art:hover,
[data-theme="midnight-ember"] .cover-art:hover {
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.60),
    0 0 30px rgba(230, 81, 0, 0.22);
}

/* ---------- font family ---------- */

[data-theme="midnight-ember"] {
  font-family: "Inter", "SF Pro Display", system-ui, sans-serif;
}
`,
};
