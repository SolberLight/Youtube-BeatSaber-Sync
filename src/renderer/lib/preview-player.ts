import { useSyncExternalStore } from "react";

/**
 * A single shared audio element for BeatSaver map previews.
 *
 * Kept at module scope rather than per-card so starting one preview always
 * stops whatever was playing before - several clips at once would make it
 * impossible to tell which map you are hearing.
 */

let audio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let isPlaying = false;
let isLoading = false;
let lastError: string | null = null;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface PreviewState {
  url: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

// useSyncExternalStore compares snapshots by identity, so the same object is
// reused until something actually changes.
let snapshot: PreviewState = {
  url: null,
  isPlaying: false,
  isLoading: false,
  error: null,
};

function refreshSnapshot(): void {
  snapshot = {
    url: currentUrl,
    isPlaying,
    isLoading,
    error: lastError,
  };
}

function update(): void {
  refreshSnapshot();
  emit();
}

function getSnapshot(): PreviewState {
  return snapshot;
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;

  const element = new Audio();
  element.preload = "none";
  element.volume = 0.7;

  element.addEventListener("playing", () => {
    isPlaying = true;
    isLoading = false;
    lastError = null;
    update();
  });

  element.addEventListener("waiting", () => {
    isLoading = true;
    update();
  });

  element.addEventListener("pause", () => {
    isPlaying = false;
    isLoading = false;
    update();
  });

  element.addEventListener("ended", () => {
    isPlaying = false;
    isLoading = false;
    currentUrl = null;
    update();
  });

  element.addEventListener("error", () => {
    isPlaying = false;
    isLoading = false;
    lastError = "Preview unavailable";
    update();
  });

  audio = element;
  return element;
}

export function stopPreview(): void {
  if (!audio) return;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  currentUrl = null;
  isPlaying = false;
  isLoading = false;
  update();
}

/** Play `url`, or stop if that clip is already the one playing. */
export function togglePreview(url: string): void {
  if (!url) return;

  const element = ensureAudio();

  if (currentUrl === url) {
    if (isPlaying) {
      element.pause();
      return;
    }
    // Same clip, previously paused or finished - start it again.
    void element.play().catch(() => {
      lastError = "Preview unavailable";
      isLoading = false;
      update();
    });
    return;
  }

  // Switching clips: drop the old one first.
  element.pause();
  element.src = url;
  currentUrl = url;
  isLoading = true;
  lastError = null;
  update();

  void element.play().catch(() => {
    isPlaying = false;
    isLoading = false;
    lastError = "Preview unavailable";
    update();
  });
}

export function usePreviewPlayer(): PreviewState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
