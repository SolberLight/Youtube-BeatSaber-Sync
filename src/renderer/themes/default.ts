import type { ThemeDefinition } from "./theme-types";

export const defaultTheme: ThemeDefinition = {
  id: "default",
  name: "Default",
  description: "The original YTBSSync dark theme",
  preview: { bg: "#1a1a2e", accent: "#e94560", text: "#e8e8e8" },
  cssVariables: {
    "--bg-primary": "#1a1a2e",
    "--bg-secondary": "#16213e",
    "--bg-surface": "#0f3460",
    "--bg-hover": "#1a4a7a",
    "--text-primary": "#e8e8e8",
    "--text-secondary": "#a0a0b0",
    "--accent": "#e94560",
    "--accent-hover": "#ff6b81",
    "--success": "#2ed573",
    "--warning": "#ffa502",
    "--error": "#ff4757",
    "--border": "#2a2a4a",
    "--radius": "8px",
  },
  customCSS: "",
};
