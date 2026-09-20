import fs from "fs";
import { BrowserWindow, session } from "electron";
import { Auth, AuthSchema } from "../utils/schema";
import { loadJson, saveJsonAtomic } from "../utils/json-store";
import { getAuthPath } from "../utils/paths";
import { encrypt, decrypt, isEncryptionAvailable } from "../utils/safe-storage";
import { YoutubeMusicProvider } from "../providers/youtube-music-provider";
import log from "electron-log/main";

let cachedCookies: string | null = null;

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  provider: string | null;
}> {
  try {
    const auth = await loadAuth();
    return { isAuthenticated: !!auth, provider: auth ? "youtubei.js" : null };
  } catch {
    return { isAuthenticated: false, provider: null };
  }
}

async function loadAuth(): Promise<string | null> {
  if (cachedCookies) return cachedCookies;

  const authPath = getAuthPath();
  try {
    await fs.promises.access(authPath);
  } catch {
    return null;
  }

  const auth = await loadJson(authPath, AuthSchema, null as unknown as Auth);
  if (!auth) return null;

  if (auth.encrypted && isEncryptionAvailable()) {
    cachedCookies = decrypt(auth.ciphertextBase64);
  } else if (!auth.encrypted) {
    cachedCookies = auth.ciphertextBase64;
  } else {
    log.warn("Auth is encrypted but decryption is unavailable");
    return null;
  }

  return cachedCookies;
}

// Extract cookies from Electron session as a header string
async function extractSessionCookies(): Promise<string> {
  const ses = session.defaultSession;
  const cookies = await ses.cookies.get({ domain: ".youtube.com" });
  const googleCookies = await ses.cookies.get({ domain: ".google.com" });

  const all = [...cookies, ...googleCookies];

  // Deduplicate by name, prefer youtube.com
  const map = new Map<string, string>();
  for (const c of all) {
    if (!map.has(c.name) || (c.domain && c.domain.includes("youtube"))) {
      map.set(c.name, c.value);
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

// Open a BrowserWindow for the user to sign into YouTube Music
export function openLoginWindow(): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const loginWin = new BrowserWindow({
      width: 500,
      height: 700,
      title: "Sign in to YouTube Music",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    loginWin.setMenuBarVisibility(false);

    loginWin.loadURL("https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fmusic.youtube.com%2F&service=youtube");

    // Check when navigation reaches music.youtube.com (login complete)
    loginWin.webContents.on("did-navigate", async (_event, url) => {
      log.info(`Login window navigated to: ${url}`);
      if (url.startsWith("https://music.youtube.com")) {
        try {
          const cookieStr = await extractSessionCookies();
          log.info(`Extracted ${cookieStr.split(";").length} cookies from login session`);
          settled = true;
          loginWin.close();
          resolve(cookieStr);
        } catch (err) {
          settled = true;
          loginWin.close();
          reject(err);
        }
      }
    });

    loginWin.on("closed", () => {
      if (!settled) reject(new Error("Login window closed before completing sign-in."));
    });
  });
}

// Cookie paste import (kept as fallback)
function parseCookieInput(raw: string): string {
  const trimmed = raw.trim();

  // Header format: name=value; name=value
  if (!trimmed.includes("\n") && trimmed.includes("=") && !trimmed.includes("\t")) {
    const seen = new Map<string, string>();
    for (const pair of trimmed.split(/;\s*/)) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const name = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1);
      if (name) seen.set(name, value);
    }
    if (seen.size > 0) return Array.from(seen.entries()).map(([n, v]) => `${n}=${v}`).join("; ");
    return trimmed;
  }

  // Netscape cookies.txt format
  const cookieMap = new Map<string, string>();
  for (const line of trimmed.split(/\r?\n/)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;
    const parts = stripped.split("\t");
    if (parts.length >= 7) {
      const domain = parts[0];
      const name = parts[5];
      const value = parts[6];
      if (domain.includes("youtube") || domain.includes("google")) {
        if (!cookieMap.has(name) || domain.includes("youtube")) {
          cookieMap.set(name, value);
        }
      }
    }
  }

  if (cookieMap.size > 0) {
    return Array.from(cookieMap.entries()).map(([n, v]) => `${n}=${v}`).join("; ");
  }

  throw new Error("Could not parse cookies.");
}

async function saveAuth(cookieString: string): Promise<void> {
  const useEncryption = isEncryptionAvailable();
  const authData: Auth = {
    version: 1,
    provider: "youtubei.js",
    encrypted: useEncryption,
    ciphertextBase64: useEncryption ? encrypt(cookieString) : cookieString,
  };
  await saveJsonAtomic(getAuthPath(), authData);
  cachedCookies = cookieString;
}

export async function importAuthViaBrowser(): Promise<void> {
  log.info("Opening browser login window...");
  const cookieStr = await openLoginWindow();

  // Validate
  const provider = new YoutubeMusicProvider(cookieStr);
  await provider.validateAuth();

  await saveAuth(cookieStr);
  log.info("Auth imported via browser login successfully");
}

export async function importAuth(cookies: string): Promise<void> {
  log.info("Importing auth credentials from paste...");
  const parsed = parseCookieInput(cookies);
  log.info(`Parsed ${parsed.split(";").length} cookies from input`);

  const provider = new YoutubeMusicProvider(parsed);
  await provider.validateAuth();

  await saveAuth(parsed);
  log.info("Auth imported and saved successfully");
}

export async function clearAuth(): Promise<void> {
  cachedCookies = null;
  // Clear Electron session cookies too
  try {
    await session.defaultSession.clearStorageData({
      origin: "https://music.youtube.com",
      storages: ["cookies"],
    });
    await session.defaultSession.clearStorageData({
      origin: "https://accounts.google.com",
      storages: ["cookies"],
    });
  } catch {
    // ignore
  }

  const authPath = getAuthPath();
  try {
    await fs.promises.unlink(authPath);
    log.info("Auth cleared");
  } catch {
    // File didn't exist, that's fine
  }
}

export async function getProvider(): Promise<YoutubeMusicProvider> {
  const cookies = await loadAuth();
  if (!cookies) {
    throw new Error("Not authenticated. Please sign in first.");
  }
  return new YoutubeMusicProvider(cookies);
}
