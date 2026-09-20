# Developing YTBSSync

Working notes. Read this before changing anything — several
decisions here are non-obvious and were arrived at by debugging real failures.

## What this is

An Electron app that matches your YouTube Music **liked songs** to **Beat Saber
maps**, lets you review each match by hand, and installs the ones you accept
into your `CustomLevels` folder.

Built on the scaffold of `../ytm2local`, which it reuses for YouTube Music
sign-in, the liked-songs fetch, the JSON store, logging and the skin system.

## Layout

```
src/main/          Electron main process (Node). Owns all I/O and network.
  providers/       beatsaver, scoresaber, youtube-music, http (throttle+retry)
  services/        matching (pure), match-service, decision-service,
                   download-service, sync-service, cache-service, settings
  utils/           schema (zod, single source of truth), text, zip, paths
src/preload/       contextBridge API. Every IPC channel must be listed here.
src/renderer/      React UI
  features/        auth, library, search, match, downloads, settings
  lib/             types (mirrors schema), candidate-order, preview-player
  themes/          6 skins; they target the CSS class vocabulary in app.css
scripts/make-icon.py   Generates repo_assets/icon.{png,icns,ico} with Pillow
```

**`src/main/utils/schema.ts` is the source of truth** for all persisted data.
`src/renderer/lib/types.ts` mirrors it by hand — change both together.

## How it works

1. **Sync likes** → `sync-service` pulls liked songs via `youtubei.js` into
   `library.json`.
2. **Find maps** → `match-service` searches BeatSaver per song, scores every
   result in `matching.ts`, stores candidates in `matches.json`.
3. **Review** → user ticks maps and clicks Add or Skip. Decisions live on the
   match record, so a re-search never loses them.
4. **Download** → `download-service` runs a fixed-size worker pool, extracts
   each zip into `<key> (<song> - <mapper>)`.

### Sources

BeatSaver is the only site that actually hosts downloads. The other two are
fallbacks, tried only when a plain search returns nothing:

- **BeatSaver** — text search, metadata, downloads.
- **BeastSaber** — reached through BeatSaver's `curated` flag. `bsaber.com`
  **has no public API any more**; it is now a front-end over BeatSaver data.
  Don't try to call it.
- **ScoreSaber** — leaderboard search → `songHash` → BeatSaver
  `/maps/hash/{hash}`.

### Matching

Confidence blends title similarity, artist similarity and track-length
proximity. YouTube titles are de-noised first (`utils/text.ts`) — `(Official
Video)` is stripped, `(Acoustic)` is deliberately kept.

A candidate must clear every filter: min difficulty, min rating, min votes,
game modes, length tolerance, min confidence — **plus a title gate**
(`MIN_TITLE_SIMILARITY`). Without that gate, a strong artist + length match
happily returns *a different song by the same artist* (the bug that made
"Beat It" match "P.Y.T.").

## Gotchas that will bite you

**BeatSaver `automapper` is inverted from what you'd guess.** Omitting it
excludes AI maps (the default). `automapper=true` includes them.
`automapper=false` returns **only** AI maps. Sending `false` to "exclude" them
collapsed every search to ~1 result and produced 0/10 matches.

**`compareCandidates` must stay transitive.** It compares *rounded whole
percentages*, not raw scores with a tolerance. A tolerance comparison
(`|a-b| > 0.02`) is not transitive: with .645/.624/.635 the first pair differs
but the second ties, and `sort` then renders a 62% above a 64%. It is
**mirrored in two files** — `main/services/matching.ts` and
`renderer/lib/candidate-order.ts`. Keep them in step. The renderer copy exists
so changing the ordering setting re-ranks matches already on disk instead of
only affecting future searches.

**Never break existing user data.** Every field added to a schema since v1 is
`.optional()` or `.default()`. `loadJson` backs up and *resets* a file that
fails validation, which would wipe a 2,650-song library. Fields added this way
so far: `library.source`, `match.foundAt`, `match.chosenMapIds`,
`download.candidate`, `config.preferCuratedRanked`.

**`foundAt` vs `searchedAt`.** The review list sorts on `foundAt` (set once,
preserved across re-searches). Sorting on `searchedAt` makes re-searched songs
jump to the bottom — reshuffling the list while the user is reading it.

**macOS userData is case-insensitive.** The dev run uses `ytbssync` and the
packaged app uses `YTBSSync`; they resolve to the same folder, so data carries
over between them. Don't "fix" this.

**Pause/resume races.** `download-service` uses a `runGeneration` counter so a
stale run's `finally` can't clear a newer run's state. Without it, pause →
immediate resume silently stalls the queue.

**Rate limits.** `providers/http.ts` serialises per host with a minimum gap
(250ms BeatSaver, 400ms ScoreSaber) plus retry/backoff honouring `Retry-After`.
A full 2,650-song search takes ~25 minutes — that is the throttle, not a bug.
Don't kick off a full search casually; it hammers a free API.

**Zip safety.** `utils/zip.ts` validates every entry name before writing
(zip-slip). Don't bypass it.

## Commands

```bash
npm install
npm run dev        # Vite + Electron (renderer hot-reloads)
npm run typecheck  # all three tsconfigs — run before every commit
npm run build      # main + preload (tsc) and renderer (vite)
python3 scripts/make-icon.py   # regenerate the icon set
```

**Main-process changes need an Electron restart.** Only the renderer
hot-reloads. This catches people out constantly.

## How to test

There are no unit tests. Verify against reality instead — every real bug in
this project was found this way, not by typechecking.

**Pure logic against the live API.** `matching.ts` and `zip.ts` have no
Electron imports, so `dist/main/**` can be `require()`d straight from Node:

```bash
npm run build:main
node -e "const m=require('./dist/main/services/matching.js'); /* ... */"
```

**The running UI over CDP.** Launch with a debug port and drive the renderer —
this exercises the real IPC, real auth and real data:

```bash
npx electron . --remote-debugging-port=9222
```

Then connect to `http://localhost:9222/json/list`, open the page's
`webSocketDebuggerUrl`, and use `Runtime.evaluate` with
`awaitPromise: true, returnByValue: true`. From there `window.api.*` is
callable and the DOM is inspectable — good for asserting render order, CSS
classes and element geometry, not just that something "looks right".

Prefer asserting measurable facts (`addIsLeftOfSkip`, `pctOrderViolations: 0`)
over screenshots.

**Be careful what you trigger.** Adding maps really downloads them and
searching really hits BeatSaver. Test on a bounded slice and cancel — cancelling
a search is safe and keeps everything found so far.

## Updating the installed macOS app

`npm run dist` alone is **not enough**: electron-builder skips signing when no
Developer ID is present, leaving an incomplete signature (`Info.plist=not
bound`) that Apple Silicon will not launch properly. Re-sign ad-hoc:

```bash
cd /path/to/ytbssync
pkill -f "electron \."; pkill -f "vite --config"        # free the build
npm run build
npx electron-builder --mac dir --arm64 --publish never

APP="release/mac-arm64/YTBSSync.app"
codesign --force --deep --sign - "$APP"                  # required
codesign --verify --strict "$APP"                        # expect silence

pkill -f "/Applications/YTBSSync.app"
rm -rf "/Applications/YTBSSync.app"
ditto "$APP" "/Applications/YTBSSync.app"                # ditto, not cp
open -a "/Applications/YTBSSync.app"
```

`ditto` preserves the signature; `cp -r` can break it. User data is untouched
by a reinstall — it lives in `~/Library/Application Support/ytbssync`.

The build is ad-hoc signed only, so it runs locally but is **not
distributable**. Shipping it needs a real Developer ID and notarisation.

## Data files

`~/Library/Application Support/ytbssync/` (Settings → Advanced → Open app data
folder):

| File | Contents |
| --- | --- |
| `config.json` | Settings |
| `auth.json` | YouTube Music cookies, encrypted via `safeStorage` |
| `library.json` | Liked songs + anything added from Search |
| `matches.json` | Candidates, discovery order, Add/Skip decisions |
| `downloads.json` | Installed maps keyed by map id, with a map snapshot |
| `queue.json` | Pending/active/failed download jobs |
| `logs/main.log` | `electron-log` output — check here first when debugging |

Unliking a song never deletes its local record, so its decision survives.
