import { app } from "electron";
import path from "path";

export function getUserDataPath(): string {
  return app.getPath("userData");
}

export function getConfigPath(): string {
  return path.join(getUserDataPath(), "config.json");
}

export function getAuthPath(): string {
  return path.join(getUserDataPath(), "auth.json");
}

export function getLibraryPath(): string {
  return path.join(getUserDataPath(), "library.json");
}

export function getMatchesPath(): string {
  return path.join(getUserDataPath(), "matches.json");
}

export function getDownloadsPath(): string {
  return path.join(getUserDataPath(), "downloads.json");
}

export function getQueuePath(): string {
  return path.join(getUserDataPath(), "queue.json");
}

export function getLogsDir(): string {
  return path.join(getUserDataPath(), "logs");
}

export function getTmpDir(): string {
  return path.join(getUserDataPath(), "tmp");
}
