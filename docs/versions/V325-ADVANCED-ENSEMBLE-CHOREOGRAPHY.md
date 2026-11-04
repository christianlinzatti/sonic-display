# Sonic Display V325 — Advanced Ensemble Choreography Studio

V325 extends V324's **existing two-avatar formation stage**. It does not add a third or unlimited number of characters. It is an opt-in authoring interface for **manual formation/role cues at concrete song seconds**, backed by local JSON storage and a renderer-side deterministic cue evaluator. Earlier automatic and manual choreography is preserved when V325 is off.

## Operation

1. Open **Settings → Avatar → Multi-Avatar Choreography → Advanced Ensemble Choreography Studio · V325**.
2. Select snapping (`Takte`, `Beats`, `Frei`). For imported beat/bar markers, first import permitted song analysis under V318. When no imported analysis exists, the beat/bar markers are BPM-based; they are not represented as detected beats.
3. Click a cue on the horizontal timeline to select it, drag left/right to move it, or use keyboard left/right arrows; Shift isn't required. Move the preview scrubber to the desired time and click **+ Cue an Abspielposition** to insert a new cue.
4. Set formation (`Linie`, `Breit`, `Diagonal`, `Nah`), role (`Gemeinsam`, `Lead-Solo`, `Partner-Solo`), transition duration and optional `Gemeinsamer Drop`. Change stage XZ positions by dragging the two colored handles in the top-down plan. Both left and right dancer lanes and a minimum 1.4-unit origin separation are enforced independently of editable values.
5. Enable **3D-Vorschau anzeigen** to display the two selected character models with first embedded GLB motion where present, or procedural placeholders where absent. The editor previews actual formation coordinates and transition interpolation at the selected time. It does **not** preview the whole live lighting/IK/show pipeline or external imported motion library clips.
6. Preview locally with the transport buttons, scrub timeline, or follow the current Spotify progress with the `Spotify-Spielposition folgen` option.
7. Optional **An aktuellen Titel binden** writes the current track ID and uses the actual `cameraDirectorProgressMs` input on stage. If the current track differs or its position is unavailable, a bound timeline does not take over. Otherwise, without binding, the stage uses a shared elapsed clock while playing.
8. Only **Manuelle Ensemble-Choreografie live aktivieren** enables authored cues on the main stage, ensuring older automatic directors keep working as before by default. Live V325 takes precedence over automatic *group-level formation targets* and role-related gesture gain, and enables V324's bounded spatial stage coordinator for the duration of the cue.
9. **Exportieren** generates a `.json` choreography file. Import accepts up to 200 kB; the imported choreography is normalized and intentionally **disabled** until manually enabled. One-step Undo reverses the last editor change. The Reset button restores the example cues and disables live playback.

## Technical data, conflict handling and safeguards

`ensembleChoreographyV325.ts` defines `EnsembleTimelineV325`, each `EnsembleKeyframeV325` (`at`, `formation`, `role`, lead/partner XZ, `transition`, `drop`), and pure `evaluateEnsembleTimelineV325()` interpolation. It caps time (0–3600 s), timeline size (64 cues), XZ positions, transition duration, invalid numbers and role literals; duplicates get stable distinct IDs. Keyframes are evaluated from **absolute seconds** rather than past animation frames: seeking, looping and pause behave deterministically. The pure core also provides `gridMarkersV325`/`snapEnsembleSecondV325`, imported-marker guard against snapping to a stale last marker, localStorage read/write and event propagation.

`MultiAvatarChoreographyPanel` mounts `EnsembleChoreographyStudioV325`; `ThreeAvatar.FormationDancers` reads V325 settings and passes spatial targets through the **existing V143 separation and V324 bounded two-dancer coordinator**. A manual cue is not allowed to reorder left and right dancers. Formations influence stage-group origins, **not the bones, keyframes, Foot IK or actual physical collisions**. V322's group-travel slowdown still applies where enabled. V325 does not access Spotify private endpoints, fetch streams or collect raw audio.

The current character renderer supports exactly two dancers; V325 deliberately does not claim many-character formations. Song synchronization is only as current as the supplied playback position and is not sample-accurate audio alignment. A paused scene retains the current pose and stage positions. Title changes reset the local clock and do not reuse bound timelines from another track. Reduced Motion leaves the manual stage motion inactive (the authored timeline's visual preview can still be inspected by scrubbing).

## Main files

- `components/visualizer/ensembleChoreographyV325.ts` — pure deterministic cue evaluation, MIDI-like times, input normalization, persistence, imported/BPM marker snapping, track safety.
- `components/visualizer/EnsembleChoreographyStudioV325.tsx` — controls, draggable cue timeline, top-down stage handles, transport, track sync, JSON I/O and undo.
- `components/visualizer/EnsemblePreview3DV325.tsx` — lazy R3F 3D formation preview with optional selected GLB avatars and embedded motion.
- `components/visualizer/ThreeAvatar.tsx` — opt-in override and V324 connection for already-rendered dancer pair.
- `components/visualizer/MultiAvatarChoreographyPanel.tsx` — mounts the studio without adding a second settings hierarchy.
- `app/globals.css` — touch-friendly responsive timeline and stage layout.
- `tests/v325-ensemble-choreography-regression.cjs` — deterministic, track-scope, snapping, safe geometry, storage and UI integration checks.

## Verification and limits

- `npm run test:v325`: passed pure timeline and UI/renderer integration regression.
- `npm run verify:offline`: all retained regression tests through V325 + syntax check.
- Global `tsc --noEmit --strict` for `adaptiveEnsembleBalanceV324.ts` and `ensembleChoreographyV325.ts`: passed.
- Full Next.js / React / Three.js production build and browser/WebGL acceptance testing remain **unverified in this environment** due to missing npm dependencies. For a full local verification install dependencies and run `npm run verify`. Actual Spotify synchronization requires playback data from a configured account and depends on the existing provider polling intervals.
