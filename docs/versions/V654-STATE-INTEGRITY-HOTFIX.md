# Sonic Display V654 – State integrity, motion and Spotify hotfix

Applies on top of `sonic-display-v654-gpu-lyrics-microphone-gltf-hotfix.zip`.

## Corrections

1. Unified settings backup (`services/settings/unifiedBackup.ts`) explicitly includes the character motion library, GLB blend preset store, V290 camera presets, and V354 show timeline. No generic wildcard: token/secret/cookie/oauth exclusions remain intact. Backups are configuration backups, **not copies of local GLB assets**; externally referenced media must remain available after migration.
2. UI preference persistence (`context/UiPreferencesContext.tsx`) traps storage quota and SecurityError exceptions; in-memory settings remain usable.
3. Spotify logout (`hooks/usePlaybackPolling.ts`, `context/MusicContext.tsx`) invalidates an in-flight request immediately before the disconnect network call, cancels scheduled polling and Lyrics requests, and prevents an old response from restoring a disconnected UI. Does not imply server session reauthentication.
4. Missing Lyrics are retried on the *same* track after bounded 15–120 second backoff; Spotify polling remains independent of Lyrics.
5. Automatic LOD fade does not swap the wardrobe's live materials for copies. It temporarily modulates the already-owned material opacity and restores the original settings after fading.
6. The GLB dancer owns a single `AnimationMixer` with one frame update; actions are uncached with their **AnimationClip**, not `AnimationAction` instances. The mixer is cleaned up at unmount.
7. Non-shared Blob avatar uploads omit Shared-Motion fingerprints and clip counts instead of submitting `""` and `0`.
8. Avatar configuration updates are stored as immutable, per-model patches in Blob storage and merged on read; two concurrent writes no longer overwrite each other's entire configuration. Local filesystem updates are serialized within the Node process. Existing legacy snapshots remain readable. `list()` pagination is followed beyond 1000 items.
9. Automatic motion selection uses only the same installed/latest 24 motions actually loaded by the renderer; previously-installed but unloaded entries cannot be selected.
10. Preview seeking back from `LoopOnce` resets/unpauses the action before applying the target time.
11. Updating a GLB blend preset changes only the matching preset ID; other models' presets are untouched.
12. Live-Push configuration failures retry with bounded exponential backoff, respond to `online` events, abort on teardown, and do not silently route an Ably-enabled production deployment to local-only SSE.

## Verification in this environment

- `npm run test:integrity:v654` – passed.
- `npm run test:integrity:v654:types` – passed.
- `npm run test:blob:v654` – passed (1002 snapshot entries, second-page newest and concurrent writes).
- `npm run test:smoke:v654` – passed.
- Legacy V184, V185, V186, V290, V354, V492 (mixer + presets), V531 tests – passed after aligning stale test assumptions to the current modular structure.
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types` – passed.
- Historical `npm run verify:offline:fast`: started and passed through at least V438, but not completed under the execution limit; no full-suite PASS claimed.
- Full application `npm run typecheck` / `npm run build`: **not run to success**; `node_modules` and `package-lock.json` are not in the project archive/runtime. Validate using `npm install` then `npm run verify` on a machine with dependencies, and confirm both Windows and Linux GitHub Actions.

## Caveats

- Per-model Blob patch history trades loss-free concurrent writes for growing version history. A future compaction process should be concurrency-safe and preserve all unapplied patches.
- GPU/Three.js visual effects and actual browser/SSE behavior require interactive runtime verification with real assets; regression tests are not proof of a leak-free GPU session.
- Keep secrets in server environment settings; do not include them in backup archives.
