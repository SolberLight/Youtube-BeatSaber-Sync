import type { ElectronAPI } from "./types";

export function getApi(): ElectronAPI {
  return window.api;
}
