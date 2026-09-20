import type { ThemeDefinition } from "./theme-types";

export const tokyoSakura: ThemeDefinition = {
  id: "tokyo-sakura",
  name: "Tokyo Sakura",
  description: "Japanese zen minimalism with cherry blossom accents",
  preview: { bg: "#0c0c14", accent: "#f06292", text: "#eceff1" },
  cssVariables: {
    "--bg-primary": "#0c0c14",
    "--bg-secondary": "#12121c",
    "--bg-surface": "#1a1a28",
    "--bg-hover": "#222236",
    "--text-primary": "#eceff1",
    "--text-secondary": "#78909c",
    "--accent": "#f06292",
    "--accent-hover": "#e91e63",
    "--success": "#81c784",
    "--warning": "#ffd54f",
    "--error": "#e57373",
    "--border": "#2c2840",
    "--radius": "12px",
  },
  customCSS: `
/* ============================================================
   Tokyo Sakura  –  Japanese zen minimalism × cherry blossom
   ============================================================ */

/* ---------- keyframes ---------- */

@keyframes sakura-bloom {
  0%, 100% {
    box-shadow:
      0 0 8px  rgba(240, 98, 146, 0.30),
      0 0 20px rgba(240, 98, 146, 0.12);
  }
  50% {
    box-shadow:
      0 0 16px rgba(240, 98, 146, 0.50),
      0 0 40px rgba(206, 147, 216, 0.20),
      0 0 60px rgba(240, 98, 146, 0.08);
  }
}

@keyframes sakura-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

@keyframes sakura-fall-1 {
  0% {
    transform: translate(0, -20px) rotate(0deg) scale(1);
    opacity: 0;
  }
  10% { opacity: 0.9; }
  90% { opacity: 0.7; }
  100% {
    transform: translate(120px, 100vh) rotate(360deg) scale(0.6);
    opacity: 0;
  }
}

@keyframes sakura-fall-2 {
  0% {
    transform: translate(0, -10px) rotate(45deg) scale(0.8);
    opacity: 0;
  }
  15% { opacity: 0.85; }
  85% { opacity: 0.6; }
  100% {
    transform: translate(-90px, 100vh) rotate(-270deg) scale(0.5);
    opacity: 0;
  }
}

@keyframes sakura-fall-3 {
  0% {
    transform: translate(0, -30px) rotate(-20deg) scale(0.9);
    opacity: 0;
  }
  12% { opacity: 0.8; }
  88% { opacity: 0.5; }
  100% {
    transform: translate(150px, 100vh) rotate(300deg) scale(0.4);
    opacity: 0;
  }
}

@keyframes sakura-fall-4 {
  0% {
    transform: translate(0, -15px) rotate(30deg) scale(0.7);
    opacity: 0;
  }
  8% { opacity: 0.75; }
  92% { opacity: 0.4; }
  100% {
    transform: translate(-60px, 100vh) rotate(-330deg) scale(0.55);
    opacity: 0;
  }
}

@keyframes sakura-fall-5 {
  0% {
    transform: translate(0, -25px) rotate(10deg) scale(1.1);
    opacity: 0;
  }
  10% { opacity: 0.7; }
  90% { opacity: 0.5; }
  100% {
    transform: translate(80px, 100vh) rotate(280deg) scale(0.45);
    opacity: 0;
  }
}

@keyframes torii-glow {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(240, 98, 146, 0.20)); }
  50%      { filter: drop-shadow(0 0 10px rgba(240, 98, 146, 0.40)); }
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-3px); }
}

/* ---------- font family ---------- */

[data-theme="tokyo-sakura"] {
  font-family: "Noto Sans", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif;
}

/* ---------- global transitions ---------- */

[data-theme="tokyo-sakura"] *,
[data-theme="tokyo-sakura"] *::before,
[data-theme="tokyo-sakura"] *::after {
  transition-timing-function: ease-in-out;
}

/* ---------- sidebar ---------- */

[data-theme="tokyo-sakura"] .sidebar {
  background: linear-gradient(
    180deg,
    #14122a 0%,
    #12121c 40%,
    #0e1020 70%,
    #0c0c14 100%
  );
  border-right: 1px solid #2c2840;
  position: relative;
}

[data-theme="tokyo-sakura"] .sidebar::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 100% 60% at 50% 0%,
    rgba(240, 98, 146, 0.03) 0%,
    transparent 70%
  );
}

/* ---------- sidebar title - sakura bloom glow ---------- */

[data-theme="tokyo-sakura"] .sidebar-title,
[data-theme="tokyo-sakura"] .sidebar .logo,
[data-theme="tokyo-sakura"] .sidebar h1,
[data-theme="tokyo-sakura"] .sidebar-header .title {
  color: #f06292;
  text-shadow:
    0 0 8px  rgba(240, 98, 146, 0.45),
    0 0 20px rgba(240, 98, 146, 0.20),
    0 0 40px rgba(206, 147, 216, 0.10);
  letter-spacing: 0.06em;
  font-weight: 300;
}

/* ---------- sidebar link - active ---------- */

[data-theme="tokyo-sakura"] .sidebar-link.active,
[data-theme="tokyo-sakura"] .sidebar-nav .active {
  position: relative;
  background: linear-gradient(
    90deg,
    rgba(240, 98, 146, 0.10) 0%,
    transparent 100%
  );
  border-left: 3px solid #f06292;
  box-shadow:
    inset 4px 0 12px rgba(240, 98, 146, 0.08),
    -2px 0 16px rgba(240, 98, 146, 0.06);
}

[data-theme="tokyo-sakura"] .sidebar-link:hover {
  background: rgba(240, 98, 146, 0.06);
  transition: background 0.25s ease-in-out;
}

/* ---------- buttons - gentle transitions ---------- */

[data-theme="tokyo-sakura"] button,
[data-theme="tokyo-sakura"] .btn {
  transition:
    background-color 0.25s ease-in-out,
    box-shadow 0.25s ease-in-out,
    transform 0.15s ease-in-out;
  border-radius: 12px;
}

[data-theme="tokyo-sakura"] button:active,
[data-theme="tokyo-sakura"] .btn:active {
  transform: scale(0.97);
}

/* ---------- .btn-primary - sakura gradient + bloom hover ---------- */

[data-theme="tokyo-sakura"] .btn-primary {
  background: linear-gradient(135deg, #f06292 0%, #ce93d8 100%);
  color: #0c0c14;
  font-weight: 500;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(240, 98, 146, 0.20);
}

[data-theme="tokyo-sakura"] .btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 45%,
    rgba(255, 255, 255, 0.15) 55%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: sakura-shimmer 5s ease-in-out infinite;
  pointer-events: none;
  border-radius: inherit;
}

[data-theme="tokyo-sakura"] .btn-primary:hover {
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 50%, #ffab91 100%);
  box-shadow:
    0 0 16px rgba(240, 98, 146, 0.50),
    0 0 40px rgba(206, 147, 216, 0.20),
    0 0 60px rgba(240, 98, 146, 0.08);
}

/* ---------- badges - soft pastel pills ---------- */

[data-theme="tokyo-sakura"] .badge {
  background: rgba(240, 98, 146, 0.12);
  color: #f48fb1;
  border: 1px solid rgba(240, 98, 146, 0.18);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.8em;
  font-weight: 400;
  letter-spacing: 0.02em;
  transition: all 0.25s ease-in-out;
}

[data-theme="tokyo-sakura"] .badge:hover {
  background: rgba(240, 98, 146, 0.18);
  box-shadow: 0 0 10px rgba(240, 98, 146, 0.15);
}

[data-theme="tokyo-sakura"] .badge-success,
[data-theme="tokyo-sakura"] .badge.success {
  background: rgba(129, 199, 132, 0.12);
  color: #81c784;
  border-color: rgba(129, 199, 132, 0.18);
}

[data-theme="tokyo-sakura"] .badge-warning,
[data-theme="tokyo-sakura"] .badge.warning {
  background: rgba(255, 213, 79, 0.12);
  color: #ffd54f;
  border-color: rgba(255, 213, 79, 0.18);
}

[data-theme="tokyo-sakura"] .badge-error,
[data-theme="tokyo-sakura"] .badge.error {
  background: rgba(229, 115, 115, 0.12);
  color: #e57373;
  border-color: rgba(229, 115, 115, 0.18);
}

/* ---------- song table - zen-like minimal lines ---------- */

[data-theme="tokyo-sakura"] .song-row,
[data-theme="tokyo-sakura"] .track-row,
[data-theme="tokyo-sakura"] tr {
  position: relative;
  transition: background-color 0.25s ease-in-out;
}

[data-theme="tokyo-sakura"] .song-row + .song-row,
[data-theme="tokyo-sakura"] .track-row + .track-row,
[data-theme="tokyo-sakura"] tbody tr + tr {
  border-top: 1px solid rgba(44, 40, 64, 0.5);
}

[data-theme="tokyo-sakura"] .song-row:hover,
[data-theme="tokyo-sakura"] .track-row:hover,
[data-theme="tokyo-sakura"] tbody tr:hover {
  background: rgba(240, 98, 146, 0.04);
}

[data-theme="tokyo-sakura"] .song-row::after,
[data-theme="tokyo-sakura"] .track-row::after,
[data-theme="tokyo-sakura"] tbody tr::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(240, 98, 146, 0.30),
    rgba(206, 147, 216, 0.20),
    transparent
  );
  transition: width 0.3s ease-in-out, left 0.3s ease-in-out;
}

[data-theme="tokyo-sakura"] .song-row:hover::after,
[data-theme="tokyo-sakura"] .track-row:hover::after,
[data-theme="tokyo-sakura"] tbody tr:hover::after {
  width: 90%;
  left: 5%;
}

[data-theme="tokyo-sakura"] table,
[data-theme="tokyo-sakura"] .song-list,
[data-theme="tokyo-sakura"] .track-list {
  border-spacing: 0 4px;
}

[data-theme="tokyo-sakura"] th {
  font-weight: 400;
  color: #78909c;
  text-transform: uppercase;
  font-size: 0.72em;
  letter-spacing: 0.12em;
  border-bottom: 1px solid rgba(44, 40, 64, 0.6);
  padding-bottom: 12px;
}

/* ---------- song thumbnails - rounded with pink glow hover ---------- */

[data-theme="tokyo-sakura"] .album-art,
[data-theme="tokyo-sakura"] .cover-art,
[data-theme="tokyo-sakura"] .thumbnail,
[data-theme="tokyo-sakura"] .song-thumbnail,
[data-theme="tokyo-sakura"] .track-thumbnail {
  border-radius: 10px;
  border: 1px solid rgba(44, 40, 64, 0.6);
  transition: box-shadow 0.25s ease-in-out, border-color 0.25s ease-in-out;
}

[data-theme="tokyo-sakura"] .album-art:hover,
[data-theme="tokyo-sakura"] .cover-art:hover,
[data-theme="tokyo-sakura"] .thumbnail:hover,
[data-theme="tokyo-sakura"] .song-thumbnail:hover,
[data-theme="tokyo-sakura"] .track-thumbnail:hover {
  border-color: rgba(240, 98, 146, 0.30);
  box-shadow:
    0 0 12px rgba(240, 98, 146, 0.18),
    0 0 28px rgba(206, 147, 216, 0.08);
}

/* ---------- queue items - sakura gradient left border ---------- */

[data-theme="tokyo-sakura"] .queue-item,
[data-theme="tokyo-sakura"] .download-item,
[data-theme="tokyo-sakura"] .queue .item {
  border-left: 3px solid transparent;
  border-image: linear-gradient(
    180deg,
    #f06292 0%,
    #ce93d8 60%,
    #b39ddb 100%
  ) 1;
  padding-left: 12px;
  margin-bottom: 2px;
  transition: background 0.25s ease-in-out;
}

[data-theme="tokyo-sakura"] .queue-item:hover,
[data-theme="tokyo-sakura"] .download-item:hover,
[data-theme="tokyo-sakura"] .queue .item:hover {
  background: rgba(240, 98, 146, 0.05);
}

/* ---------- queue progress text ---------- */

[data-theme="tokyo-sakura"] .queue .progress-text,
[data-theme="tokyo-sakura"] .download-progress,
[data-theme="tokyo-sakura"] .progress-label,
[data-theme="tokyo-sakura"] .queue-progress {
  color: #f48fb1;
  text-shadow: 0 0 6px rgba(240, 98, 146, 0.25);
}

/* ---------- scrollbar - thin, minimal, pink ---------- */

[data-theme="tokyo-sakura"] ::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

[data-theme="tokyo-sakura"] ::-webkit-scrollbar-track {
  background: transparent;
}

[data-theme="tokyo-sakura"] ::-webkit-scrollbar-thumb {
  background: rgba(240, 98, 146, 0.25);
  border-radius: 10px;
}

[data-theme="tokyo-sakura"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(240, 98, 146, 0.45);
}

[data-theme="tokyo-sakura"] ::-webkit-scrollbar-corner {
  background: transparent;
}

/* ---------- settings groups - washi paper cards ---------- */

[data-theme="tokyo-sakura"] .settings-group,
[data-theme="tokyo-sakura"] .settings-card {
  background:
    linear-gradient(
      135deg,
      rgba(26, 26, 40, 0.95) 0%,
      rgba(28, 26, 44, 0.90) 100%
    );
  border: 1px solid rgba(44, 40, 64, 0.5);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
}

/* Subtle washi paper texture hint */
[data-theme="tokyo-sakura"] .settings-group::before,
[data-theme="tokyo-sakura"] .settings-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.015;
  background-image:
    radial-gradient(circle at 20% 30%, #f06292 1px, transparent 1px),
    radial-gradient(circle at 60% 70%, #ce93d8 0.5px, transparent 0.5px),
    radial-gradient(circle at 80% 20%, #f06292 0.8px, transparent 0.8px),
    radial-gradient(circle at 40% 80%, #ce93d8 0.6px, transparent 0.6px);
  background-size: 80px 80px, 60px 60px, 70px 70px, 90px 90px;
}

[data-theme="tokyo-sakura"] .settings-group:hover,
[data-theme="tokyo-sakura"] .settings-card:hover {
  border-color: rgba(240, 98, 146, 0.20);
  box-shadow:
    0 0 16px rgba(240, 98, 146, 0.06),
    0 0 32px rgba(206, 147, 216, 0.03);
}

/* ---------- auth page - elegant minimal design ---------- */

[data-theme="tokyo-sakura"] .auth-title,
[data-theme="tokyo-sakura"] .auth h1,
[data-theme="tokyo-sakura"] .auth-page h1,
[data-theme="tokyo-sakura"] .login-title {
  color: #eceff1;
  font-weight: 200;
  font-size: 2.2em;
  letter-spacing: 0.1em;
  text-shadow:
    0 0 12px rgba(240, 98, 146, 0.35),
    0 0 30px rgba(206, 147, 216, 0.15);
}

[data-theme="tokyo-sakura"] .auth-page,
[data-theme="tokyo-sakura"] .auth,
[data-theme="tokyo-sakura"] .login-page {
  position: relative;
  overflow: hidden;
}

/* Torii gate CSS art element - minimalist line art */
[data-theme="tokyo-sakura"] .auth-page::before,
[data-theme="tokyo-sakura"] .auth::before,
[data-theme="tokyo-sakura"] .login-page::before {
  content: "";
  position: absolute;
  bottom: 8%;
  right: 8%;
  width: 100px;
  height: 120px;
  pointer-events: none;
  opacity: 0.06;
  background:
    /* Top beam */
    linear-gradient(to right, #f06292, #f06292) no-repeat 0 0 / 100% 4px,
    /* Second beam */
    linear-gradient(to right, #f06292, #f06292) no-repeat 8% 16px / 84% 3px,
    /* Left pillar */
    linear-gradient(to bottom, #f06292, #f06292) no-repeat 15% 16px / 3px 104px,
    /* Right pillar */
    linear-gradient(to bottom, #f06292, #f06292) no-repeat 82% 16px / 3px 104px,
    /* Left foot */
    linear-gradient(to right, #f06292, #f06292) no-repeat 5% 116px / 28% 3px,
    /* Right foot */
    linear-gradient(to right, #f06292, #f06292) no-repeat 70% 116px / 28% 3px;
  animation: torii-glow 5s ease-in-out infinite;
}

/* Sakura branch decoration - top left */
[data-theme="tokyo-sakura"] .auth-page::after,
[data-theme="tokyo-sakura"] .auth::after,
[data-theme="tokyo-sakura"] .login-page::after {
  content: "";
  position: absolute;
  top: 5%;
  left: 5%;
  width: 80px;
  height: 80px;
  pointer-events: none;
  opacity: 0.05;
  border-radius: 0 60% 0 60%;
  border-right: 2px solid #f06292;
  border-bottom: 2px solid #f06292;
  transform: rotate(-30deg);
}

/* ---------- falling sakura petals on auth page ---------- */

[data-theme="tokyo-sakura"] .auth-page .petal,
[data-theme="tokyo-sakura"] .auth .petal,
[data-theme="tokyo-sakura"] .login-page .petal {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50% 0 50% 50%;
  pointer-events: none;
  z-index: 0;
}

/*
  CSS-only petals using box-shadows on a pseudo-element.
  Five petals positioned across the top, falling diagonally.
*/
[data-theme="tokyo-sakura"] .auth-page > *:first-child::before,
[data-theme="tokyo-sakura"] .auth > *:first-child::before,
[data-theme="tokyo-sakura"] .login-page > *:first-child::before {
  content: "";
  position: fixed;
  top: -20px;
  left: 10%;
  width: 8px;
  height: 8px;
  background: rgba(240, 98, 146, 0.50);
  border-radius: 50% 0 50% 50%;
  pointer-events: none;
  z-index: 0;
  animation: sakura-fall-1 8s ease-in-out infinite;
  box-shadow:
    /* Petal 2 */
    calc(25vw) 0 0 0   rgba(206, 147, 216, 0.40),
    /* Petal 3 */
    calc(50vw) -10px 0 1px rgba(240, 98, 146, 0.35),
    /* Petal 4 */
    calc(70vw) -5px 0 -1px rgba(255, 171, 145, 0.40);
}

[data-theme="tokyo-sakura"] .auth-page > *:first-child::after,
[data-theme="tokyo-sakura"] .auth > *:first-child::after,
[data-theme="tokyo-sakura"] .login-page > *:first-child::after {
  content: "";
  position: fixed;
  top: -30px;
  left: 35%;
  width: 6px;
  height: 6px;
  background: rgba(206, 147, 216, 0.45);
  border-radius: 50% 0 50% 50%;
  pointer-events: none;
  z-index: 0;
  animation: sakura-fall-2 11s ease-in-out infinite 1s;
  box-shadow:
    calc(20vw) 5px 0 1px rgba(240, 98, 146, 0.30),
    calc(-15vw) -8px 0 0  rgba(255, 171, 145, 0.35);
}

/* Additional petals for fuller effect */
[data-theme="tokyo-sakura"] .auth-page > *:last-child::before,
[data-theme="tokyo-sakura"] .auth > *:last-child::before,
[data-theme="tokyo-sakura"] .login-page > *:last-child::before {
  content: "";
  position: fixed;
  top: -25px;
  left: 55%;
  width: 7px;
  height: 7px;
  background: rgba(240, 98, 146, 0.35);
  border-radius: 50% 0 50% 50%;
  pointer-events: none;
  z-index: 0;
  animation: sakura-fall-3 13s ease-in-out infinite 3s;
}

[data-theme="tokyo-sakura"] .auth-page > *:last-child::after,
[data-theme="tokyo-sakura"] .auth > *:last-child::after,
[data-theme="tokyo-sakura"] .login-page > *:last-child::after {
  content: "";
  position: fixed;
  top: -15px;
  left: 80%;
  width: 9px;
  height: 9px;
  background: rgba(206, 147, 216, 0.30);
  border-radius: 50% 0 50% 50%;
  pointer-events: none;
  z-index: 0;
  animation: sakura-fall-4 10s ease-in-out infinite 5s;
}

/* ---------- input focus - soft pink glow ---------- */

[data-theme="tokyo-sakura"] input[type="search"],
[data-theme="tokyo-sakura"] input[type="text"],
[data-theme="tokyo-sakura"] input[type="password"],
[data-theme="tokyo-sakura"] input[type="url"],
[data-theme="tokyo-sakura"] textarea,
[data-theme="tokyo-sakura"] select,
[data-theme="tokyo-sakura"] .search-input {
  background: #12121c;
  border: 1px solid #2c2840;
  color: #eceff1;
  border-radius: 12px;
  padding: 10px 14px;
  transition: border-color 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
}

[data-theme="tokyo-sakura"] input[type="search"]:focus,
[data-theme="tokyo-sakura"] input[type="text"]:focus,
[data-theme="tokyo-sakura"] input[type="password"]:focus,
[data-theme="tokyo-sakura"] input[type="url"]:focus,
[data-theme="tokyo-sakura"] textarea:focus,
[data-theme="tokyo-sakura"] select:focus,
[data-theme="tokyo-sakura"] .search-input:focus {
  border-color: rgba(240, 98, 146, 0.50);
  box-shadow:
    0 0 8px  rgba(240, 98, 146, 0.25),
    0 0 20px rgba(240, 98, 146, 0.10),
    0 0 40px rgba(206, 147, 216, 0.05);
  outline: none;
}

/* ---------- links & accent text ---------- */

[data-theme="tokyo-sakura"] a {
  color: #f48fb1;
  text-decoration: none;
  transition: color 0.25s ease-in-out, text-shadow 0.25s ease-in-out;
}

[data-theme="tokyo-sakura"] a:hover {
  color: #f06292;
  text-shadow: 0 0 8px rgba(240, 98, 146, 0.30);
}

/* ---------- progress bars ---------- */

[data-theme="tokyo-sakura"] progress,
[data-theme="tokyo-sakura"] .progress-bar {
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a28;
}

[data-theme="tokyo-sakura"] progress::-webkit-progress-bar {
  background: #1a1a28;
  border-radius: 12px;
}

[data-theme="tokyo-sakura"] progress::-webkit-progress-value {
  background: linear-gradient(90deg, #f06292, #ce93d8, #ffab91);
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(240, 98, 146, 0.30);
}

[data-theme="tokyo-sakura"] .progress-fill {
  background: linear-gradient(90deg, #f06292, #ce93d8, #ffab91);
  box-shadow: 0 0 10px rgba(240, 98, 146, 0.30);
  border-radius: 12px;
  transition: width 0.4s ease-in-out;
}

/* ---------- cards, panels, modals ---------- */

[data-theme="tokyo-sakura"] .card,
[data-theme="tokyo-sakura"] .panel,
[data-theme="tokyo-sakura"] .modal {
  background: #1a1a28;
  border: 1px solid #2c2840;
  border-radius: 12px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.40),
    0 0 1px rgba(240, 98, 146, 0.06);
}

/* ---------- header / toolbar ---------- */

[data-theme="tokyo-sakura"] .header,
[data-theme="tokyo-sakura"] .toolbar,
[data-theme="tokyo-sakura"] .titlebar {
  background: linear-gradient(
    180deg,
    #12121c 0%,
    #0c0c14 100%
  );
  border-bottom: 1px solid #2c2840;
}

/* ---------- dividers - zen ink line ---------- */

[data-theme="tokyo-sakura"] hr,
[data-theme="tokyo-sakura"] .divider {
  border: none;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(44, 40, 64, 0.4) 15%,
    rgba(240, 98, 146, 0.10) 50%,
    rgba(44, 40, 64, 0.4) 85%,
    transparent 100%
  );
  margin: 16px 0;
}

/* ---------- now-playing / player bar ---------- */

[data-theme="tokyo-sakura"] .player-bar,
[data-theme="tokyo-sakura"] .now-playing {
  background: linear-gradient(
    0deg,
    #08080e 0%,
    #0c0c14 100%
  );
  border-top: 1px solid #2c2840;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.30);
}

/* ---------- tooltips ---------- */

[data-theme="tokyo-sakura"] .tooltip,
[data-theme="tokyo-sakura"] [role="tooltip"] {
  background: #1a1a28;
  color: #eceff1;
  border: 1px solid rgba(240, 98, 146, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.50);
  border-radius: 10px;
  font-size: 0.85em;
}

/* ---------- selection highlight ---------- */

[data-theme="tokyo-sakura"] ::selection {
  background: rgba(240, 98, 146, 0.25);
  color: #eceff1;
}

/* ---------- focus-visible outline for accessibility ---------- */

[data-theme="tokyo-sakura"] :focus-visible {
  outline: 2px solid rgba(240, 98, 146, 0.50);
  outline-offset: 2px;
}

/* ---------- tags, chips ---------- */

[data-theme="tokyo-sakura"] .tag,
[data-theme="tokyo-sakura"] .chip {
  background: rgba(206, 147, 216, 0.10);
  color: #ce93d8;
  border: 1px solid rgba(206, 147, 216, 0.15);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.8em;
}

/* ---------- toggle / switch accents ---------- */

[data-theme="tokyo-sakura"] input[type="checkbox"]:checked,
[data-theme="tokyo-sakura"] .toggle.active,
[data-theme="tokyo-sakura"] .switch.active {
  background: linear-gradient(135deg, #f06292, #ce93d8);
  box-shadow: 0 0 8px rgba(240, 98, 146, 0.30);
}

/* ---------- empty state / placeholder text ---------- */

[data-theme="tokyo-sakura"] .empty-state,
[data-theme="tokyo-sakura"] .placeholder {
  color: #546e7a;
  font-style: italic;
  font-weight: 300;
  letter-spacing: 0.03em;
}

/* ---------- notification / toast ---------- */

[data-theme="tokyo-sakura"] .notification,
[data-theme="tokyo-sakura"] .toast {
  background: #1a1a28;
  border: 1px solid #2c2840;
  border-left: 3px solid #f06292;
  border-radius: 12px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.40),
    0 0 12px rgba(240, 98, 146, 0.06);
}

/* ---------- tab active state ---------- */

[data-theme="tokyo-sakura"] .tab.active,
[data-theme="tokyo-sakura"] .tab-active {
  border-bottom: 2px solid #f06292;
  color: #eceff1;
  text-shadow: 0 0 6px rgba(240, 98, 146, 0.15);
}

[data-theme="tokyo-sakura"] .tab {
  transition: color 0.25s ease-in-out, border-color 0.25s ease-in-out;
}

/* ---------- stat / count numbers ---------- */

[data-theme="tokyo-sakura"] .stat-value,
[data-theme="tokyo-sakura"] .count {
  color: #f48fb1;
  font-weight: 300;
  font-size: 1.4em;
  text-shadow: 0 0 8px rgba(240, 98, 146, 0.15);
}

/* ---------- zen breathing room - spacing overrides ---------- */

[data-theme="tokyo-sakura"] .content-area,
[data-theme="tokyo-sakura"] .main-content,
[data-theme="tokyo-sakura"] main {
  padding: 24px 28px;
}

[data-theme="tokyo-sakura"] h1,
[data-theme="tokyo-sakura"] h2,
[data-theme="tokyo-sakura"] h3 {
  font-weight: 300;
  letter-spacing: 0.04em;
}

[data-theme="tokyo-sakura"] h1 {
  margin-bottom: 20px;
}

[data-theme="tokyo-sakura"] h2 {
  margin-bottom: 16px;
}

/* ---------- code / monospace ---------- */

[data-theme="tokyo-sakura"] code,
[data-theme="tokyo-sakura"] pre {
  background: #12121c;
  border: 1px solid #2c2840;
  border-radius: 8px;
  color: #ffab91;
  font-size: 0.88em;
}

/* ---------- dropdown / menu ---------- */

[data-theme="tokyo-sakura"] .dropdown,
[data-theme="tokyo-sakura"] .menu,
[data-theme="tokyo-sakura"] .context-menu {
  background: #1a1a28;
  border: 1px solid #2c2840;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.50);
  overflow: hidden;
}

[data-theme="tokyo-sakura"] .dropdown-item:hover,
[data-theme="tokyo-sakura"] .menu-item:hover {
  background: rgba(240, 98, 146, 0.08);
}

/* ---------- loading / spinner ---------- */

[data-theme="tokyo-sakura"] .spinner,
[data-theme="tokyo-sakura"] .loading-spinner {
  border-color: #2c2840;
  border-top-color: #f06292;
}
`,
};
