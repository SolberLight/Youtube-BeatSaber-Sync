import fs from "fs";
import path from "path";
import { unzip, type Unzipped } from "fflate";

/**
 * Entry names inside a zip are attacker-controlled. An entry called
 * "../../Info.dat" would otherwise escape the destination directory
 * (zip-slip), so every name is validated before anything is written.
 */
function isUnsafeEntryName(name: string): boolean {
  if (!name) return true;
  // Absolute paths, Windows drive letters and UNC paths.
  if (name.startsWith("/") || name.startsWith("\\")) return true;
  if (/^[a-zA-Z]:/.test(name)) return true;
  // Any traversal segment, in either separator style.
  return name
    .split(/[/\\]/)
    .some((segment) => segment === ".." || segment === "." || segment === "");
}

function inflate(data: Uint8Array): Promise<Unzipped> {
  return new Promise((resolve, reject) => {
    unzip(data, (err, unzipped) => {
      if (err) reject(err);
      else resolve(unzipped);
    });
  });
}

export interface ExtractResult {
  fileCount: number;
  skipped: string[];
}

/**
 * Extract a Beat Saber map archive into `destDir`.
 *
 * Map zips are normally flat (Info.dat, cover.jpg, song.egg, <diff>.dat) but
 * some are nested one level deep, so directory entries are honoured.
 */
export async function extractZip(
  zipData: Uint8Array,
  destDir: string
): Promise<ExtractResult> {
  const entries = await inflate(zipData);

  const resolvedDest = path.resolve(destDir);
  await fs.promises.mkdir(resolvedDest, { recursive: true });

  const skipped: string[] = [];
  let fileCount = 0;

  for (const [name, content] of Object.entries(entries)) {
    // Directory entries arrive with a trailing slash and no content.
    if (name.endsWith("/") || name.endsWith("\\")) continue;

    if (isUnsafeEntryName(name)) {
      skipped.push(name);
      continue;
    }

    const target = path.resolve(resolvedDest, name);

    // Belt-and-braces: confirm the resolved path really is inside destDir.
    if (
      target !== resolvedDest &&
      !target.startsWith(resolvedDest + path.sep)
    ) {
      skipped.push(name);
      continue;
    }

    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    await fs.promises.writeFile(target, content);
    fileCount++;
  }

  return { fileCount, skipped };
}

/** A map folder is only usable if the game can find its Info.dat. */
export async function hasInfoDat(dir: string): Promise<boolean> {
  try {
    const names = await fs.promises.readdir(dir);
    return names.some((n) => n.toLowerCase() === "info.dat");
  } catch {
    return false;
  }
}
