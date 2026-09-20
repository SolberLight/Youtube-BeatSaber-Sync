export type { ThemeDefinition } from "./theme-types";
export { defaultTheme } from "./default";
export { midnightEmber } from "./midnight-ember";
export { cyberNeon } from "./cyber-neon";
export { auroraBorealis } from "./aurora-borealis";
export { vinylNoir } from "./vinyl-noir";
export { tokyoSakura } from "./tokyo-sakura";

import { defaultTheme } from "./default";
import { midnightEmber } from "./midnight-ember";
import { cyberNeon } from "./cyber-neon";
import { auroraBorealis } from "./aurora-borealis";
import { vinylNoir } from "./vinyl-noir";
import { tokyoSakura } from "./tokyo-sakura";
import type { ThemeDefinition } from "./theme-types";

export const themes: ThemeDefinition[] = [
  defaultTheme,
  midnightEmber,
  cyberNeon,
  auroraBorealis,
  vinylNoir,
  tokyoSakura,
];

export const themeMap: Record<string, ThemeDefinition> = Object.fromEntries(
  themes.map((t) => [t.id, t])
);
