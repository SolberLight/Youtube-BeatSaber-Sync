import { ipcMain } from "electron";
import { getLibrary } from "../services/cache-service";
import { syncLibrary, addSongFromSearch } from "../services/sync-service";
import { getProvider } from "../services/auth-service";
import { DEFAULT_LIBRARY } from "../utils/schema";
import type { LikedSong } from "../providers/music-provider";
import log from "electron-log/main";

function toError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function registerLibraryIpc(): void {
  ipcMain.handle("library:getAll", async () => {
    try {
      return getLibrary();
    } catch (err: unknown) {
      log.error("library:getAll error:", toError(err));
      return DEFAULT_LIBRARY;
    }
  });

  ipcMain.handle("library:sync", async () => {
    try {
      const result = await syncLibrary();
      return { success: true, count: result.items.length };
    } catch (err: unknown) {
      return { success: false, error: toError(err) };
    }
  });

  ipcMain.handle("library:search", async (_event, query: string) => {
    try {
      const provider = await getProvider();
      const songs = await provider.searchSongs(query, 20);
      return { success: true, songs };
    } catch (err: unknown) {
      const error = toError(err);
      log.error("library:search error:", error);
      return { success: false, error, songs: [] };
    }
  });

  ipcMain.handle("library:addSong", async (_event, song: LikedSong) => {
    try {
      const item = await addSongFromSearch(song);
      return { success: true, item };
    } catch (err: unknown) {
      const error = toError(err);
      log.error("library:addSong error:", error);
      return { success: false, error };
    }
  });
}
