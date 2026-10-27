# V540 – Cinematic Concert Camera 3.0

An existing-camera, viewport-aware composition pass, placed **after** verified V528 singer focus and **before** the V351 lyrics safety guard in `StageCameraDirectorV289`.

- Uses **real, visible V377 avatar roots** and V528 track-verified vocal assignments to frame lead performances, outgoing/next singer handoffs and group hooks (2–4 singers).
- Adjusts target, camera distance and a bounded field-of-view, considering live aspect ratio and left/right lyrics regions. Refuses framing that increases estimated visible-subject overlap.
- Manual live camera edits, presets, authored show/keyframe/timeline cues and stage-manual choreography always win. Unverified singer attribution or missing/invalid roots fail closed.
- Provides a pure `measureScreenFrameV540` diagnostic, useful for regression tests across 16:9, 16:10 and 9:16 viewports.
- No new Canvas, no additional frame callback, no new downloads and no changes to GLBs, motion libraries, or vocal identification.

**Limits:** This is a heuristic on stage-root positions and assumed horizontal body margins, not an image-based occlusion guarantee. Full browser WebGL rendering, Raspberry Pi visual testing, and complete Next production build still require installed dependencies and a real browser.

## Validation

- `npm run test:v540` (8,640 deterministic viewport/cast scenarios, including lyric-side reservations, roles, seek guards and priority)
- `npm run test:v540:types` (isolated pure camera TypeScript check)
- Regression tests V526–V539, source syntax and architecture checks.
- Older camera tests V289/V297/V298/V305/V378/V387/V398/V399/V404/V429/V454/V497 are **already failing on the V539 baseline** due to outdated source-shape expectations and were not claimed as newly passing.
- Real browser/WebGL comparison and full Next.js production build not run here because Next/React/Three dependencies are unavailable.
