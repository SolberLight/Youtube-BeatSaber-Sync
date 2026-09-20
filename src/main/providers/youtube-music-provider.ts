import { Innertube } from "youtubei.js";
import { MusicProvider, LikedSong } from "./music-provider";
import { session } from "electron";
import log from "electron-log/main";

async function setCookiesInSession(cookieString: string): Promise<void> {
  const ses = session.defaultSession;
  const pairs = cookieString.split(";").map((c) => c.trim()).filter(Boolean);

  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const name = pair.substring(0, eqIdx).trim();
    const value = pair.substring(eqIdx + 1).trim();

    const isSecure = name.startsWith("__Secure-") || name.startsWith("__Host-");

    // Set for both .youtube.com and .google.com
    for (const domain of [".youtube.com", ".google.com"]) {
      try {
        await ses.cookies.set({
          url: `https://${domain.startsWith(".") ? domain.substring(1) : domain}`,
          name,
          value,
          domain,
          path: "/",
          secure: isSecure,
          httpOnly: true,
          sameSite: "no_restriction",
        });
      } catch {
        // Some cookies may fail for specific domains, that's okay
      }
    }
  }

  log.info(`Set ${pairs.length} cookies in Electron session`);
}

// Use Node.js native https to make requests, bypassing Electron's Chromium fetch
function makeNodeFetch(): typeof globalThis.fetch {
  const https = require("https");
  const http = require("http");

  return async function nodeFetch(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> {
    let urlStr: string;
    let method = "GET";
    const headers: Record<string, string> = {};
    let body: string | Buffer | undefined;

    // Extract URL, method, headers, body from input
    if (typeof input === "string") {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else {
      // Request object
      urlStr = input.url;
      method = input.method;
      input.headers.forEach((v, k) => { headers[k] = v; });
      if (input.body) {
        const reader = input.body.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        body = Buffer.concat(chunks);
      }
    }

    // Override with init values if provided
    if (init?.method) method = init.method;
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((v, k) => { headers[k] = v; });
      } else if (Array.isArray(init.headers)) {
        for (const [k, v] of init.headers) headers[k] = v;
      } else {
        Object.assign(headers, init.headers);
      }
    }
    if (init?.body !== undefined) {
      body = typeof init.body === "string" ? init.body : Buffer.from(init.body as ArrayBuffer);
    }

    const url = new URL(urlStr);
    const mod = url.protocol === "https:" ? https : http;

    return new Promise((resolve, reject) => {
      const req = mod.request(
        url,
        { method, headers },
        (res: any) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const responseHeaders = new Headers();
            for (const [key, val] of Object.entries(res.headers)) {
              if (val) responseHeaders.set(key, Array.isArray(val) ? val.join(", ") : val as string);
            }
            resolve(
              new Response(buffer, {
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: responseHeaders,
              })
            );
          });
        }
      );
      req.on("error", reject);
      if (body) req.write(body);
      req.end();
    });
  } as typeof globalThis.fetch;
}

export class YoutubeMusicProvider implements MusicProvider {
  private innertube: Innertube | null = null;
  private cookies: string;

  constructor(cookies: string) {
    this.cookies = cookies;
  }

  private async getClient(): Promise<Innertube> {
    if (!this.innertube) {
      // Also set cookies in Electron's session for any webview usage
      await setCookiesInSession(this.cookies);

      this.innertube = await Innertube.create({
        cookie: this.cookies,
        // Use Node.js native fetch to bypass Electron's Chromium cookie jar
        fetch: makeNodeFetch(),
      });
    }
    return this.innertube;
  }

  async validateAuth(): Promise<void> {
    const yt = await this.getClient();
    if (!yt.session.logged_in) {
      throw new Error("Not logged in. Cookies may be invalid or expired.");
    }
    // Actually test an API call to confirm cookies work
    try {
      const playlist = await yt.music.getPlaylist("LM");
      log.info(`Validation playlist items: ${playlist.items?.length ?? 0}`);
    } catch (err: unknown) {
      this.innertube = null;
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Cookies are invalid or malformed: ${msg}`);
    }
    log.info("Auth validated successfully");
  }

  async getLikedSongs(): Promise<LikedSong[]> {
    const yt = await this.getClient();
    log.info("Fetching liked songs from YouTube Music...");

    const likedPlaylist = await yt.music.getPlaylist("LM");

    const results: LikedSong[] = [];

    this.collectItems(likedPlaylist.items, results);

    // Handle continuation pages
    let page = likedPlaylist;
    while (page.has_continuation) {
      log.info(`Fetched ${results.length} songs so far, loading more...`);
      page = await page.getContinuation();
      this.collectItems(page.items, results);
    }

    log.info(`Fetched ${results.length} liked songs total`);
    return results;
  }

  /**
   * Search YouTube Music for songs by free text.
   *
   * Lets you find a map for a track that is not in your likes at all, so the
   * app is usable for one-off lookups as well as a whole-library sync.
   */
  async searchSongs(query: string, limit = 20): Promise<LikedSong[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const yt = await this.getClient();
    log.info(`Searching YouTube Music for "${trimmed}"...`);

    const search = await yt.music.search(trimmed, { type: "song" });

    // A filtered search puts its hits in `songs`; fall back to scanning the
    // raw shelves when the response is not filtered the way we asked.
    const items: any[] = [];

    const songShelf = search.songs;
    if (songShelf?.contents) {
      items.push(...songShelf.contents);
    } else if (search.contents) {
      for (const shelf of search.contents as any[]) {
        if (Array.isArray(shelf?.contents)) items.push(...shelf.contents);
      }
    }

    const results: LikedSong[] = [];
    for (const item of items) {
      // Shelves can carry albums and artists alongside the songs.
      if (item?.item_type && item.item_type !== "song" && item.item_type !== "video") {
        continue;
      }
      try {
        const song = this.normalizeItem(item);
        if (song) results.push(song);
      } catch (err) {
        log.warn("Failed to normalize search result:", err);
      }
      if (results.length >= limit) break;
    }

    log.info(`Search "${trimmed}" returned ${results.length} songs`);
    return results;
  }

  private collectItems(items: any[] | undefined, results: LikedSong[]): void {
    if (!items) return;
    for (const item of items) {
      try {
        const song = this.normalizeItem(item);
        if (song) results.push(song);
      } catch (err) {
        log.warn("Failed to normalize song item:", err);
      }
    }
  }

  private normalizeItem(item: any): LikedSong | null {
    const videoId = item.id || item.video_id;
    if (!videoId) return null;

    const title =
      item.title?.text || item.title?.toString() || item.name || "Unknown";

    const artists: string[] = [];
    if (item.artists && Array.isArray(item.artists)) {
      for (const a of item.artists) {
        const name = a.name || (typeof a === "string" ? a : null);
        if (name) artists.push(name);
      }
    }
    if (artists.length === 0 && item.author) {
      const authorName =
        item.author?.name || item.author?.text || item.author?.toString();
      if (authorName) artists.push(authorName);
    }

    const album =
      item.album?.name || item.album?.text || item.album?.toString() || null;

    let durationText: string | null = null;
    let durationSeconds: number | null = null;

    if (item.duration) {
      if (typeof item.duration === "object") {
        durationText = item.duration.text || null;
        if (item.duration.seconds != null) {
          durationSeconds = item.duration.seconds;
        }
      } else if (typeof item.duration === "string") {
        durationText = item.duration;
      }
    }

    if (durationText && durationSeconds == null) {
      const parts = durationText.split(":").map(Number);
      if (parts.length === 2 && parts.every((n) => !isNaN(n)))
        durationSeconds = parts[0] * 60 + parts[1];
      else if (parts.length === 3 && parts.every((n) => !isNaN(n)))
        durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    const thumbnails = (item.thumbnails || item.thumbnail || []).map(
      (t: any) => ({
        url: t.url,
        width: t.width,
        height: t.height,
      })
    );

    return {
      id: `ytm:video:${videoId}`,
      videoId,
      title,
      artists,
      album,
      durationText,
      durationSeconds,
      thumbnails,
      isAvailable: item.is_available !== false,
    };
  }
}
