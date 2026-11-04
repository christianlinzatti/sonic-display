# V562 – Verification report (25.10.2026)

## Passed

- `npm run test:v562`: **29/29** deterministic focused regression checks (opt-in/no-op, mouth geometry bounds, lip seal, competing vowels, non-finite inputs, disabled/partial jaw bones, previews, profile import/export and compatibility).
- `npm run test:v562:types`: TypeScript targeted checks passed.
- `npm run verify:v562`: complete V562 → V554 targeted regression chain and TypeScript checks passed; architecture + source syntax passed.
- `npm run test:v383`: legacy facial profile / morph-target regression passed. Old test was updated only to accept future package versions rather than a fixed allowlist. Legacy README link kept.
- `npm run test:v424`: geometry calibration, manual mapping precedence, persistent avatar ID passed.
- `npm run test:v551`: 12,150 stage/lighting case checks passed.
- `npm run test:v552`: 43,200 Raspberry Pi render-budget deterministic cases passed.
- `npm run test:v553`: nine release-validation fixture checks passed.
- `npm run check:syntax`: 784 TS/TSX source files passed.
- `npm run check:architecture`: 335 current source references, 10 architecture sections passed.

## Remaining / limitations

- `node_modules` unavailable: no complete `tsc --noEmit` project typecheck or `next build`, only the explicitly listed targeted TypeScript checks.
- No live GLB WebGL rendering capture, browser interaction test, measured frame-rate, or real Raspberry Pi hardware verification.
- Mouth settings are safe synthetic pose post-processing, not a model-specific anatomical rig calibration, source-separated vocals, real phoneme detection or automatic word-to-phoneme alignment.
- The opt-in controller adds no new rendering pass/spotlight/shadowmap or timer, but a few extra scalar operations per animated frame when enabled.
