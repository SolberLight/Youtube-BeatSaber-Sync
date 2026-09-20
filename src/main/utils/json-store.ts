import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { z } from "zod";
import log from "electron-log/main";

export async function loadJson<T>(
  filePath: string,
  schema: z.ZodType<T>,
  fallback: T
): Promise<T> {
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    log.warn(`Schema validation failed for ${filePath}:`, result.error.message);
    // Back up the invalid file
    const backupPath = filePath + `.backup-${Date.now()}`;
    await fs.promises.copyFile(filePath, backupPath);
    log.info(`Backed up invalid file to ${backupPath}`);
    return fallback;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    log.error(`Error loading ${filePath}:`, err);
    return fallback;
  }
}

export async function saveJsonAtomic(
  filePath: string,
  data: unknown
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });

  const tmpPath = path.join(
    dir,
    `.${path.basename(filePath)}.tmp-${process.pid}-${randomUUID()}`
  );

  const json = JSON.stringify(data, null, 2);
  const fd = await fs.promises.open(tmpPath, "w");
  try {
    await fd.writeFile(json, "utf-8");
    await fd.sync();
  } finally {
    await fd.close();
  }

  await fs.promises.rename(tmpPath, filePath);
}

export async function updateJson<T>(
  filePath: string,
  schema: z.ZodType<T>,
  fallback: T,
  updater: (current: T) => T
): Promise<T> {
  const current = await loadJson(filePath, schema, fallback);
  const updated = updater(current);
  const result = schema.safeParse(updated);
  if (!result.success) {
    throw new Error(`Invalid data for ${filePath}: ${result.error.message}`);
  }
  await saveJsonAtomic(filePath, result.data);
  return result.data;
}
