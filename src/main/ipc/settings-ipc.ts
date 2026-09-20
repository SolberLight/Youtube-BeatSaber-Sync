import { ipcMain, dialog, shell } from "electron";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../services/settings-service";
import { getLogContents } from "../services/log-service";
import { getUserDataPath } from "../utils/paths";
import type { Config } from "../utils/schema";
import log from "electron-log/main";

export function registerSettingsIpc(): void {
  ipcMain.handle("settings:get", async () => getSettings());

  ipcMain.handle("settings:update", async (_event, partial: Partial<Config>) => {
    try {
      const settings = await updateSettings(partial);
      return { success: true, settings };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error("settings:update error:", msg);
      return { success: false, error: msg };
    }
  });

  ipcMain.handle("settings:reset", async () => {
    try {
      const settings = await resetSettings();
      return { success: true, settings };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  });

  ipcMain.handle("settings:selectMapsDir", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      title: "Select Beat Saber CustomLevels folder",
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("settings:openAppData", async () => {
    const err = await shell.openPath(getUserDataPath());
    if (err) throw new Error(err);
  });

  ipcMain.handle("diagnostics:getLogs", async () => getLogContents());
}
