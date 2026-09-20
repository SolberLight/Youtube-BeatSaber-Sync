import { app } from "electron";
import path from "path";
import { Config, ConfigSchema, DEFAULT_CONFIG } from "../utils/schema";
import { loadJson, saveJsonAtomic } from "../utils/json-store";
import { getConfigPath } from "../utils/paths";
import log from "electron-log/main";

let cachedConfig: Config | null = null;

/**
 * Where Beat Saber keeps custom levels, when we can guess it.
 * Falls back to a folder under the user's documents.
 */
function defaultMapsDir(): string {
  const home = app.getPath("home");

  if (process.platform === "win32") {
    // The usual Steam install location.
    return path.join(
      "C:",
      "Program Files (x86)",
      "Steam",
      "steamapps",
      "common",
      "Beat Saber",
      "Beat Saber_Data",
      "CustomLevels"
    );
  }

  if (process.platform === "darwin") {
    return path.join(home, "Documents", "Beat Saber", "CustomLevels");
  }

  return path.join(home, "BeatSaber", "CustomLevels");
}

export async function loadSettings(): Promise<Config> {
  const config = await loadJson(getConfigPath(), ConfigSchema, {
    ...DEFAULT_CONFIG,
    mapsDir: defaultMapsDir(),
  });

  // An older config may predate the maps folder gaining a default.
  if (!config.mapsDir) {
    config.mapsDir = defaultMapsDir();
  }

  cachedConfig = config;
  return config;
}

export function getSettings(): Config {
  if (!cachedConfig) {
    throw new Error("Settings not loaded yet. Call loadSettings() first.");
  }
  return cachedConfig;
}

export async function updateSettings(
  partial: Partial<Config>
): Promise<Config> {
  const current = getSettings();
  const updated: Config = { ...current, ...partial, version: 1 };

  const result = ConfigSchema.safeParse(updated);
  if (!result.success) {
    throw new Error(`Invalid settings: ${result.error.message}`);
  }

  cachedConfig = result.data;
  await saveJsonAtomic(getConfigPath(), cachedConfig);
  log.info("Settings updated");
  return cachedConfig;
}

export async function resetSettings(): Promise<Config> {
  cachedConfig = { ...DEFAULT_CONFIG, mapsDir: defaultMapsDir() };
  await saveJsonAtomic(getConfigPath(), cachedConfig);
  log.info("Settings reset to defaults");
  return cachedConfig;
}
