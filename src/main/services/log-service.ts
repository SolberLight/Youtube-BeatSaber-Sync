import log from "electron-log/main";
import path from "path";
import fs from "fs";
import { getLogsDir } from "../utils/paths";

export function initLogger(): void {
  const logsDir = getLogsDir();
  fs.mkdirSync(logsDir, { recursive: true });

  log.transports.file.resolvePathFn = () => path.join(logsDir, "main.log");
  log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
  log.transports.console.level = "warn";
  log.transports.file.level = "info";

  log.info("Logger initialized");
}

export function getLogContents(): string {
  const logPath = path.join(getLogsDir(), "main.log");
  try {
    return fs.readFileSync(logPath, "utf-8");
  } catch {
    return "";
  }
}

export { log };
