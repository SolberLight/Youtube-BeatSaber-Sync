import { contextBridge, ipcRenderer } from "electron";

const api = {
  auth: {
    status: () => ipcRenderer.invoke("auth:status"),
    import: (cookies: string) => ipcRenderer.invoke("auth:import", cookies),
    browserLogin: () => ipcRenderer.invoke("auth:browserLogin"),
    clear: () => ipcRenderer.invoke("auth:clear"),
  },
  library: {
    getAll: () => ipcRenderer.invoke("library:getAll"),
    sync: () => ipcRenderer.invoke("library:sync"),
    search: (query: string) => ipcRenderer.invoke("library:search", query),
    addSong: (song: unknown) => ipcRenderer.invoke("library:addSong", song),
  },
  matches: {
    getAll: () => ipcRenderer.invoke("matches:getAll"),
    search: (options?: { includeDecided?: boolean; retryNoMatch?: boolean }) =>
      ipcRenderer.invoke("matches:search", options),
    searchOne: (songId: string) =>
      ipcRenderer.invoke("matches:searchOne", songId),
    cancelSearch: () => ipcRenderer.invoke("matches:cancelSearch"),
    isSearching: () => ipcRenderer.invoke("matches:isSearching"),
    add: (songId: string, mapIds: string[]) =>
      ipcRenderer.invoke("matches:add", songId, mapIds),
    skip: (songId: string) => ipcRenderer.invoke("matches:skip", songId),
    reset: (songId: string) => ipcRenderer.invoke("matches:reset", songId),
    resetAll: () => ipcRenderer.invoke("matches:resetAll"),
    addMany: (selections: { songId: string; mapId: string }[]) =>
      ipcRenderer.invoke("matches:addMany", selections),
    addAll: () => ipcRenderer.invoke("matches:addAll"),
    openBeatSaver: (mapId: string) =>
      ipcRenderer.invoke("matches:openBeatSaver", mapId),
    openYouTube: (videoId: string) =>
      ipcRenderer.invoke("matches:openYouTube", videoId),
  },
  downloads: {
    getQueue: () => ipcRenderer.invoke("downloads:getQueue"),
    getDownloads: () => ipcRenderer.invoke("downloads:getDownloads"),
    retryFailed: () => ipcRenderer.invoke("downloads:retryFailed"),
    resume: () => ipcRenderer.invoke("downloads:resume"),
    pauseAll: () => ipcRenderer.invoke("downloads:pauseAll"),
    openFolder: (mapId?: string) =>
      ipcRenderer.invoke("downloads:openFolder", mapId),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    update: (partial: Record<string, unknown>) =>
      ipcRenderer.invoke("settings:update", partial),
    reset: () => ipcRenderer.invoke("settings:reset"),
    selectMapsDir: () => ipcRenderer.invoke("settings:selectMapsDir"),
    openAppData: () => ipcRenderer.invoke("settings:openAppData"),
  },
  diagnostics: {
    getLogs: () => ipcRenderer.invoke("diagnostics:getLogs"),
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      "sync:started",
      "sync:progress",
      "sync:finished",
      "match:started",
      "match:progress",
      "match:finished",
      "decision:changed",
      "download:queued",
      "download:started",
      "download:progress",
      "download:extracting",
      "download:finished",
      "download:failed",
      "download:paused",
      "download:allFinished",
    ];

    if (!validChannels.includes(channel)) return () => {};

    const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);

    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld("api", api);

export type ElectronAPI = typeof api;
