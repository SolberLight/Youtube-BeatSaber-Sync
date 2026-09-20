import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { initLogger } from "./services/log-service";
import { loadSettings, updateSettings } from "./services/settings-service";
import {
  loadLibrary,
  loadMatches,
  loadDownloads,
  loadQueue,
  getMatches,
} from "./services/cache-service";
import { primeQueueFromMatches } from "./services/download-service";
import { registerAuthIpc } from "./ipc/auth-ipc";
import { registerLibraryIpc } from "./ipc/library-ipc";
import { registerMatchIpc } from "./ipc/match-ipc";
import { registerDownloadsIpc } from "./ipc/downloads-ipc";
import { registerSettingsIpc } from "./ipc/settings-ipc";
import type { MapCandidate } from "./utils/schema";
import log from "electron-log/main";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

/** The .icns inside the bundle covers packaged macOS builds; this is for the rest. */
function iconPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "icon.png")
    : path.join(__dirname, "..", "..", "repo_assets", "icon.png");
}

async function createWindow(): Promise<void> {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    // Used on Windows and Linux; macOS takes its icon from the bundle.
    icon: iconPath(),
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    title: "YTBSSync",
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  if (isDev) {
    await mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, "..", "renderer", "index.html")
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/** Find a queued map's metadata again after a restart. */
function findCandidate(mapId: string): MapCandidate | null {
  try {
    for (const match of Object.values(getMatches().items)) {
      const candidate = match.candidates.find((c) => c.mapId === mapId);
      if (candidate) return candidate;
    }
  } catch {
    // Matches never loaded; the job will fail cleanly instead.
  }
  return null;
}

async function bootstrap(): Promise<void> {
  initLogger();
  log.info("App starting...");

  await loadSettings();
  await loadLibrary();
  await loadMatches();
  await loadDownloads();
  await loadQueue();

  await updateSettings({ lastOpenedAt: new Date().toISOString() });

  registerAuthIpc();
  registerLibraryIpc();
  registerMatchIpc();
  registerDownloadsIpc();
  registerSettingsIpc();

  log.info("Bootstrap complete");
}

app.whenReady().then(async () => {
  try {
    // A dev run is not a bundle, so the dock would otherwise show Electron's
    // own icon. Packaged builds get theirs from the .icns.
    if (process.platform === "darwin" && !app.isPackaged && app.dock) {
      try {
        app.dock.setIcon(iconPath());
      } catch (err) {
        log.warn("Could not set dock icon:", err);
      }
    }

    await bootstrap();
    await createWindow();

    // Downloads interrupted by a quit pick up where they left off.
    primeQueueFromMatches(findCandidate);

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });
  } catch (err: unknown) {
    log.error("Startup failed", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
