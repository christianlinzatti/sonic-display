# V599 – Verification (26.10.2026)

- Release base: complete V598 source tree; package release `0.1.0-v599`.
- V599 planner: `components/visualizer/featureDuetPerformanceV599.ts`.
- Both live stage variants are already using the augmented existing `planIntelligentRapDuetV500` chain. No new avatar mixers or render loops.
- New tests: `tests/v599-feature-duet-performance-regression.cjs` and isolated type compilation `tests/tsconfig.v599-core.json`.
- Commands and outcomes are recorded in the local verification log. Do not conflate deterministic tests with a WebGL visual inspection.
- Full `npm run build` needs installed Node dependencies and a valid run environment; here `node_modules` is not present. Raspberry Pi and Spotify live visual tests remain outstanding.

## Verified locally

| Test | Result |
| --- | --- |
| `npm run test:v599` | PASS — 27 test groups, 100,000 deterministic song-time samples |
| `npm run test:v599:types` | PASS — isolated TypeScript type compilation |
| `npm run test:smoke:v599` | PASS — includes V598/V597, V584/V585/V500 and architecture |
| `npm run verify:v599` | PASS — additionally V596/V572/V589 and source syntax/import scan |
| `npm run check:syntax` | PASS — 824 TS/TSX files |
| `npm run test:v416`, `test:v496`, `test:v498`, `test:v499`, `test:v547` | PASS — editorial and timecoded vocal roles |
| `npm run test:v460`, `test:v475` | PASS — existing feature / 3+ avatar group interactions |
| `npm run build` / real-browser GLB & Spotify / Raspberry Pi | NOT EXECUTED — installed Next.js dependencies and real GLB/Spotify/hardware unavailable |

The 27 V599 groups cover the actual in-line V416 reply threshold and the timestamped V496 cue boundary, not automatically detected singers. V599 never touches GLB motion binaries.
