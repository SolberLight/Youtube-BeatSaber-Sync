import { ipcMain } from "electron";
import {
  importAuth,
  importAuthViaBrowser,
  clearAuth,
  getAuthStatus,
} from "../services/auth-service";
import log from "electron-log/main";

export function registerAuthIpc(): void {
  ipcMain.handle("auth:status", async () => {
    return getAuthStatus();
  });

  ipcMain.handle("auth:import", async (_event, cookies: string) => {
    try {
      await importAuth(cookies);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error("Auth import failed:", msg);
      return { success: false, error: msg };
    }
  });

  ipcMain.handle("auth:browserLogin", async () => {
    try {
      await importAuthViaBrowser();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error("Browser login failed:", msg);
      return { success: false, error: msg };
    }
  });

  ipcMain.handle("auth:clear", async () => {
    await clearAuth();
    return { success: true };
  });
}
