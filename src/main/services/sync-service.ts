import { BrowserWindow } from "electron";
import { getProvider } from "./auth-service";
import { getLibrary, saveLibrary } from "./cache-service";
import { LibraryItem, Library } from "../utils/schema";
import type { LikedSong } from "../providers/music-provider";
import log from "electron-log/main";

function sendToRenderer(channel: string, ...args: unknown[]) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send(channel, ...args);
}

/**
 * Pull the current liked-songs list from YouTube Music and merge it into the
 * local library.
 *
 * Songs that fall out of the likes list are kept (flagged `inLibrary: false`)
 * rather than deleted, so the map decisions attached to them survive.
 */
export async function syncLibrary(): Promise<Library> {
  sendToRenderer("sync:started");
  log.info("Starting library sync...");

  try {
    const provider = await getProvider();
    const rawLikedSongs = await provider.getLikedSongs();

    // Pagination can hand back overlapping pages.
    const seenVideoIds = new Set<string>();
    const likedSongs = rawLikedSongs.filter((s) => {
      if (seenVideoIds.has(s.videoId)) return false;
      seenVideoIds.add(s.videoId);
      return true;
    });

    const library = getLibrary();
    const now = new Date().toISOString();

    const currentIds = new Set(likedSongs.map((s) => s.videoId));
    const merged: LibraryItem[] = [];

    for (const song of likedSongs) {
      merged.push({
        id: song.id,
        videoId: song.videoId,
        title: song.title,
        artists: song.artists,
        album: song.album,
        durationText: song.durationText,
        durationSeconds: song.durationSeconds,
        thumbnails: song.thumbnails,
        isAvailable: song.isAvailable,
        inLibrary: true,
        source: "liked",
        lastSeenAt: now,
      });
    }

    for (const item of library.items) {
      if (!currentIds.has(item.videoId)) {
        merged.push({ ...item, inLibrary: false });
      }
    }

    const updated: Library = {
      version: 1,
      lastFullSyncAt: now,
      lastSyncStatus: "success",
      items: merged,
    };

    await saveLibrary(updated);
    log.info(
      `Sync complete: ${likedSongs.length} liked songs, ${merged.length} total in cache`
    );

    sendToRenderer("sync:finished", { success: true, count: merged.length });
    return updated;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error("Sync failed:", msg);

    try {
      const library = getLibrary();
      await saveLibrary({ ...library, lastSyncStatus: "failed" });
    } catch {
      // Library was never loaded; nothing to downgrade.
    }

    sendToRenderer("sync:finished", { success: false, error: msg });
    throw err;
  }
}

/**
 * Add a song found through search into the library so it can go through the
 * normal match / decide / download flow.
 *
 * Marked `source: "search"` and `inLibrary: false`, which keeps it out of the
 * liked-songs count while still surviving future syncs. If the song is already
 * present (it may genuinely be one of your likes) the existing entry wins, so
 * its decisions are never disturbed.
 */
export async function addSongFromSearch(song: LikedSong): Promise<LibraryItem> {
  const library = getLibrary();

  const existing = library.items.find((i) => i.videoId === song.videoId);
  if (existing) {
    log.info(`Song "${song.title}" is already in the library`);
    return existing;
  }

  const item: LibraryItem = {
    id: song.id,
    videoId: song.videoId,
    title: song.title,
    artists: song.artists,
    album: song.album,
    durationText: song.durationText,
    durationSeconds: song.durationSeconds,
    thumbnails: song.thumbnails,
    isAvailable: song.isAvailable,
    inLibrary: false,
    source: "search",
    lastSeenAt: new Date().toISOString(),
  };

  library.items.push(item);
  await saveLibrary(library);

  log.info(`Added "${song.title}" to the library from search`);
  return item;
}
