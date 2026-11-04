# Sonic Display V386 – Expressive Concert Director

V386 extends the V385 manually authored visual vocal casts and V376 timed duet choreography. It coordinates **small reactive body gestures, eye contact, concert camera hints and bounded lighting accents** for 2–4 dancers. V385, all older show editors, GLB animation clips and foot IK remain available.

## Using V386

1. Open **Settings → Avatar & Tanz → V386 · Expressive Concert Director**.
2. Select **Dezent** (quiet reactions) or **Expressiv**. The default is **Aus**, preserving every previous setup.
3. Set expression strength, and optionally switch off automatic camera or lighting direction independently.
4. Configure synced lyric line casting in **V385 · Multi-Vocal Performance Studio**, or enable V376 inter-dancer dialog. V386 does not infer who actually sings in a recording.
5. Open **Vocal Sync Inspector → V386** to review the role, supporting performers, camera suggestion and expression gain at the current preview timestamp.

## Behavior

- **Verse / main vocalist:** visually assigned lead remains centered, while non-singing dancers may acknowledge the lead with slight head turns, controlled eye contact and small arm movements.
- **Feature and response:** stage focus transfers to the feature dancer; supporting dancers gesture subtly without cloning the lead's lip movements. V384 and V385 continue to control the actual mouth animation.
- **Lead handoff:** a smooth short two-person reaction uses the same real lyric timestamps as V385/V376. The existing V377 camera smoothing/shot hold is reused.
- **Common hook:** all manually assigned singers retain simultaneous lip-sync; the automatic camera suggests a wide group shot. The stage lights remain broadly focused rather than selecting one singer.
- **Lighting:** with stage-reactive lighting, no saved timeline and no authored show lighting, V386 applies a bounded gain of up to 12% for main lights and 16% for beams; the existing spotlight can ease toward an actual visible stage-slot anchor. No new shadow, light or postprocessing passes are allocated.

## Architecture

- `components/visualizer/expressiveConcertDirectorV386.ts`: stateless, clock-driven cue resolution; capped additive pose overlay; optional light gain. Source priority: valid V385 line casting first, V376 automatic duet second.
- `components/visualizer/ThreeAvatar.tsx`: the same shared V386 mutable frame ref feeds procedural and GLB rig body overlays. Authored choreography/clip priority inhibits the overlay.
- `components/visualizer/StageCameraDirectorV289.tsx`: optional shot hints join the existing V377/V378 camera pipeline, retaining saved presets, keyframes, live editing, tracking and lyrics composition protections.
- `components/visualizer/DynamicStage.tsx`: conditional light accents and stage-anchor steering; older lighting cues override V386 and the extra planner is skipped while V386 lighting is off.
- `components/visualizer/VocalSyncInspectorV373.tsx`: preview of moment/lead/backing/camera and intensity, without controlling Spotify playback.
- Preferences in `types/music.ts`, `context/UiPreferencesContext.tsx`, `VisualizerStage.tsx` and `SettingsPanel.tsx`.

## Safety and limitations

- A "singer" means a **visually assigned stage role**, not speaker diarization, isolated Spotify audio, phoneme recognition or voice identification.
- No invented song moments: when lyrics are missing, paused, outside the saved lyric line, a single dancer is configured, or reduced motion is on, the V386 stage cues are inactive.
- Explicit user choreography, authored camera paths, manual camera modes and saved lighting cues retain priority. No GLB mixer resets, retargeting changes, IK modifications or individual performer audio tracks.
- Lighting follows existing stage roots where available, and stays at its original behavior if an anchor is absent.

## Verification

- `npm run check:syntax`: 514 TypeScript / TSX sources checked.
- `npm run test:v386`: deterministic cue, ducked reactions, duet/feature/hook, manual/reduced motion priority, bounds and UI wiring.
- `npm run verify:offline`: 127 test commands completed successfully in a parallel local runner.
- `npm run build:preflight`: **BLOCKED** (16/17 npm dependencies unavailable; no package lock). A complete semantic TypeScript typecheck and Next.js production build were **not verified**. Local setup: `npm install && npm run verify`.
