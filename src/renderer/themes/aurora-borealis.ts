import type { ThemeDefinition } from "./theme-types";

export const auroraBorealis: ThemeDefinition = {
  id: "aurora-borealis",
  name: "Aurora Borealis",
  description: "Ethereal northern lights dancing across deep space",
  preview: { bg: "#050510", accent: "#00e676", text: "#e8eaf6" },
  cssVariables: {
    "--bg-primary": "#050510",
    "--bg-secondary": "#0a0f1a",
    "--bg-surface": "#0f1628",
    "--bg-hover": "#151e30",
    "--text-primary": "#e8eaf6",
    "--text-secondary": "#9fa8da",
    "--accent": "#00e676",
    "--accent-hover": "#69f0ae",
    "--success": "#00e676",
    "--warning": "#ffca28",
    "--error": "#ef5350",
    "--border": "rgba(26, 35, 126, 0.3)",
    "--radius": "16px",
  },
  customCSS: `
/* ═══════════════════════════════════════════════════════
   Aurora Borealis Theme — Ethereal Northern Lights
   ═══════════════════════════════════════════════════════ */

/* ---------- Keyframe Animations ---------- */

@keyframes aurora-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes aurora-text-shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes aurora-border-pulse {
  0%   { background-position: 0% 0%; }
  50%  { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
}

@keyframes aurora-glow {
  0%   { box-shadow: 0 0 8px rgba(0, 230, 118, 0.15), 0 0 20px rgba(0, 188, 212, 0.08); }
  50%  { box-shadow: 0 0 14px rgba(0, 230, 118, 0.25), 0 0 32px rgba(124, 77, 255, 0.12); }
  100% { box-shadow: 0 0 8px rgba(0, 230, 118, 0.15), 0 0 20px rgba(0, 188, 212, 0.08); }
}

@keyframes star-twinkle-1 {
  0%, 100% { opacity: 0.1; }
  50%      { opacity: 0.8; }
}

@keyframes star-twinkle-2 {
  0%, 100% { opacity: 0.05; }
  40%      { opacity: 0.6; }
  70%      { opacity: 0.2; }
}

@keyframes star-twinkle-3 {
  0%, 100% { opacity: 0.15; }
  30%      { opacity: 0.9; }
  60%      { opacity: 0.3; }
}

@keyframes aurora-arc-drift {
  0%   { transform: translateX(-10%) rotate(-2deg) scaleY(1); opacity: 0.25; }
  33%  { transform: translateX(5%) rotate(1deg) scaleY(1.1); opacity: 0.35; }
  66%  { transform: translateX(-5%) rotate(-1deg) scaleY(0.95); opacity: 0.28; }
  100% { transform: translateX(-10%) rotate(-2deg) scaleY(1); opacity: 0.25; }
}

@keyframes aurora-scroll-gradient {
  0%   { background-position: 0% 0%; }
  50%  { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
}

@keyframes focus-ring-rotate {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* ---------- Base & Font ---------- */

[data-theme="aurora-borealis"] body {
  font-family: "Nunito", "Quicksand", "Segoe UI", sans-serif;
  background: #050510;
}

[data-theme="aurora-borealis"] * {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease,
              opacity 0.3s ease;
}

/* ---------- Sidebar: Animated Aurora Gradient ---------- */

[data-theme="aurora-borealis"] .sidebar {
  background: linear-gradient(
    170deg,
    #050510 0%,
    #061a1a 20%,
    #0a1628 40%,
    #0d0f28 60%,
    #120a28 80%,
    #050510 100%
  );
  background-size: 100% 400%;
  animation: aurora-border-pulse 15s ease infinite;
  border-right: 1px solid rgba(0, 230, 118, 0.08);
  position: relative;
  overflow: hidden;
}

[data-theme="aurora-borealis"] .sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 230, 118, 0.03) 0%,
    rgba(0, 188, 212, 0.04) 30%,
    rgba(124, 77, 255, 0.04) 60%,
    transparent 100%
  );
  background-size: 100% 300%;
  animation: aurora-border-pulse 15s ease infinite;
  pointer-events: none;
  z-index: 0;
}

[data-theme="aurora-borealis"] .sidebar > * {
  position: relative;
  z-index: 1;
}

/* ---------- Sidebar Title: Aurora Text Gradient ---------- */

[data-theme="aurora-borealis"] .sidebar-title {
  background: linear-gradient(
    135deg,
    #00e676 0%,
    #00bcd4 30%,
    #7c4dff 60%,
    #00e676 100%
  );
  background-size: 300% 300%;
  animation: aurora-text-shimmer 8s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  letter-spacing: 0.5px;
  filter: drop-shadow(0 0 8px rgba(0, 230, 118, 0.3));
}

/* ---------- Sidebar Links ---------- */

[data-theme="aurora-borealis"] .sidebar-link {
  border-radius: 12px;
  margin: 1px 8px;
  padding: 10px 12px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

[data-theme="aurora-borealis"] .sidebar-link:hover {
  background: rgba(0, 230, 118, 0.06);
  color: #e8eaf6;
  border-left-color: rgba(0, 230, 118, 0.3);
}

[data-theme="aurora-borealis"] .sidebar-link.active {
  background: rgba(0, 230, 118, 0.08);
  color: #e8eaf6;
  border-right: none;
  border-left: 3px solid transparent;
  border-image: linear-gradient(180deg, #00e676, #00bcd4, #7c4dff) 1;
  animation: aurora-border-pulse 6s ease infinite;
  box-shadow: inset 0 0 20px rgba(0, 230, 118, 0.04);
}

/* ---------- Primary Buttons: Aurora Gradient ---------- */

[data-theme="aurora-borealis"] .btn-primary {
  background: linear-gradient(135deg, #00e676 0%, #00bcd4 100%);
  background-size: 200% 200%;
  color: #050510;
  font-weight: 700;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 230, 118, 0.2),
              0 0 20px rgba(0, 188, 212, 0.1);
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .btn-primary:hover {
  background: linear-gradient(135deg, #69f0ae 0%, #4dd0e1 50%, #b388ff 100%);
  background-size: 200% 200%;
  animation: aurora-flow 3s ease infinite;
  box-shadow: 0 4px 20px rgba(0, 230, 118, 0.35),
              0 0 30px rgba(0, 188, 212, 0.2);
  transform: translateY(-1px);
}

[data-theme="aurora-borealis"] .btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 8px rgba(0, 230, 118, 0.15);
}

[data-theme="aurora-borealis"] .btn-primary:disabled {
  background: linear-gradient(135deg, rgba(0, 230, 118, 0.3), rgba(0, 188, 212, 0.3));
  box-shadow: none;
}

/* ---------- Secondary Buttons ---------- */

[data-theme="aurora-borealis"] .btn-secondary {
  background: rgba(15, 22, 40, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 230, 118, 0.12);
  color: #9fa8da;
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .btn-secondary:hover {
  background: rgba(0, 230, 118, 0.08);
  border-color: rgba(0, 230, 118, 0.25);
  color: #e8eaf6;
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.08);
}

/* ---------- Danger Buttons ---------- */

[data-theme="aurora-borealis"] .btn-danger {
  background: linear-gradient(135deg, #ef5350, #c62828);
  box-shadow: 0 2px 10px rgba(239, 83, 80, 0.2);
}

[data-theme="aurora-borealis"] .btn-danger:hover {
  box-shadow: 0 4px 18px rgba(239, 83, 80, 0.35);
  transform: translateY(-1px);
}

/* ---------- Song Table: Translucent Rows ---------- */

[data-theme="aurora-borealis"] .song-table th {
  border-bottom: 1px solid rgba(0, 230, 118, 0.1);
  color: #7c8dba;
  font-weight: 700;
  letter-spacing: 1px;
}

[data-theme="aurora-borealis"] .song-table td {
  border-bottom: 1px solid rgba(26, 35, 126, 0.15);
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .song-table tr:hover td {
  background: rgba(0, 230, 118, 0.04);
  box-shadow: inset 0 0 30px rgba(0, 188, 212, 0.02);
}

[data-theme="aurora-borealis"] .song-table tr.selected td {
  background: rgba(0, 230, 118, 0.07);
  box-shadow: inset 0 0 40px rgba(124, 77, 255, 0.03);
}

/* ---------- Song Thumbnails: Rounded Glow ---------- */

[data-theme="aurora-borealis"] .song-thumb {
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 230, 118, 0.12),
              0 0 16px rgba(0, 188, 212, 0.06);
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .song-table tr:hover .song-thumb {
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.25),
              0 0 24px rgba(124, 77, 255, 0.12);
  animation: aurora-glow 4s ease infinite;
}

/* ---------- Badges: Glassmorphism ---------- */

[data-theme="aurora-borealis"] .badge {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

[data-theme="aurora-borealis"] .badge-completed {
  background: rgba(0, 230, 118, 0.12);
  border-color: rgba(0, 230, 118, 0.15);
  color: #00e676;
  box-shadow: 0 0 8px rgba(0, 230, 118, 0.08);
}

[data-theme="aurora-borealis"] .badge-downloading {
  background: rgba(255, 202, 40, 0.12);
  border-color: rgba(255, 202, 40, 0.15);
  color: #ffca28;
  box-shadow: 0 0 8px rgba(255, 202, 40, 0.08);
}

[data-theme="aurora-borealis"] .badge-queued {
  background: rgba(0, 188, 212, 0.12);
  border-color: rgba(0, 188, 212, 0.15);
  color: #00bcd4;
  box-shadow: 0 0 8px rgba(0, 188, 212, 0.08);
}

[data-theme="aurora-borealis"] .badge-failed {
  background: rgba(239, 83, 80, 0.12);
  border-color: rgba(239, 83, 80, 0.15);
  color: #ef5350;
  box-shadow: 0 0 8px rgba(239, 83, 80, 0.08);
}

[data-theme="aurora-borealis"] .badge-not_downloaded,
[data-theme="aurora-borealis"] .badge-skipped {
  background: rgba(159, 168, 218, 0.08);
  border-color: rgba(159, 168, 218, 0.1);
  color: #9fa8da;
}

/* ---------- Auth Page: Star Field & Aurora Arc ---------- */

[data-theme="aurora-borealis"] .auth-page {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 120%, #0a0f1a 0%, #050510 70%);
}

/* Large aurora arc background */
[data-theme="aurora-borealis"] .auth-page::before {
  content: "";
  position: absolute;
  top: -40%;
  left: -20%;
  width: 140%;
  height: 120%;
  background: radial-gradient(
    ellipse at 50% 80%,
    rgba(0, 230, 118, 0.08) 0%,
    rgba(0, 188, 212, 0.06) 20%,
    rgba(124, 77, 255, 0.05) 40%,
    transparent 60%
  );
  animation: aurora-arc-drift 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* Second aurora layer */
[data-theme="aurora-borealis"] .auth-page::after {
  content: "";
  position: absolute;
  top: -20%;
  left: -30%;
  width: 160%;
  height: 100%;
  background: radial-gradient(
    ellipse at 60% 70%,
    rgba(124, 77, 255, 0.06) 0%,
    rgba(0, 188, 212, 0.04) 25%,
    transparent 50%
  );
  animation: aurora-arc-drift 25s ease-in-out infinite reverse;
  pointer-events: none;
  z-index: 0;
}

/* Star field particles via box-shadows */
[data-theme="aurora-borealis"] .auth-page h1 {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #00e676, #00bcd4, #7c4dff);
  background-size: 300% 300%;
  animation: aurora-text-shimmer 8s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(0, 230, 118, 0.3));
}

[data-theme="aurora-borealis"] .auth-page p {
  position: relative;
  z-index: 1;
}

[data-theme="aurora-borealis"] .auth-page .btn {
  position: relative;
  z-index: 1;
}

/* Star field - Layer 1 (small stars) */
[data-theme="aurora-borealis"] .auth-page > *:first-child::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  box-shadow:
    120px 80px 0 0.5px rgba(232, 234, 246, 0.6),
    340px 150px 0 0.3px rgba(232, 234, 246, 0.5),
    560px 45px 0 0.4px rgba(0, 230, 118, 0.4),
    780px 200px 0 0.5px rgba(232, 234, 246, 0.7),
    200px 320px 0 0.3px rgba(0, 188, 212, 0.5),
    450px 380px 0 0.5px rgba(232, 234, 246, 0.6),
    670px 290px 0 0.4px rgba(124, 77, 255, 0.4),
    890px 50px 0 0.3px rgba(232, 234, 246, 0.5),
    100px 450px 0 0.5px rgba(0, 230, 118, 0.3),
    310px 520px 0 0.4px rgba(232, 234, 246, 0.6),
    530px 490px 0 0.3px rgba(0, 188, 212, 0.4),
    750px 430px 0 0.5px rgba(232, 234, 246, 0.5),
    50px 180px 0 0.5px rgba(232, 234, 246, 0.6),
    280px 260px 0 0.3px rgba(124, 77, 255, 0.4),
    500px 160px 0 0.4px rgba(232, 234, 246, 0.5),
    720px 350px 0 0.3px rgba(0, 230, 118, 0.4),
    940px 140px 0 0.5px rgba(232, 234, 246, 0.7),
    160px 550px 0 0.4px rgba(232, 234, 246, 0.5),
    380px 60px 0 0.3px rgba(0, 188, 212, 0.4),
    600px 580px 0 0.5px rgba(232, 234, 246, 0.6),
    820px 510px 0 0.4px rgba(124, 77, 255, 0.3),
    40px 350px 0 0.3px rgba(232, 234, 246, 0.5),
    260px 420px 0 0.5px rgba(0, 230, 118, 0.4),
    480px 270px 0 0.4px rgba(232, 234, 246, 0.6),
    700px 120px 0 0.3px rgba(232, 234, 246, 0.5);
  animation: star-twinkle-1 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* Star field - Layer 2 (medium stars, different timing) */
[data-theme="aurora-borealis"] .auth-page > *:first-child::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  box-shadow:
    80px 120px 0 0.8px rgba(0, 230, 118, 0.5),
    300px 280px 0 0.6px rgba(232, 234, 246, 0.7),
    520px 180px 0 0.7px rgba(0, 188, 212, 0.5),
    740px 80px 0 0.6px rgba(232, 234, 246, 0.6),
    960px 320px 0 0.8px rgba(124, 77, 255, 0.4),
    180px 480px 0 0.7px rgba(232, 234, 246, 0.5),
    400px 100px 0 0.6px rgba(0, 230, 118, 0.4),
    620px 400px 0 0.8px rgba(232, 234, 246, 0.7),
    840px 250px 0 0.7px rgba(0, 188, 212, 0.5),
    60px 560px 0 0.6px rgba(232, 234, 246, 0.6),
    230px 30px 0 0.8px rgba(124, 77, 255, 0.4),
    450px 540px 0 0.7px rgba(232, 234, 246, 0.5),
    670px 60px 0 0.6px rgba(0, 230, 118, 0.4),
    850px 480px 0 0.8px rgba(232, 234, 246, 0.6);
  animation: star-twinkle-2 6s ease-in-out infinite 1s;
  pointer-events: none;
  z-index: 0;
}

/* ---------- Auth Textarea ---------- */

[data-theme="aurora-borealis"] .auth-textarea {
  position: relative;
  z-index: 1;
  background: rgba(10, 15, 26, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 230, 118, 0.12);
  border-radius: 16px;
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .auth-textarea:focus {
  border-color: transparent;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 230, 118, 0.3),
              0 0 20px rgba(0, 188, 212, 0.1);
  background: rgba(10, 15, 26, 0.9);
}

/* ---------- Settings Groups: Glassmorphism Cards ---------- */

[data-theme="aurora-borealis"] .settings-group {
  background: rgba(10, 15, 26, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 230, 118, 0.08);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .settings-group:hover {
  border-color: rgba(0, 230, 118, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(0, 230, 118, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

[data-theme="aurora-borealis"] .settings-group h3 {
  color: #00bcd4;
  font-weight: 700;
  letter-spacing: 1.5px;
}

/* ---------- Input Focus: Teal/Green Gradient Border ---------- */

[data-theme="aurora-borealis"] .settings-input,
[data-theme="aurora-borealis"] .search-input,
[data-theme="aurora-borealis"] .filter-select {
  background: rgba(5, 5, 16, 0.6);
  border: 1px solid rgba(26, 35, 126, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .settings-input:focus,
[data-theme="aurora-borealis"] .search-input:focus,
[data-theme="aurora-borealis"] .filter-select:focus {
  outline: none;
  border-color: transparent;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.4),
              0 0 16px rgba(0, 230, 118, 0.1);
  background: rgba(10, 15, 26, 0.8);
}

/* ---------- Queue Items: Left Gradient Border ---------- */

[data-theme="aurora-borealis"] .queue-item {
  background: rgba(10, 15, 26, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 14px;
  border-left: 3px solid transparent;
  border-image: linear-gradient(180deg, #00e676 0%, #00bcd4 50%, #7c4dff 100%) 1;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

[data-theme="aurora-borealis"] .queue-item:hover {
  background: rgba(0, 230, 118, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
              0 0 12px rgba(0, 230, 118, 0.05);
}

/* ---------- Queue Section Headers ---------- */

[data-theme="aurora-borealis"] .queue-section h3 {
  color: #00bcd4;
  font-weight: 700;
  letter-spacing: 1.5px;
}

/* ---------- Custom Scrollbar: Aurora Gradient Thumb ---------- */

[data-theme="aurora-borealis"] ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

[data-theme="aurora-borealis"] ::-webkit-scrollbar-track {
  background: rgba(5, 5, 16, 0.4);
  border-radius: 8px;
}

[data-theme="aurora-borealis"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00e676 0%, #00bcd4 50%, #7c4dff 100%);
  background-size: 100% 200%;
  animation: aurora-scroll-gradient 8s ease infinite;
  border-radius: 8px;
  border: 2px solid rgba(5, 5, 16, 0.4);
}

[data-theme="aurora-borealis"] ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #69f0ae 0%, #4dd0e1 50%, #b388ff 100%);
  background-size: 100% 200%;
}

/* ---------- Page Headers ---------- */

[data-theme="aurora-borealis"] .page-header h2 {
  background: linear-gradient(135deg, #e8eaf6 0%, #00bcd4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

/* ---------- Action Bar Buttons ---------- */

[data-theme="aurora-borealis"] .action-bar .btn {
  border-radius: 14px;
}

/* ---------- Log Viewer ---------- */

[data-theme="aurora-borealis"] .log-viewer {
  background: rgba(5, 5, 16, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 230, 118, 0.06);
  border-radius: 16px;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
}

/* ---------- Checkboxes ---------- */

[data-theme="aurora-borealis"] input[type="checkbox"] {
  accent-color: #00e676;
}

/* ---------- Main Content Area ---------- */

[data-theme="aurora-borealis"] .main-content {
  background: linear-gradient(
    160deg,
    #050510 0%,
    #070b18 40%,
    #0a0f1a 100%
  );
}

/* ---------- App Layout Subtle Glow ---------- */

[data-theme="aurora-borealis"] .app-layout {
  position: relative;
}

[data-theme="aurora-borealis"] .app-layout::after {
  content: "";
  position: fixed;
  bottom: -50%;
  left: 30%;
  width: 40%;
  height: 60%;
  background: radial-gradient(
    ellipse,
    rgba(0, 230, 118, 0.03) 0%,
    rgba(0, 188, 212, 0.02) 30%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}

/* ---------- Sync Info ---------- */

[data-theme="aurora-borealis"] .sync-info {
  color: #7c8dba;
}

/* ---------- Selection Styling ---------- */

[data-theme="aurora-borealis"] ::selection {
  background: rgba(0, 230, 118, 0.25);
  color: #e8eaf6;
}

/* ---------- Auth Error ---------- */

[data-theme="aurora-borealis"] .auth-error {
  position: relative;
  z-index: 1;
  text-shadow: 0 0 8px rgba(239, 83, 80, 0.3);
}

/* ---------- Sort Arrow in Table Headers ---------- */

[data-theme="aurora-borealis"] .song-table th:hover {
  color: #00e676;
}

/* ---------- Smooth Link Transitions ---------- */

[data-theme="aurora-borealis"] a {
  transition: color 0.3s ease, opacity 0.3s ease;
}

/* ---------- Organic Border Radii Overrides ---------- */

[data-theme="aurora-borealis"] .btn {
  border-radius: 14px;
}

[data-theme="aurora-borealis"] .search-input {
  border-radius: 14px;
}

[data-theme="aurora-borealis"] .filter-select {
  border-radius: 14px;
}

[data-theme="aurora-borealis"] .song-table {
  border-radius: 16px;
  overflow: hidden;
}
  `,
};
