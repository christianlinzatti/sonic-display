# Sonic Display V354 – Show Timeline Editor

Base: complete Sonic Display V353, with V350 lyrics/photos, V351 composition, V352 genre, and V353 FX preserved. Package version: `0.1.0-v354`.

## Scope

V354 introduces an **opt-in show score** with six independent tracks in a touch-friendly timeline. Each track contains bounded, editable clips with start time, duration, action, and label:

| Track | Actions in V354 | Live mapping |
| --- | --- | --- |
| Dance / formation | Solo / Sync / Mirror / Duet | Uses existing group/formation renderer only when no user-selected group, duet, or authored formation mode is active. Does **not** install or sequence GLB motions. |
| Camera | Wide / Medium / Close / Orbit | Adds a bounded camera framing cue to the existing automatic directors. Saved camera keyframes/presets, manual camera modes and live edits take priority. V351 still guards minimum FOV and camera distance. |
| Lighting | Gain 0.25–1.80 | Multiplies the existing lighting gains, while respecting prior blackout and device-tier bounds. |
| Visual FX | Gain 0–1.80 | Modulates existing V353 particles, glow, shader and DanceFX. Never enables disabled V353/legacy FX and never allocates a second Canvas. |
| Photos | Opacity 0–1 | Adjusts V351/V350 photo choreography when Smart Stage Composition is enabled. Does not turn on disabled galleries or overwrite manual photo selections. |
| Lyrics | Focus / Normal | Reduces competing photos, FX and beams without hiding original lyrics, changing lyric timestamps or replacing the current lyrics provider. |

## Usage

`Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V354 – Show Timeline Editor`.

- Set a show name (up to 60 characters), duration (10–1800 seconds), optional exact Spotify track ID; leaving track ID blank applies to any track.
- Press `+ Clip` on a row at the selected playhead position. Clips can be moved by pointer or touch, snapped to 250 ms, or edited precisely using start/duration inputs. Click any clip to select it, adjust action, label, timing, or delete.
- Scrub the lightweight preview playhead to inspect which tracks are active, and test pause. Preview is not Spotify playback and uses no additional 3D renderers.
- Export the current show as JSON; import safely validated V354 JSON (limit 1MB). Imports are **disabled by default** so imported cues never surprise the user.
- Switch on `Show live aktivieren` to run the score with the actual Spotify track position. Song id mismatch, invalid progress, inactive clips, pause and an opt-out leave the original behavior in place. End times are exclusive; later-starting overlapping clips win in their lane.
- One editable score is stored in browser localStorage under `sonic-show-timeline-v354`. Multiple shows can be kept as individually exported JSON files. No audio, lyrics text, image assets, auth tokens or remote uploads are stored.

## Runtime and constraints

The score is evaluated by `services/stageContent/showTimelineV354.ts`, a pure bounded function requiring a valid current progress time. It never starts a timer for the live show and does not fake Spotify progress. The existing ThreeAvatar stage evaluates it once per React render and passes the same cue through camera, DynamicStage, media composition and FX. StageCameraDirector checks explicit camera presets/edits before the V354 shot, and SmartStageCamera remains autonomous when V354 has no active camera lane.

V354 is deliberately a *cue timeline*, not a full GLB motion sequencer or lyric text editor. The user's existing animation timelines, saved camera paths, lighting timelines, and library assets remain unchanged.

Runtime is capped at 400 clips; inputs (text, time, range, IDs, enums) are sanitized. JSON import rejects invalid formats and non-v1 schemas. Reduced-motion mode prevents new automatic dance/camera motions and FX boosts. This code has no new network services or external dependencies.

## Test results

- `node tests/check-source-syntax.cjs`: PASS (453 TS/TSX files).
- `node tests/v354-show-timeline-regression.cjs`: PASS (timing, clip editing, overlap, Spotify scoping, pause, reduced motion, lyrics safety, JSON validation, persistence and wiring).
- `node scripts/run-offline-regression-v352.cjs`: 97/97 PASS (includes V350–V354; historical script name).
- `node scripts/build-preflight.cjs`: BLOCKED. Original V353 source ZIP contains neither `node_modules` nor `package-lock.json` and npm dependencies are missing in this offline environment. Therefore neither `tsc --noEmit` nor a `next build` can be validated here. The TypeScript check is **not green** due to missing React/Next/Three modules and several pre-existing unrelated project diagnostics. Compilation must be verified after installing dependencies on a networked developer computer.

```bash
npm install
npm run test:v354
npm run verify
```

Next planned version: **V355 Performance & Stability**, especially for 10-inch touch displays and Raspberry Pi long-running operation.
