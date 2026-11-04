# V626 – Adaptive 3D Concert Performance & Benchmarking

## Purpose
Real live-main-canvas sizing baseline on a **currently available PC**, before any Raspberry Pi or mini-PC purchase. Reuses V518's once-per-second observation and V522's 5 s warmup + 30/45/180 s runs, reporting 2/3/4 avatars under the same real rendering dimensions, DPR, features and quality settings. No new GPU queries, geometry, animation loops, network calls, automatic device changes or synthetic FPS.

## Workflow
1. On Windows, open Settings > Concert Performance Studio > V522/V626. Start playback of a known, repeatable song. Use the native canvas as close to the planned display pixel resolution as practical (physical 10-inch size cannot be verified from pixels).
2. Set genre scene, FPS target, auto-quality off / stable quality, lyrics, lip-sync and lights. Record the scene/OS/browser/power plan in the notes field.
3. Select **2 real GLB performers** in the existing settings; start V522 benchmark three times. Keep the same song passage and camera. Repeat three times with **3** and **4** GLBs. All runs reuse the existing renderer's observed 1-second windows. Changing actual canvas size within a run invalidates it.
4. Review FPS, minimum, worst per-window P95/P99, slow %, draw calls and tris. Export V626 JSON. Repeat at different quality settings and target resolutions separately.
5. **Only after** comparing candidate hardware measured under the same workload can one reasonably pick a Pi or mini-PC. Windows browser FPS is *not* a hardware performance forecast.

## Important limits
- The browser provides frame timing, GL draw-call / triangle counts and optionally Chromium JS heap; *not* GPU utilization, GPU frame time, total RAM, VRAM, temperature, wattage or throttling.
- Worst one-second-window P95/P99 are not pooled-frame quantiles.
- Browser identifiers, refresh caps, background tabs, other programs, different music sections and thermal state can confound results.
- V626 never silently applies a new quality tier, infers a Pi model, or claims a new device passed.
- V522/V553 previous release gates and operator-confirmed visual checks remain independently valid.

## Tests
`npm run test:smoke:v626`; `npm run verify:v626`; `npx tsc --noEmit`; `npm run build` (latter two on a workstation with node_modules).
