import type { ThemeDefinition } from "./theme-types";

export const cyberNeon: ThemeDefinition = {
  id: "cyber-neon",
  name: "Cyber Neon",
  description: "Cyberpunk-inspired neon lights in the dark",
  preview: { bg: "#000000", accent: "#00fff5", text: "#e6edf3" },
  cssVariables: {
    "--bg-primary": "#000000",
    "--bg-secondary": "#0a0a1a",
    "--bg-surface": "#0d1117",
    "--bg-hover": "#161b22",
    "--text-primary": "#e6edf3",
    "--text-secondary": "#8b949e",
    "--accent": "#00fff5",
    "--accent-hover": "#00ccc4",
    "--success": "#39ff14",
    "--warning": "#fff01f",
    "--error": "#ff073a",
    "--border": "#1a2332",
    "--radius": "2px",
  },
  customCSS: `
/* ============================================================
   CYBER NEON THEME - Cyberpunk UI System v2.077
   "The grid. A digital frontier."
   ============================================================ */

/* --- Typography override: monospace for the cyberpunk feel --- */
[data-theme="cyber-neon"] {
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
}

/* ============================================================
   KEYFRAME ANIMATIONS
   ============================================================ */

/* Neon border pulse / flicker on primary buttons */
@keyframes neonPulse {
  0%, 100% {
    box-shadow:
      0 0 5px #00fff5,
      0 0 10px #00fff5,
      0 0 20px #00fff5,
      0 0 40px #00fff588;
    border-color: #00fff5;
  }
  25% {
    box-shadow:
      0 0 2px #00fff5aa,
      0 0 5px #00fff566,
      0 0 10px #00fff533;
    border-color: #00fff5aa;
  }
  50% {
    box-shadow:
      0 0 7px #00fff5,
      0 0 14px #00fff5,
      0 0 28px #00fff5,
      0 0 56px #00fff566;
    border-color: #00fff5;
  }
  75% {
    box-shadow:
      0 0 3px #00fff5cc,
      0 0 6px #00fff588,
      0 0 12px #00fff544;
    border-color: #00fff5cc;
  }
}

/* Magenta danger pulse */
@keyframes magentaPulse {
  0%, 100% {
    box-shadow:
      0 0 5px #ff00aa,
      0 0 10px #ff00aa,
      0 0 20px #ff00aa88;
  }
  50% {
    box-shadow:
      0 0 8px #ff00aa,
      0 0 16px #ff00aa,
      0 0 32px #ff00aaaa;
  }
}

/* Glitch text effect for sidebar title */
@keyframes glitchFlicker {
  0%, 100% {
    text-shadow:
      0 0 10px #00fff5,
      0 0 20px #00fff5,
      0 0 40px #00fff588;
    transform: translate(0, 0);
  }
  10% {
    text-shadow:
      2px 0 #ff00aa,
      -2px 0 #00fff5;
    transform: translate(-1px, 0);
  }
  20% {
    text-shadow:
      -1px 2px #ff00aa,
      1px -1px #00fff5,
      0 0 15px #00fff5;
    transform: translate(1px, 1px);
  }
  30% {
    text-shadow:
      0 0 10px #00fff5,
      0 0 20px #00fff5,
      0 0 40px #00fff588;
    transform: translate(0, 0);
  }
  40% {
    text-shadow:
      3px 0 #ff00aa,
      -3px 0 #00fff5;
    transform: translate(2px, -1px);
  }
  45% {
    text-shadow:
      0 0 10px #00fff5,
      0 0 20px #00fff5;
    transform: translate(0, 0);
  }
}

/* Neon underline sweep for table row hover */
@keyframes neonSweep {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Scanline scroll for sidebar */
@keyframes scanlineScroll {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 4px;
  }
}

/* Subtle CRT flicker for immersion */
@keyframes crtFlicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.97; }
  94% { opacity: 1; }
  96% { opacity: 0.98; }
  97% { opacity: 1; }
}

/* Glow breathe for badges */
@keyframes glowBreathe {
  0%, 100% {
    text-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
  }
  50% {
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
  }
}

/* ============================================================
   SIDEBAR - Scanline overlay + neon accents
   ============================================================ */

[data-theme="cyber-neon"] .sidebar {
  background: #0a0a1a;
  border-right: 1px solid #1a2332;
  position: relative;
  overflow: hidden;
}

/* Scanline overlay effect */
[data-theme="cyber-neon"] .sidebar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 255, 245, 0.015) 2px,
    rgba(0, 255, 245, 0.015) 4px
  );
  animation: scanlineScroll 0.3s linear infinite;
  pointer-events: none;
  z-index: 1;
}

/* Sidebar title - glitch hover */
[data-theme="cyber-neon"] .sidebar-title,
[data-theme="cyber-neon"] .sidebar .app-title,
[data-theme="cyber-neon"] .sidebar h1,
[data-theme="cyber-neon"] .sidebar-header h1 {
  color: #00fff5;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.9em;
  text-shadow:
    0 0 10px #00fff5,
    0 0 20px #00fff588;
  transition: all 0.1s;
  position: relative;
  z-index: 2;
}

[data-theme="cyber-neon"] .sidebar-title:hover,
[data-theme="cyber-neon"] .sidebar .app-title:hover,
[data-theme="cyber-neon"] .sidebar h1:hover,
[data-theme="cyber-neon"] .sidebar-header h1:hover {
  animation: glitchFlicker 0.6s ease-in-out;
}

/* Active sidebar link - neon cyan left border that glows */
[data-theme="cyber-neon"] .sidebar a.active,
[data-theme="cyber-neon"] .sidebar .nav-link.active,
[data-theme="cyber-neon"] .sidebar-link.active,
[data-theme="cyber-neon"] .sidebar .active {
  background: linear-gradient(90deg, rgba(0, 255, 245, 0.08) 0%, transparent 100%);
  border-left: 3px solid #00fff5;
  box-shadow:
    inset 4px 0 8px -4px #00fff566,
    -2px 0 12px -4px #00fff533;
  color: #00fff5;
  position: relative;
  z-index: 2;
}

[data-theme="cyber-neon"] .sidebar a,
[data-theme="cyber-neon"] .sidebar .nav-link,
[data-theme="cyber-neon"] .sidebar-link {
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;
}

[data-theme="cyber-neon"] .sidebar a:hover,
[data-theme="cyber-neon"] .sidebar .nav-link:hover,
[data-theme="cyber-neon"] .sidebar-link:hover {
  background: rgba(0, 255, 245, 0.04);
  border-left-color: #00fff544;
  color: #e6edf3;
}

/* ============================================================
   BUTTONS - Neon glow effects
   ============================================================ */

/* Primary button - neon cyan glow with flicker pulse */
[data-theme="cyber-neon"] .btn-primary,
[data-theme="cyber-neon"] button[class*="primary"] {
  background: transparent;
  color: #00fff5;
  border: 1px solid #00fff5;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 0.85em;
  animation: neonPulse 3s ease-in-out infinite;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

[data-theme="cyber-neon"] .btn-primary::before,
[data-theme="cyber-neon"] button[class*="primary"]::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 245, 0.15),
    transparent
  );
  transition: left 0.4s ease;
}

[data-theme="cyber-neon"] .btn-primary:hover,
[data-theme="cyber-neon"] button[class*="primary"]:hover {
  background: rgba(0, 255, 245, 0.1);
  box-shadow:
    0 0 10px #00fff5,
    0 0 20px #00fff5,
    0 0 40px #00fff5aa,
    inset 0 0 15px #00fff522;
  animation: none;
}

[data-theme="cyber-neon"] .btn-primary:hover::before,
[data-theme="cyber-neon"] button[class*="primary"]:hover::before {
  left: 100%;
}

/* Danger button - magenta glow */
[data-theme="cyber-neon"] .btn-danger,
[data-theme="cyber-neon"] button[class*="danger"],
[data-theme="cyber-neon"] button[class*="delete"],
[data-theme="cyber-neon"] button[class*="remove"] {
  background: transparent;
  color: #ff00aa;
  border: 1px solid #ff00aa;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 0.85em;
  box-shadow:
    0 0 5px #ff00aa66,
    0 0 10px #ff00aa33;
  transition: all 0.2s ease;
}

[data-theme="cyber-neon"] .btn-danger:hover,
[data-theme="cyber-neon"] button[class*="danger"]:hover,
[data-theme="cyber-neon"] button[class*="delete"]:hover,
[data-theme="cyber-neon"] button[class*="remove"]:hover {
  background: rgba(255, 0, 170, 0.1);
  animation: magentaPulse 1.5s ease-in-out infinite;
  box-shadow:
    0 0 10px #ff00aa,
    0 0 20px #ff00aa,
    0 0 40px #ff00aaaa,
    inset 0 0 15px #ff00aa22;
}

/* Secondary / default buttons */
[data-theme="cyber-neon"] .btn-secondary,
[data-theme="cyber-neon"] button {
  border: 1px solid #1a2332;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  transition: all 0.2s ease;
}

[data-theme="cyber-neon"] .btn-secondary:hover,
[data-theme="cyber-neon"] button:hover {
  border-color: #00fff544;
  box-shadow: 0 0 8px #00fff522;
}

/* ============================================================
   MAIN CONTENT - CRT vignette effect
   ============================================================ */

[data-theme="cyber-neon"] .main-content,
[data-theme="cyber-neon"] main,
[data-theme="cyber-neon"] .content-area {
  position: relative;
  animation: crtFlicker 4s ease-in-out infinite;
}

/* CRT / monitor-style vignette */
[data-theme="cyber-neon"] .main-content::before,
[data-theme="cyber-neon"] main::before,
[data-theme="cyber-neon"] .content-area::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(0, 0, 0, 0.25) 85%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
  z-index: 9999;
}

/* ============================================================
   SONG TABLE
   ============================================================ */

/* Table headers with neon underline */
[data-theme="cyber-neon"] th,
[data-theme="cyber-neon"] .table-header,
[data-theme="cyber-neon"] .song-table th,
[data-theme="cyber-neon"] .song-list-header {
  color: #00fff5;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75em;
  font-weight: 400;
  border-bottom: 1px solid #00fff5;
  text-shadow: 0 0 8px #00fff566;
  padding-bottom: 8px;
  position: relative;
  background: transparent;
}

[data-theme="cyber-neon"] th::after,
[data-theme="cyber-neon"] .table-header::after,
[data-theme="cyber-neon"] .song-table th::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    #00fff5,
    #ff00aa,
    #00fff5,
    transparent
  );
  box-shadow: 0 0 8px #00fff5;
}

/* Song table row hover - neon underline sweep */
[data-theme="cyber-neon"] .song-row,
[data-theme="cyber-neon"] .song-table tr,
[data-theme="cyber-neon"] .song-item {
  position: relative;
  transition: all 0.2s ease;
}

[data-theme="cyber-neon"] .song-row::after,
[data-theme="cyber-neon"] .song-table tbody tr::after,
[data-theme="cyber-neon"] .song-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #00fff5 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  background-position: -100% 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

[data-theme="cyber-neon"] .song-row:hover::after,
[data-theme="cyber-neon"] .song-table tbody tr:hover::after,
[data-theme="cyber-neon"] .song-item:hover::after {
  opacity: 1;
  animation: neonSweep 0.6s ease forwards;
}

[data-theme="cyber-neon"] .song-row:hover,
[data-theme="cyber-neon"] .song-table tbody tr:hover,
[data-theme="cyber-neon"] .song-item:hover {
  background: rgba(0, 255, 245, 0.03);
}

/* Song thumbnails - neon border glow */
[data-theme="cyber-neon"] .song-thumb,
[data-theme="cyber-neon"] .song-thumbnail,
[data-theme="cyber-neon"] .song-artwork {
  border: 1px solid #1a2332;
  box-shadow: 0 0 6px #00fff522;
  transition: all 0.3s ease;
}

[data-theme="cyber-neon"] .song-thumb:hover,
[data-theme="cyber-neon"] .song-thumbnail:hover,
[data-theme="cyber-neon"] .song-artwork:hover {
  border-color: #00fff5;
  box-shadow:
    0 0 8px #00fff5aa,
    0 0 16px #00fff544;
}

/* ============================================================
   BADGES - Neon text-shadow glow
   ============================================================ */

[data-theme="cyber-neon"] .badge,
[data-theme="cyber-neon"] [class*="badge"],
[data-theme="cyber-neon"] .tag,
[data-theme="cyber-neon"] .chip {
  background: transparent;
  border: 1px solid currentColor;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: glowBreathe 2.5s ease-in-out infinite;
}

[data-theme="cyber-neon"] .badge-success,
[data-theme="cyber-neon"] .badge[class*="success"] {
  color: #39ff14;
  border-color: #39ff14;
  text-shadow: 0 0 8px #39ff14, 0 0 16px #39ff1466;
}

[data-theme="cyber-neon"] .badge-warning,
[data-theme="cyber-neon"] .badge[class*="warning"] {
  color: #fff01f;
  border-color: #fff01f;
  text-shadow: 0 0 8px #fff01f, 0 0 16px #fff01f66;
}

[data-theme="cyber-neon"] .badge-error,
[data-theme="cyber-neon"] .badge[class*="error"],
[data-theme="cyber-neon"] .badge[class*="danger"] {
  color: #ff073a;
  border-color: #ff073a;
  text-shadow: 0 0 8px #ff073a, 0 0 16px #ff073a66;
}

[data-theme="cyber-neon"] .badge-info,
[data-theme="cyber-neon"] .badge[class*="info"] {
  color: #00fff5;
  border-color: #00fff5;
  text-shadow: 0 0 8px #00fff5, 0 0 16px #00fff566;
}

/* ============================================================
   QUEUE ITEMS - Left neon accent border
   ============================================================ */

[data-theme="cyber-neon"] .queue-item,
[data-theme="cyber-neon"] .download-item,
[data-theme="cyber-neon"] .queue-entry {
  border-left: 2px solid #00fff5;
  box-shadow: inset 3px 0 8px -3px #00fff533;
  background: linear-gradient(90deg, rgba(0, 255, 245, 0.03) 0%, transparent 30%);
  transition: all 0.2s ease;
}

[data-theme="cyber-neon"] .queue-item:hover,
[data-theme="cyber-neon"] .download-item:hover,
[data-theme="cyber-neon"] .queue-entry:hover {
  border-left-color: #ff00aa;
  box-shadow: inset 4px 0 12px -3px #ff00aa44;
  background: linear-gradient(90deg, rgba(255, 0, 170, 0.04) 0%, transparent 30%);
}

/* Active download pulsing border */
[data-theme="cyber-neon"] .queue-item.active,
[data-theme="cyber-neon"] .download-item.active,
[data-theme="cyber-neon"] .queue-item.downloading {
  border-left-width: 3px;
  border-left-color: #00fff5;
  animation: neonPulse 2s ease-in-out infinite;
}

/* ============================================================
   SETTINGS - Cyberpunk-style bordered groups
   ============================================================ */

[data-theme="cyber-neon"] .settings-group,
[data-theme="cyber-neon"] .settings-section,
[data-theme="cyber-neon"] .setting-card {
  border: 1px solid #1a2332;
  background: rgba(13, 17, 23, 0.6);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

[data-theme="cyber-neon"] .settings-group::before,
[data-theme="cyber-neon"] .settings-section::before,
[data-theme="cyber-neon"] .setting-card::before {
  content: "";
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(
    135deg,
    #00fff533 0%,
    transparent 30%,
    transparent 70%,
    #ff00aa33 100%
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

[data-theme="cyber-neon"] .settings-group:hover,
[data-theme="cyber-neon"] .settings-section:hover,
[data-theme="cyber-neon"] .setting-card:hover {
  border-color: #00fff544;
  box-shadow: 0 0 15px #00fff511, 0 0 30px #00fff508;
}

[data-theme="cyber-neon"] .settings-group:hover::before,
[data-theme="cyber-neon"] .settings-section:hover::before,
[data-theme="cyber-neon"] .setting-card:hover::before {
  opacity: 1;
}

/* Settings group titles */
[data-theme="cyber-neon"] .settings-group h2,
[data-theme="cyber-neon"] .settings-group h3,
[data-theme="cyber-neon"] .settings-section h2,
[data-theme="cyber-neon"] .settings-section h3 {
  color: #00fff5;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.8em;
  text-shadow: 0 0 8px #00fff544;
}

/* ============================================================
   AUTH PAGE - Glitchy neon title
   ============================================================ */

[data-theme="cyber-neon"] .auth-title,
[data-theme="cyber-neon"] .auth-page h1,
[data-theme="cyber-neon"] .login-title {
  color: #00fff5;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  text-transform: uppercase;
  letter-spacing: 6px;
  font-size: 1.8em;
  text-shadow:
    0 0 10px #00fff5,
    0 0 20px #00fff5,
    0 0 40px #00fff5,
    0 0 80px #00fff566,
    3px 0 0 #ff00aa44,
    -3px 0 0 #00fff544;
  position: relative;
}

[data-theme="cyber-neon"] .auth-title::after,
[data-theme="cyber-neon"] .auth-page h1::after,
[data-theme="cyber-neon"] .login-title::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  color: #ff00aa;
  opacity: 0;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(2px, -1px);
  pointer-events: none;
}

[data-theme="cyber-neon"] .auth-title:hover,
[data-theme="cyber-neon"] .auth-page h1:hover,
[data-theme="cyber-neon"] .login-title:hover {
  animation: glitchFlicker 0.4s ease-in-out 2;
}

/* Auth page container */
[data-theme="cyber-neon"] .auth-page,
[data-theme="cyber-neon"] .auth-container,
[data-theme="cyber-neon"] .login-page {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(0, 255, 245, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(255, 0, 170, 0.03) 0%, transparent 50%),
    #000000;
}

/* ============================================================
   INPUTS - Neon cyan focus glow
   ============================================================ */

[data-theme="cyber-neon"] input,
[data-theme="cyber-neon"] textarea,
[data-theme="cyber-neon"] select {
  background: #0a0a1a;
  border: 1px solid #1a2332;
  color: #e6edf3;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  transition: all 0.2s ease;
}

[data-theme="cyber-neon"] input:focus,
[data-theme="cyber-neon"] textarea:focus,
[data-theme="cyber-neon"] select:focus {
  outline: none;
  border-color: #00fff5;
  box-shadow:
    0 0 5px #00fff5,
    0 0 10px #00fff566,
    0 0 20px #00fff522,
    inset 0 0 5px #00fff511;
  background: #0d1117;
}

[data-theme="cyber-neon"] input::placeholder,
[data-theme="cyber-neon"] textarea::placeholder {
  color: #8b949e66;
  font-style: italic;
}

/* ============================================================
   SCROLLBAR - Neon cyan track
   ============================================================ */

[data-theme="cyber-neon"] ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

[data-theme="cyber-neon"] ::-webkit-scrollbar-track {
  background: #0a0a1a;
  border-left: 1px solid #1a2332;
}

[data-theme="cyber-neon"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00fff544, #00fff522);
  border: 1px solid #00fff533;
  border-radius: 0px;
}

[data-theme="cyber-neon"] ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #00fff588, #00fff544);
  box-shadow: 0 0 6px #00fff5;
}

[data-theme="cyber-neon"] ::-webkit-scrollbar-corner {
  background: #000000;
}

/* ============================================================
   PROGRESS BARS - Neon gradient
   ============================================================ */

[data-theme="cyber-neon"] progress,
[data-theme="cyber-neon"] .progress-bar,
[data-theme="cyber-neon"] [role="progressbar"] {
  background: #0a0a1a;
  border: 1px solid #1a2332;
  overflow: hidden;
}

[data-theme="cyber-neon"] progress::-webkit-progress-bar {
  background: #0a0a1a;
}

[data-theme="cyber-neon"] progress::-webkit-progress-value {
  background: linear-gradient(90deg, #00fff5, #ff00aa);
  box-shadow: 0 0 10px #00fff566;
}

[data-theme="cyber-neon"] .progress-fill,
[data-theme="cyber-neon"] .progress-bar-fill {
  background: linear-gradient(90deg, #00fff5, #ff00aa);
  box-shadow: 0 0 10px #00fff566, 0 0 5px #ff00aa44;
}

/* ============================================================
   LINKS & MISC
   ============================================================ */

[data-theme="cyber-neon"] a {
  color: #00fff5;
  text-decoration: none;
  transition: all 0.2s ease;
}

[data-theme="cyber-neon"] a:hover {
  color: #ff00aa;
  text-shadow: 0 0 8px #ff00aa66;
}

/* Tooltips */
[data-theme="cyber-neon"] [class*="tooltip"],
[data-theme="cyber-neon"] .tooltip {
  background: #0a0a1a;
  border: 1px solid #00fff5;
  color: #e6edf3;
  box-shadow: 0 0 10px #00fff533;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 0.8em;
}

/* Modals / Dialogs */
[data-theme="cyber-neon"] .modal,
[data-theme="cyber-neon"] dialog,
[data-theme="cyber-neon"] [role="dialog"] {
  background: #0d1117;
  border: 1px solid #00fff544;
  box-shadow:
    0 0 20px #00fff522,
    0 0 60px #00fff511,
    inset 0 0 40px #00000088;
}

/* Dividers / Separators */
[data-theme="cyber-neon"] hr,
[data-theme="cyber-neon"] .divider,
[data-theme="cyber-neon"] .separator {
  border: none;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    #00fff544,
    #ff00aa44,
    #00fff544,
    transparent
  );
}

/* Code / monospace elements (extra glow for the hacker vibe) */
[data-theme="cyber-neon"] code,
[data-theme="cyber-neon"] pre,
[data-theme="cyber-neon"] .mono {
  background: #0a0a1a;
  border: 1px solid #1a233244;
  color: #39ff14;
  text-shadow: 0 0 4px #39ff1444;
}

/* Selection color */
[data-theme="cyber-neon"] ::selection {
  background: #00fff533;
  color: #ffffff;
  text-shadow: 0 0 8px #00fff5;
}

/* ============================================================
   CARDS & PANELS - Consistent cyberpunk surfaces
   ============================================================ */

[data-theme="cyber-neon"] .card,
[data-theme="cyber-neon"] .panel {
  background: rgba(10, 10, 26, 0.8);
  border: 1px solid #1a2332;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

[data-theme="cyber-neon"] .card:hover,
[data-theme="cyber-neon"] .panel:hover {
  border-color: #00fff533;
  box-shadow: 0 0 20px #00fff50a;
}

/* ============================================================
   GRID / HEX BACKGROUND PATTERN (body-level atmosphere)
   ============================================================ */

[data-theme="cyber-neon"] {
  background-image:
    linear-gradient(rgba(0, 255, 245, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 245, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
}
`,
};
