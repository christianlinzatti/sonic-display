# V402 – Unified Concert Show Director

- Based on V401, additive only. Integrated in the existing VisualizerStage with no new canvases, meshes, workers or API calls.
- Single song-progress-driven section clock with 320 ms confirmation, easing, seek/track reset; bounded musical intensity with low/balanced/high performance tiers.
- V402 section confirmation feeds both V387 and V394 so lighting/camera share the same stabilized song section when V396 is not active. Section and genre coordinated for V387 concert lights/camera, V394 electronic festival lighting, V392 group choreography and V393 lyrics-timed vocal gestures through existing V396 compatibility logic.
- User-selected existing show, festival, ensemble and vocal modes retain priority; active V396 coordination also has priority over V402 fallbacks. V400 authored camera frames, V354 authored light/dance timelines, V385 vocalist assignments, V401 vocal framing safety and lyrics-protected regions retain existing ownership.
- User can separately disable camera, lighting/atmosphere, dance and vocal auto-coordination, and set overall intensity. All V402 settings default to OFF for no changes to V401 behavior. No strobes, new laser assets, singer diarization or speech recognition.
- V402 uses the already-existing R3F renderer and performance measurements. Real-world FPS not benchmarked.

## Setup

In **Einstellungen → Avatar tuning → V402 · Unified Concert Show Director**, choose Aus / Ausgewogen / Festival and adjust strength and category checkboxes. For existing hand-authored content, leave V402 off or keep manually-authored settings enabled, which take precedence.

## Verification

Run `npm install`, then `npm run verify` on the target machine. Offline tests and syntax checks are not equivalent to a typecheck or Next.js production build.
