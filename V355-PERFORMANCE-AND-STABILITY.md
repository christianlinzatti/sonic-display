# V355 – Performance & Stability

Basis: **V354 – Show Timeline Editor**. This is a long-session safeguard for the **existing** WebGL stage, not a second render engine and not a hardware benchmark certification.

## New behavior

- One monitoring interval **every 5 s**, reusing the existing V253/V254 `renderDiagnostics` FPS and p95 frame-time samples. No extra Canvas or animation clocks.
- **Three consecutive bad windows** are required for an initial step down; further steps are subject to a 20 s cooldown. Recovery takes **at least nine good windows** and **90 s since the last change**. Quality rises one step at a time.
- Stage-optional assets are throttled at two protection levels: particle count/opacity, shader strength, glow and DanceFX intensity. At the same time, the existing V253/V254 adaptive resolution gains an additional upper bound. Existing animation, audio/microphone, Spotify position, GLB mixer timing, lyrics, photo visibility, camera safety and authored V354 cues are not modified.
- Target thresholds depend on a **heuristic browser/device profile**: desktop (55 FPS target), compact coarse-pointer display (45 FPS) and Linux ARM / Raspberry Pi hint (30 FPS). Hardware and physical diagonal **cannot be reliably detected from a web page**; explicit manual choice is supported.
- Profiles: Auto / 10-inch touch display / Raspberry Pi / desktop. Stored in browser localStorage; selectable under **Settings → Diagnostics → V355 Performance & Stability** (also in audio/dance diagnostics).
- Optional JS heap-pressure guard only when the browser provides `performance.memory.usedJSHeapSize` and `jsHeapSizeLimit`. It is *not* GPU-memory monitoring and cannot prove or eliminate leaks.
- Hidden/inactive tabs, stale or incomplete FPS readings and manual render-quality mode do **not** trigger downgrades. The monitor stops when the main 3D stage unmounts, and its bounded intervention history (20 entries) is in memory only.
- A reset button clears the current observation state and history. Disabling the V355 guard restores the original V253/V254 adaptive quality controller's authority (and removes the V355 DPR ceiling).

## Files

- `services/monitoring/performanceStabilityV355.ts`: pure policy, settings sanitizer/storage and subscription store.
- `components/visualizer/LongRunStabilityV355.tsx`: sampler and interactive diagnostics/settings.
- `components/visualizer/adaptivePerformance.tsx`: supplemental V355 auto-mode DPR ceiling, without resetting V253/254 internal decisions.
- `components/visualizer/ThreeAvatar.tsx`: single monitor on live stage and effect intensity cap applied *after* V351–V354 priorities.
- `components/SettingsPanel.tsx`, `components/visualizer/DanceDiagnosticsPanel.tsx`: V355 settings access.
- `tests/v355-performance-stability-regression.cjs`: deterministic policy and integration tests.

## Testing

- `npm run test:v355` – deterministic no-network behavior and wiring tests.
- `npm run verify:offline` – existing 98 command regression suite, including V350–V355.
- `npm run build:preflight` – lists missing dependencies.
- `npm run verify` – full local build, requires npm dependencies.

This release has passed the 98/98 offline regression commands and 455 TS/TSX *syntactic* checks. **Next.js production build and full TypeScript semantic checking are NOT verified here:** the supplied archive lacks the npm dependencies and package lock. The global `tsc` reports missing React/Next/Three typings and related dependent diagnostics. This is not the same as a clean production build.

To verify on a development computer:

```bash
npm install
npm run test:v355
npm run verify
```

## Known limits

Browser APIs cannot measure GPU temperature, precise GPU utilization, actual screen size in inches or device physical memory reliably. The FPS policy offers safeguards, not guaranteed frame rate. No automated long-running hardware soak test was available. V355 does not reduce the number of loaded avatars or unload their GLB assets; existing avatar LOD and workload scheduling remain responsible for that.
