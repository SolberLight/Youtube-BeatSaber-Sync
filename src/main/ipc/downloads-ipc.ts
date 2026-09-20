import { ipcMain, shell } from "electron";
import fs from "fs";
import { retryFailed, pauseAll, kickProcessQueue } from "../services/download-service";
import { getQueue, getDownloads } from "../services/cache-service";
import { getSettings } from "../services/settings-service";
import { DEFAULT_QUEUE, DEFAULT_DOWNLOADS } from "../utils/schema";
import log from "electron-log/main";

function toError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function registerDownloadsIpc(): void {
  ipcMain.handle("downloads:getQueue", async () => {
    try {
      return getQueue();
    } catch {
      return DEFAULT_QUEUE;
    }
  });

  ipcMain.handle("downloads:getDownloads", async () => {
    try {
      return getDownloads();
    } catch {
      return DEFAULT_DOWNLOADS;
    }
  });

  ipcMain.handle("downloads:retryFailed", async () => {
    try {
      const count = await retryFailed();
      return { success: true, count };
    } catch (err: unknown) {
      log.error("downloads:retryFailed error:", toError(err));
      return { success: false, error: toError(err) };
    }
  });

  ipcMain.handle("downloads:resume", async () => {
    kickProcessQueue();
    return { success: true };
  });

  ipcMain.handle("downloads:pauseAll", async () => {
    pauseAll();
    return { success: true };
  });

  ipcMain.handle("downloads:openFolder", async (_event, mapId?: string) => {
    const settings = getSettings();

    if (mapId) {
      const record = getDownloads().items[mapId];
      if (record?.folderPath) {
        shell.showItemInFolder(record.folderPath);
        return;
      }
    }

    // Opening a folder Beat Saber has not created yet just fails silently,
    // so make sure it exists first.
    await fs.promises.mkdir(settings.mapsDir, { recursive: true }).catch(() => {});
    await shell.openPath(settings.mapsDir);
  });
}
