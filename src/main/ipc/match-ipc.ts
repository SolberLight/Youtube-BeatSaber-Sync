import { ipcMain, shell } from "electron";
import { getLibrary, getMatches } from "../services/cache-service";
import { duplicateSongIds } from "../services/song-identity";
import {
  searchMatches,
  searchMatchForSong,
  cancelSearch,
  isSearchRunning,
  type SearchOptions,
} from "../services/match-service";
import {
  addMatch,
  skipMatch,
  resetDecision,
  resetAllDecisions,
  addManyMatches,
  addAllPending,
} from "../services/decision-service";
import { DEFAULT_MATCHES } from "../utils/schema";
import log from "electron-log/main";

function toError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function registerMatchIpc(): void {
  ipcMain.handle("matches:getAll", async () => {
    try {
      const matches = getMatches();
      // Computed on read rather than stored, so it tracks every decision.
      const duplicateIds = [...duplicateSongIds(getLibrary(), matches)];
      return { ...matches, duplicateSongIds: duplicateIds };
    } catch (err: unknown) {
      log.error("matches:getAll error:", toError(err));
      return DEFAULT_MATCHES;
    }
  });

  ipcMain.handle("matches:search", async (_event, options?: SearchOptions) => {
    try {
      const result = await searchMatches(options ?? {});
      return { success: true, ...result };
    } catch (err: unknown) {
      const error = toError(err);
      log.error("matches:search error:", error);
      return { success: false, error };
    }
  });

  ipcMain.handle("matches:searchOne", async (_event, songId: string) => {
    try {
      const result = await searchMatchForSong(songId);
      return { success: true, ...result };
    } catch (err: unknown) {
      const error = toError(err);
      log.error("matches:searchOne error:", error);
      return { success: false, error };
    }
  });

  ipcMain.handle("matches:cancelSearch", async () => {
    cancelSearch();
    return { success: true };
  });

  ipcMain.handle("matches:isSearching", async () => isSearchRunning());

  ipcMain.handle("matches:add", async (_event, songId: string, mapIds: string[]) => {
    try {
      return await addMatch(songId, Array.isArray(mapIds) ? mapIds : [mapIds]);
    } catch (err: unknown) {
      return { success: false, queued: 0, error: toError(err) };
    }
  });

  ipcMain.handle("matches:skip", async (_event, songId: string) => {
    try {
      return await skipMatch(songId);
    } catch (err: unknown) {
      return { success: false, queued: 0, error: toError(err) };
    }
  });

  ipcMain.handle("matches:reset", async (_event, songId: string) => {
    try {
      return await resetDecision(songId);
    } catch (err: unknown) {
      return { success: false, queued: 0, error: toError(err) };
    }
  });

  ipcMain.handle("matches:resetAll", async () => {
    try {
      return await resetAllDecisions();
    } catch (err: unknown) {
      return { success: false, queued: 0, error: toError(err) };
    }
  });

  ipcMain.handle(
    "matches:addMany",
    async (_event, selections: { songId: string; mapId: string }[]) => {
      try {
        return await addManyMatches(selections ?? []);
      } catch (err: unknown) {
        return { success: false, queued: 0, error: toError(err) };
      }
    }
  );

  ipcMain.handle("matches:addAll", async () => {
    try {
      return await addAllPending();
    } catch (err: unknown) {
      return { success: false, queued: 0, error: toError(err) };
    }
  });

  ipcMain.handle("matches:openBeatSaver", async (_event, mapId: string) => {
    await shell.openExternal(`https://beatsaver.com/maps/${mapId}`);
  });

  ipcMain.handle("matches:openYouTube", async (_event, videoId: string) => {
    await shell.openExternal(`https://music.youtube.com/watch?v=${videoId}`);
  });
}
