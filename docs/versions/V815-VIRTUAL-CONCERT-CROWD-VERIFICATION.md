# V815 — Virtual Concert Crowd

## Delivered
- Built on Sonic Display V814, keeps V810–V814 in place. One additional V815 crowd planner consumes the existing **verified** music/section cue. Pauses, unknown sections, blackouts, authored lighting timelines, reduced motion, and low performance tier suppress the crowd.
- `components/visualizer/virtualConcertCrowdPlannerV815.ts`: deterministic pure crowd planner and symmetric wing layout. Capped at 72 people; count/animation/light levels scale with genre, validated section, beat/energy, quality mode, device tier, and lyric/face visibility.
- `components/visualizer/VirtualConcertCrowdV815.tsx`: a shared geometry/material **three-InstancedMesh** renderer (body, head, optional mobile phone). No shadowed lighting or full GLB avatars in the crowd; deterministic 20 Hz matrix update cap. Side wings only, center stage stays clear. Not a full arena simulation.
- `DynamicStage.tsx`: same verified V810 timeline owner; optional crowd can be controlled independently of laser, LED and haze. Performance pressure factor uses the existing V640 LED decor budget.
- `ConcertFxStudioV810.tsx`: crowd activation, phones, reaction intensity, density, and schematic preview.
- Backward-compatible settings normalization with reasonable V815 defaults, including migration for prior V814 backups.

## Verification performed
- PASS: `npm run test:v815` (15 checks covering musical gating, invalid input fail-closed, lyric/cast reduction, quality, deterministic layout and render integration).
- PASS: `npm run test:v815:types` (isolated planner TypeScript)
- PASS: `npm run test:v810:types` (settings/planner isolated TypeScript)
- PASS: `npm run test:v810` to `test:v814`, and `test:v800` through `test:v809` after updating outdated version-range assertions.
- PASS: parser validation of five changed TypeScript/TSX files.
- NOT VERIFIED: complete project `npm run typecheck` and `npm run build`, full `check:syntax` and `check:architecture`, GPU performance, screenshots/visual acceptance with genuine GLB performers. This environment has no complete `node_modules` and the earlier offline npm install failed (missing cached `zustand@5.0.16`). Full-project TypeScript and source-scan attempts timed out, so none are reported as passed.

## Local acceptance commands
```sh
npm ci
npm run test:v815
npm run test:v815:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Inspect four performers, camera zoom, lyrics & sync; test all three quality profiles and intentional blackouts; measure FPS, renderer calls, geometry/triangles and memory before releasing. This version remains **not production-validated**.
