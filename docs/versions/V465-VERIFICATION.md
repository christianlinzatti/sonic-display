# V465 – verification evidence

### Completed

- `npm run test:v465`: pass (V465 behavior, deterministic 30-minute loop, TypeScript isolation).
- `npm run verify:v465`: pass; V455–V464 regressions, original V441 stage-name rules, V446 song cue, V451 visual priorities, syntax, import and module case checks.
- Repository checks: 632 TS/TSX files, 1,008 project files, 2,237 imports, 0 case-insensitive source module collisions.
- **Chromium browser fixture**: pass, 3 screen sizes × 2 lyrics sides, real CSS layout, no overlay outside the stage. Fixture contains static rectangles, NOT GLB models or a running Spotify app. See `tests/fixtures/v465-visual-layout.html` and `scripts/v465-browser-quality-smoke.py`.
- Deterministic 30-minute simulation of label-plan decisions: pass; no saved settings or user assignments modified. Simulation is not a real 30-minute 3D rendering run.

### Not completed

- Full `npm run typecheck` (project-wide): attempted, cannot complete because React/Next and other npm dependencies are absent. Reported missing imports and types should not be interpreted as isolated V465 errors.
- Full `npm run build`: attempted, but script invokes a very long `prebuild` chain and was interrupted; offline dependency installation fails with `ENOTCACHED`, and npm registry DNS is unavailable. No passing production build claimed.
- Live browser with real 3D GLB avatars, Spotify playback and real user configuration: not executed.
- Physical Raspberry Pi FPS, GPU memory, throttling, 2–4 avatar geometry occlusion and multi-hour stability: not measured.

### Local commands

```powershell
npm install
npm run verify:v465
npm run typecheck
npm run build
python -m pip install playwright
python -m playwright install chromium
python scripts/v465-browser-quality-smoke.py --fixture --screenshots v465-fixture-images
```

A real acceptance run must follow, particularly for user-provided GLB rigs.
