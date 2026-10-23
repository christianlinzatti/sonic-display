# Sonic Display V319 — Advanced Motion Timeline Studio

## Summary

V319 builds on the existing multi-track Motion Timeline Studio (V105/V110) and on the opt-in JSON import from V318. It adds a pointer-editable music ruler, non-destructive clip movement, left/right trims, crossfade handles, keyboard nudging, a real shared-time 3D clip preview, and opt-in absolute song-clock playback in the existing `ThreeAvatar` timeline mode.

No request is sent to the private Spotify `spclient` host. Track-analysis markers are loaded only from V318's track-scoped, manually imported, locally cached JSON. When only bars are imported, the bar ruler uses actual imported bars and the beat ruler is explicitly marked BPM-derived. When no markers are available, both grids are BPM-derived. Unlabeled section boundaries are never assigned imaginary song-phase names.

## Where to find it

1. Open **Settings → Avatar → Motion Timeline Studio** (the existing sequence editor). The music-aligned timeline is embedded in the same editor, not a separate competing timeline.
2. If available, import track analysis first through **Settings → Dynamic Stage → Smart Stage Director → Unified Track Analysis V318**.
3. Choose snapping **Off / Beat / Bar**; drag clips, trim their turquoise edges, and move the yellow fade handles.
4. Use the play/pause controls and the **Synchronisierte 3D-Vorschau** checkbox for scrubbing an imported GLB clip. The 3D preview samples the same `timelineWeights` and `timelinePosition` calculations as the live sequence.
5. To align the active live timeline to the current Spotify song rather than the legacy local playback clock, explicitly enable **Timeline an aktuelle Songposition binden** and **Timeline live statt Smart Dance Director/Choreografie abspielen**. The former stores the current track ID so the wrong track never inherits its playback positions.

## Source files

- `components/visualizer/musicMotionTimelineV319.ts` — isolated pure functions: grid selection, quantization, clip edits, and guarded song-clock resolution.
- `components/visualizer/MusicAlignedTimelineEditorV319.tsx` — visual tracks, import-driven markers, mouse/touch resizing, crossfade handles, keyboard edits, optional track binding.
- `components/visualizer/MotionTimelinePreview3DV319.tsx` — independent Three.js skeleton clone with optional retargeted external GLB and frame-accurate manual clip sampling from a common UI playhead. Preview simulation, not Spotify PCM playback.
- `components/visualizer/MotionTimelineStudio.tsx` — retains old clip fields, import/export, timeline editing, live controls and optional preview.
- `components/visualizer/motionTimelineEngine.ts` — backward-compatible new optional `songSync`, `trackId`, `snapMode` fields.
- `components/visualizer/ThreeAvatar.tsx` — when opted-in, uses the *song position* to resolve timeline segments and action time; otherwise the old local timeline clock remains unchanged.
- `tests/v319-music-motion-timeline-regression.cjs` — pure logic, track mismatch, beat/bar fallback, trim and transition, integration tests.

## Limitations

- Imported analysis is per track, while the legacy timeline configuration is still a single active user preference; when attached to a track the active timeline is explicitly guarded by track ID. A multi-track timeline library is a separate potential future feature.
- The relative start/end of the original GLB animation is not trimmed or rewritten; editing clips in V319 edits only their **sequence window**. Keyframes within a GLB asset remain untouched.
- Imported `sections` without explicit labels are shown only as unlabeled boundaries. Section classification must come from existing live analysis.
- 3D preview is approximate in the sense that not every live dance/lighting effect is rendered, but imported clips and timeline fade weights use the same core timing calculations.
- GLB retargeting depends on the available rig and animation. A `modelUrl` is necessary for the 3D preview.
- The BPM-only fallback provides musical spacing, not detected physical onsets.

## Verification

- `npm run verify:offline`: offline source syntax and regression suite up to V319.
- `tsc -p tsconfig.v319-core.json`: isolated strict core TypeScript typecheck without the project npm installation.
- `npm run build:preflight`: reports missing Next.js/React/Three.js dependencies in the execution environment. A full Next.js compile and browser verification remain **unverified**.

On the user's workstation, run `npm install && npm run verify` to complete the full build.
