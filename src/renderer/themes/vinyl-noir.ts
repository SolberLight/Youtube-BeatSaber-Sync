import type { ThemeDefinition } from "./theme-types";

export const vinylNoir: ThemeDefinition = {
  id: "vinyl-noir",
  name: "Vinyl Noir",
  description: "Retro vinyl warmth meets film noir elegance",
  preview: { bg: "#121010", accent: "#d4a045", text: "#f5e6c8" },
  cssVariables: {
    "--bg-primary": "#121010",
    "--bg-secondary": "#1a1614",
    "--bg-surface": "#221e1b",
    "--bg-hover": "#2a2420",
    "--text-primary": "#f5e6c8",
    "--text-secondary": "#a0907c",
    "--accent": "#d4a045",
    "--accent-hover": "#e0b050",
    "--success": "#6b8f71",
    "--warning": "#d4a045",
    "--error": "#8b2252",
    "--border": "#3a3028",
    "--radius": "4px",
  },
  customCSS: `
/* =============================================
   VINYL NOIR - Retro Luxe Music Theme
   ============================================= */

/* --- Typography: Elegant Serif Foundation --- */
[data-theme="vinyl-noir"] {
  font-family: "Georgia", "Palatino Linotype", "Palatino", "Times New Roman", serif;
}

[data-theme="vinyl-noir"] h1,
[data-theme="vinyl-noir"] h2,
[data-theme="vinyl-noir"] h3,
[data-theme="vinyl-noir"] h4,
[data-theme="vinyl-noir"] h5,
[data-theme="vinyl-noir"] h6 {
  font-family: "Georgia", "Palatino Linotype", "Palatino", "Times New Roman", serif;
  letter-spacing: 0.03em;
}

/* --- Film Grain Overlay on Main Content --- */
[data-theme="vinyl-noir"] .main-content,
[data-theme="vinyl-noir"] [class*="mainContent"],
[data-theme="vinyl-noir"] main {
  position: relative;
}

[data-theme="vinyl-noir"] .main-content::after,
[data-theme="vinyl-noir"] [class*="mainContent"]::after,
[data-theme="vinyl-noir"] main::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image:
    repeating-radial-gradient(circle at 17% 32%, #f5e6c8 0px, transparent 1px),
    repeating-radial-gradient(circle at 62% 68%, #f5e6c8 0px, transparent 1px),
    repeating-radial-gradient(circle at 85% 15%, #f5e6c8 0px, transparent 1px);
  background-size: 3px 3px, 5px 5px, 4px 4px;
  animation: vinyl-noir-grain 0.4s steps(3) infinite;
}

@keyframes vinyl-noir-grain {
  0%   { transform: translate(0, 0); }
  33%  { transform: translate(-1px, 1px); }
  66%  { transform: translate(1px, -1px); }
  100% { transform: translate(0, 0); }
}

/* --- Sidebar: Leather-Textured Appearance --- */
[data-theme="vinyl-noir"] aside,
[data-theme="vinyl-noir"] [class*="sidebar"],
[data-theme="vinyl-noir"] nav[class*="Sidebar"],
[data-theme="vinyl-noir"] .sidebar {
  background:
    linear-gradient(
      180deg,
      #1a1614 0%,
      #1e1a17 30%,
      #1a1614 60%,
      #161311 100%
    ) !important;
  background-size: 100% 100%, 200px 200px !important;
  border-right: 1px solid #3a3028 !important;
  box-shadow: inset -1px 0 8px rgba(0, 0, 0, 0.4) !important;
  position: relative;
}

/* Leather texture dots overlay on sidebar */
[data-theme="vinyl-noir"] aside::before,
[data-theme="vinyl-noir"] [class*="sidebar"]::before,
[data-theme="vinyl-noir"] .sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.04;
  background-image:
    radial-gradient(circle at 1px 1px, #f5e6c8 0.5px, transparent 0.5px);
  background-size: 4px 4px;
}

/* --- Sidebar Title: Elegant Gold Serif --- */
[data-theme="vinyl-noir"] aside h1,
[data-theme="vinyl-noir"] aside h2,
[data-theme="vinyl-noir"] aside [class*="logo"],
[data-theme="vinyl-noir"] aside [class*="title"],
[data-theme="vinyl-noir"] aside [class*="brand"],
[data-theme="vinyl-noir"] [class*="sidebar"] h1,
[data-theme="vinyl-noir"] [class*="sidebar"] h2,
[data-theme="vinyl-noir"] .sidebar h1,
[data-theme="vinyl-noir"] .sidebar h2,
[data-theme="vinyl-noir"] [class*="sidebarTitle"],
[data-theme="vinyl-noir"] [class*="appTitle"] {
  font-family: "Georgia", "Palatino Linotype", "Palatino", serif !important;
  color: #d4a045 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase;
  font-weight: 400 !important;
  text-shadow: 0 1px 3px rgba(212, 160, 69, 0.15);
}

/* --- Active Sidebar Link: Gold Glow --- */
[data-theme="vinyl-noir"] aside a.active,
[data-theme="vinyl-noir"] aside [class*="active"],
[data-theme="vinyl-noir"] [class*="sidebar"] a.active,
[data-theme="vinyl-noir"] [class*="sidebar"] [class*="active"],
[data-theme="vinyl-noir"] .sidebar a.active,
[data-theme="vinyl-noir"] .sidebar .active {
  border-left: 3px solid #d4a045 !important;
  background: linear-gradient(90deg, rgba(212, 160, 69, 0.08) 0%, transparent 70%) !important;
  box-shadow: inset 4px 0 12px rgba(212, 160, 69, 0.06) !important;
  color: #f5e6c8 !important;
}

[data-theme="vinyl-noir"] aside a,
[data-theme="vinyl-noir"] [class*="sidebar"] a,
[data-theme="vinyl-noir"] .sidebar a,
[data-theme="vinyl-noir"] aside [class*="navItem"],
[data-theme="vinyl-noir"] [class*="sidebar"] [class*="navItem"] {
  font-family: "Georgia", "Palatino Linotype", serif !important;
  letter-spacing: 0.04em;
  transition: all 0.25s ease;
}

[data-theme="vinyl-noir"] aside a:hover,
[data-theme="vinyl-noir"] [class*="sidebar"] a:hover,
[data-theme="vinyl-noir"] .sidebar a:hover {
  background: rgba(212, 160, 69, 0.05) !important;
}

/* --- Vintage Brass Buttons --- */
[data-theme="vinyl-noir"] .btn-primary,
[data-theme="vinyl-noir"] button[class*="primary"],
[data-theme="vinyl-noir"] [class*="btnPrimary"],
[data-theme="vinyl-noir"] [class*="btn-primary"] {
  background: linear-gradient(
    180deg,
    #e0b050 0%,
    #d4a045 40%,
    #b8922e 100%
  ) !important;
  color: #1a1614 !important;
  border: 1px solid #b87333 !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 2px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.3) !important;
  font-family: "Georgia", "Palatino Linotype", serif !important;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.85em;
  font-weight: 700;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

[data-theme="vinyl-noir"] .btn-primary:hover,
[data-theme="vinyl-noir"] button[class*="primary"]:hover,
[data-theme="vinyl-noir"] [class*="btnPrimary"]:hover,
[data-theme="vinyl-noir"] [class*="btn-primary"]:hover {
  background: linear-gradient(
    180deg,
    #ebb85a 0%,
    #daa950 40%,
    #c49a35 100%
  ) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1),
    0 3px 8px rgba(212, 160, 69, 0.25) !important;
}

[data-theme="vinyl-noir"] .btn-primary:active,
[data-theme="vinyl-noir"] button[class*="primary"]:active,
[data-theme="vinyl-noir"] [class*="btnPrimary"]:active,
[data-theme="vinyl-noir"] [class*="btn-primary"]:active {
  background: linear-gradient(
    180deg,
    #b8922e 0%,
    #d4a045 60%,
    #e0b050 100%
  ) !important;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

/* --- Song Table Headers: Small-Caps Elegance --- */
[data-theme="vinyl-noir"] table th,
[data-theme="vinyl-noir"] [class*="tableHeader"],
[data-theme="vinyl-noir"] [class*="table-header"],
[data-theme="vinyl-noir"] thead th,
[data-theme="vinyl-noir"] [class*="columnHeader"] {
  font-variant: small-caps !important;
  letter-spacing: 0.14em !important;
  font-family: "Georgia", "Palatino Linotype", serif !important;
  color: #a0907c !important;
  font-weight: 400 !important;
  font-size: 0.9em !important;
  border-bottom: 1px solid #3a3028 !important;
  text-transform: lowercase;
}

/* --- Song Table: Warm Row Separators --- */
[data-theme="vinyl-noir"] table tr,
[data-theme="vinyl-noir"] [class*="tableRow"],
[data-theme="vinyl-noir"] [class*="songRow"],
[data-theme="vinyl-noir"] [class*="trackRow"] {
  border-bottom: 1px solid rgba(58, 48, 40, 0.5) !important;
  transition: background-color 0.2s ease;
}

[data-theme="vinyl-noir"] table tr:hover,
[data-theme="vinyl-noir"] [class*="tableRow"]:hover,
[data-theme="vinyl-noir"] [class*="songRow"]:hover,
[data-theme="vinyl-noir"] [class*="trackRow"]:hover {
  background: rgba(212, 160, 69, 0.03) !important;
}

/* Alternating rows: subtle warmth */
[data-theme="vinyl-noir"] table tbody tr:nth-child(even),
[data-theme="vinyl-noir"] [class*="tableRow"]:nth-child(even) {
  background: rgba(42, 36, 32, 0.3);
}

/* --- Badge / Label Elements: Vintage Labels --- */
[data-theme="vinyl-noir"] [class*="badge"],
[data-theme="vinyl-noir"] [class*="Badge"],
[data-theme="vinyl-noir"] [class*="tag"],
[data-theme="vinyl-noir"] [class*="label"],
[data-theme="vinyl-noir"] .badge {
  font-family: "Georgia", "Palatino Linotype", serif !important;
  border-radius: 2px !important;
  padding: 2px 10px !important;
  letter-spacing: 0.08em;
  font-variant: small-caps;
  font-size: 0.85em;
  border: 1px solid #3a3028 !important;
  background: rgba(42, 36, 32, 0.6) !important;
  color: #f5e6c8 !important;
  text-transform: lowercase;
}

/* --- Settings Groups: Vintage Panel --- */
[data-theme="vinyl-noir"] [class*="settingsGroup"],
[data-theme="vinyl-noir"] [class*="settings-group"],
[data-theme="vinyl-noir"] [class*="settingsSection"],
[data-theme="vinyl-noir"] [class*="settingCard"],
[data-theme="vinyl-noir"] [class*="panel"],
[data-theme="vinyl-noir"] fieldset {
  border: 1px solid #3a3028 !important;
  border-radius: 4px !important;
  box-shadow:
    inset 0 1px 4px rgba(0, 0, 0, 0.2),
    0 1px 0 rgba(245, 230, 200, 0.02) !important;
  background: linear-gradient(
    180deg,
    rgba(26, 22, 20, 0.6) 0%,
    rgba(18, 16, 16, 0.8) 100%
  ) !important;
}

/* --- Input Fields: Vintage Inset --- */
[data-theme="vinyl-noir"] input[type="text"],
[data-theme="vinyl-noir"] input[type="number"],
[data-theme="vinyl-noir"] input[type="password"],
[data-theme="vinyl-noir"] input[type="email"],
[data-theme="vinyl-noir"] input[type="url"],
[data-theme="vinyl-noir"] input[type="search"],
[data-theme="vinyl-noir"] textarea,
[data-theme="vinyl-noir"] select {
  background: #161311 !important;
  border: 1px solid #3a3028 !important;
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
  color: #f5e6c8 !important;
  font-family: "Georgia", "Palatino Linotype", serif !important;
  border-radius: 3px !important;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

[data-theme="vinyl-noir"] input:focus,
[data-theme="vinyl-noir"] textarea:focus,
[data-theme="vinyl-noir"] select:focus {
  border-color: #d4a045 !important;
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.35),
    0 0 0 2px rgba(212, 160, 69, 0.12) !important;
  outline: none !important;
}

/* --- Custom Scrollbar: Vintage Slider --- */
[data-theme="vinyl-noir"] ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

[data-theme="vinyl-noir"] ::-webkit-scrollbar-track {
  background: #121010;
  border-left: 1px solid #2a2420;
}

[data-theme="vinyl-noir"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    #b8922e 0%,
    #d4a045 50%,
    #b8922e 100%
  );
  border-radius: 5px;
  border: 2px solid #121010;
  min-height: 40px;
}

[data-theme="vinyl-noir"] ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    #c49a35 0%,
    #e0b050 50%,
    #c49a35 100%
  );
}

[data-theme="vinyl-noir"] ::-webkit-scrollbar-corner {
  background: #121010;
}

/* --- Queue Items: Golden Left Accent --- */
[data-theme="vinyl-noir"] [class*="queueItem"],
[data-theme="vinyl-noir"] [class*="queue-item"],
[data-theme="vinyl-noir"] [class*="downloadItem"],
[data-theme="vinyl-noir"] [class*="download-item"] {
  border-left: 3px solid #d4a045 !important;
  background: linear-gradient(90deg, rgba(212, 160, 69, 0.04) 0%, transparent 40%) !important;
  margin-bottom: 2px;
  transition: all 0.2s ease;
  padding-left: 12px !important;
}

[data-theme="vinyl-noir"] [class*="queueItem"]:hover,
[data-theme="vinyl-noir"] [class*="queue-item"]:hover,
[data-theme="vinyl-noir"] [class*="downloadItem"]:hover,
[data-theme="vinyl-noir"] [class*="download-item"]:hover {
  background: linear-gradient(90deg, rgba(212, 160, 69, 0.08) 0%, transparent 50%) !important;
  border-left-color: #e0b050 !important;
}

/* --- Song Thumbnails: Vintage Sepia Border --- */
[data-theme="vinyl-noir"] [class*="thumbnail"],
[data-theme="vinyl-noir"] [class*="albumArt"],
[data-theme="vinyl-noir"] [class*="album-art"],
[data-theme="vinyl-noir"] [class*="cover"] img,
[data-theme="vinyl-noir"] table img {
  border-radius: 4px !important;
  border: 2px solid #3a3028 !important;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(184, 115, 51, 0.1) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

[data-theme="vinyl-noir"] [class*="thumbnail"]:hover,
[data-theme="vinyl-noir"] [class*="albumArt"]:hover,
[data-theme="vinyl-noir"] table img:hover {
  border-color: #b87333 !important;
  box-shadow:
    0 2px 8px rgba(184, 115, 51, 0.2),
    inset 0 0 0 1px rgba(184, 115, 51, 0.15) !important;
}

/* --- Auth Page: Elegant Vintage Typography + Vinyl Record --- */
[data-theme="vinyl-noir"] [class*="auth"],
[data-theme="vinyl-noir"] [class*="Auth"],
[data-theme="vinyl-noir"] [class*="login"],
[data-theme="vinyl-noir"] [class*="Login"] {
  text-align: center;
}

[data-theme="vinyl-noir"] [class*="auth"] h1,
[data-theme="vinyl-noir"] [class*="Auth"] h1,
[data-theme="vinyl-noir"] [class*="auth"] h2,
[data-theme="vinyl-noir"] [class*="Auth"] h2 {
  font-family: "Georgia", "Palatino Linotype", serif !important;
  color: #d4a045 !important;
  letter-spacing: 0.15em !important;
  font-weight: 400 !important;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(212, 160, 69, 0.12);
}

[data-theme="vinyl-noir"] [class*="auth"] p,
[data-theme="vinyl-noir"] [class*="Auth"] p {
  font-family: "Georgia", "Palatino Linotype", serif !important;
  color: #a0907c !important;
  font-style: italic;
  letter-spacing: 0.04em;
}

/* Vinyl Record CSS Art */
[data-theme="vinyl-noir"] [class*="auth"]::before,
[data-theme="vinyl-noir"] [class*="Auth"]::before {
  content: "";
  display: block;
  width: 120px;
  height: 120px;
  margin: 0 auto 24px auto;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, #3a3028 12%, transparent 13%),
    radial-gradient(circle at center, #d4a045 14%, transparent 15%),
    radial-gradient(circle at center, transparent 26%, rgba(212, 160, 69, 0.08) 27%, transparent 28%),
    radial-gradient(circle at center, transparent 36%, rgba(212, 160, 69, 0.05) 37%, transparent 38%),
    radial-gradient(circle at center, transparent 46%, rgba(212, 160, 69, 0.04) 47%, transparent 48%),
    radial-gradient(circle at center, transparent 56%, rgba(212, 160, 69, 0.03) 57%, transparent 58%),
    radial-gradient(circle at center, transparent 68%, rgba(212, 160, 69, 0.06) 69%, transparent 70%),
    radial-gradient(circle at center, transparent 79%, rgba(212, 160, 69, 0.04) 80%, transparent 81%),
    radial-gradient(circle at center, transparent 90%, #3a3028 91%, #2a2420 95%, #1a1614 100%),
    conic-gradient(
      from 0deg,
      #1a1614, #221e1b, #1a1614, #221e1b,
      #1a1614, #221e1b, #1a1614, #221e1b,
      #1a1614, #221e1b, #1a1614, #221e1b,
      #1a1614
    );
  box-shadow:
    0 0 0 3px #2a2420,
    0 4px 16px rgba(0, 0, 0, 0.5),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
  animation: vinyl-noir-spin 4s linear infinite;
  position: relative;
}

/* Record label center */
[data-theme="vinyl-noir"] [class*="auth"]::after,
[data-theme="vinyl-noir"] [class*="Auth"]::after {
  content: "";
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, #121010 15%, #d4a045 16%, #d4a045 20%, transparent 21%),
    radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.15), transparent 60%),
    linear-gradient(135deg, #d4a045 0%, #b87333 50%, #d4a045 100%);
  position: relative;
  margin: -78px auto 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  animation: vinyl-noir-spin 4s linear infinite;
  margin-bottom: 18px;
}

@keyframes vinyl-noir-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* --- Warm Copper Dividers / Horizontal Rules --- */
[data-theme="vinyl-noir"] hr {
  border: none !important;
  height: 1px !important;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #3a3028 20%,
    #b87333 50%,
    #3a3028 80%,
    transparent 100%
  ) !important;
  opacity: 0.5;
}

/* --- Card / Panel hover warmth --- */
[data-theme="vinyl-noir"] [class*="card"]:hover,
[data-theme="vinyl-noir"] [class*="Card"]:hover {
  box-shadow:
    0 2px 12px rgba(212, 160, 69, 0.06),
    inset 0 0 0 1px rgba(212, 160, 69, 0.05) !important;
}

/* --- Progress bars with vintage gold --- */
[data-theme="vinyl-noir"] [class*="progress"],
[data-theme="vinyl-noir"] progress {
  background: #1a1614 !important;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #3a3028;
}

[data-theme="vinyl-noir"] [class*="progress"] [class*="bar"],
[data-theme="vinyl-noir"] [class*="progressBar"],
[data-theme="vinyl-noir"] progress::-webkit-progress-value {
  background: linear-gradient(
    90deg,
    #b87333 0%,
    #d4a045 50%,
    #b87333 100%
  ) !important;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(212, 160, 69, 0.2);
}

/* --- Tooltips --- */
[data-theme="vinyl-noir"] [class*="tooltip"],
[data-theme="vinyl-noir"] [class*="Tooltip"] {
  font-family: "Georgia", serif !important;
  background: #2a2420 !important;
  color: #f5e6c8 !important;
  border: 1px solid #3a3028 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
  font-size: 0.85em;
  letter-spacing: 0.03em;
}

/* --- General button hover warmth for all buttons --- */
[data-theme="vinyl-noir"] button {
  font-family: "Georgia", "Palatino Linotype", serif !important;
  transition: all 0.2s ease;
}

[data-theme="vinyl-noir"] button:hover {
  box-shadow: 0 0 8px rgba(212, 160, 69, 0.08);
}

/* --- Subtle Warm Ambient Glow at Top --- */
[data-theme="vinyl-noir"] .main-content::before,
[data-theme="vinyl-noir"] [class*="mainContent"]::before,
[data-theme="vinyl-noir"] main::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse 80% 100px at 50% 0%,
    rgba(212, 160, 69, 0.03) 0%,
    transparent 70%
  );
}

/* --- Selection highlight --- */
[data-theme="vinyl-noir"] ::selection {
  background: rgba(212, 160, 69, 0.25);
  color: #f5e6c8;
}

/* --- Links: copper warmth --- */
[data-theme="vinyl-noir"] a:not([class]) {
  color: #d4a045;
  text-decoration: none;
  border-bottom: 1px solid rgba(212, 160, 69, 0.3);
  transition: border-color 0.2s ease, color 0.2s ease;
}

[data-theme="vinyl-noir"] a:not([class]):hover {
  color: #e0b050;
  border-bottom-color: #d4a045;
}

/* --- Vintage separator dot pattern for section breaks --- */
[data-theme="vinyl-noir"] [class*="sectionDivider"]::after,
[data-theme="vinyl-noir"] [class*="divider"]::after {
  content: "\\2022  \\2022  \\2022";
  display: block;
  text-align: center;
  color: #3a3028;
  letter-spacing: 0.5em;
  font-size: 0.7em;
  margin: 8px 0;
}

/* --- Checkbox / Toggle: gold accent --- */
[data-theme="vinyl-noir"] input[type="checkbox"]:checked {
  accent-color: #d4a045 !important;
}

[data-theme="vinyl-noir"] input[type="range"] {
  accent-color: #d4a045 !important;
}

/* --- Table cell vertical alignment and spacing --- */
[data-theme="vinyl-noir"] table td {
  font-family: "Georgia", "Palatino Linotype", serif !important;
  padding-top: 8px;
  padding-bottom: 8px;
  letter-spacing: 0.01em;
}

/* --- Warm Fade-In Animation for page transitions --- */
[data-theme="vinyl-noir"] [class*="page"],
[data-theme="vinyl-noir"] [class*="Page"],
[data-theme="vinyl-noir"] [class*="view"],
[data-theme="vinyl-noir"] [class*="View"] {
  animation: vinyl-noir-fadeIn 0.3s ease-out;
}

@keyframes vinyl-noir-fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Empty state / placeholder text --- */
[data-theme="vinyl-noir"] [class*="empty"],
[data-theme="vinyl-noir"] [class*="Empty"],
[data-theme="vinyl-noir"] [class*="placeholder"] {
  font-style: italic;
  color: #a0907c !important;
  font-family: "Georgia", serif !important;
}

/* --- Code/monospace elements still look vintage --- */
[data-theme="vinyl-noir"] code,
[data-theme="vinyl-noir"] pre {
  background: #161311 !important;
  border: 1px solid #3a3028 !important;
  color: #d4a045 !important;
  border-radius: 3px;
}
`,
};
