import log from "electron-log/main";

/**
 * BeatSaver asks API consumers to identify themselves and to stay polite about
 * request rates. Everything that talks to a public map API goes through here.
 */
export const USER_AGENT = "ytbssync/0.1.0 (+https://github.com/ytbssync)";

/** Minimum gap between requests to the same host, in milliseconds. */
const HOST_MIN_INTERVAL_MS: Record<string, number> = {
  "api.beatsaver.com": 250,
  "scoresaber.com": 400,
};

const DEFAULT_MIN_INTERVAL_MS = 250;

/** Per-host promise chain, so requests to one host never overlap. */
const hostQueues = new Map<string, Promise<void>>();
const lastRequestAt = new Map<string, number>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serialise work per host and space it out. */
function schedule<T>(host: string, task: () => Promise<T>): Promise<T> {
  const minInterval = HOST_MIN_INTERVAL_MS[host] ?? DEFAULT_MIN_INTERVAL_MS;
  const previous = hostQueues.get(host) ?? Promise.resolve();

  const run = previous.then(async () => {
    const last = lastRequestAt.get(host) ?? 0;
    const wait = last + minInterval - Date.now();
    if (wait > 0) await delay(wait);
    lastRequestAt.set(host, Date.now());
  });

  const result = run.then(task);

  // Keep the chain alive regardless of whether this task succeeded.
  hostQueues.set(
    host,
    result.then(
      () => undefined,
      () => undefined
    )
  );

  return result;
}

export interface RequestOptions {
  /** Attempts including the first. */
  retries?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

/** Retryable transport-level or server-side failures. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 408 || status >= 500;
}

async function requestOnce(
  url: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<Response> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

  const onOuterAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onOuterAbort, { once: true });

  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: timeoutController.signal,
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onOuterAbort);
  }
}

/** Throttled GET with retry and exponential backoff. Honours Retry-After. */
export async function httpGet(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { retries = 3, timeoutMs = 20000, signal } = options;
  const host = new URL(url).host;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (signal?.aborted) throw new Error("Request aborted");

    try {
      const response = await schedule(host, () =>
        requestOnce(url, timeoutMs, signal)
      );

      if (response.ok) return response;

      if (!isRetryableStatus(response.status)) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      // Respect an explicit Retry-After before falling back to backoff.
      const retryAfter = Number(response.headers.get("retry-after"));
      const backoff =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 500 * 2 ** attempt;

      lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
      if (attempt < retries - 1) {
        log.warn(`${url} -> ${response.status}, retrying in ${backoff}ms`);
        await delay(backoff);
      }
    } catch (err: unknown) {
      if (signal?.aborted) throw new Error("Request aborted");
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        await delay(500 * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error(`Request failed: ${url}`);
}

export async function getJson<T>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  const response = await httpGet(url, options);
  return (await response.json()) as T;
}
