# V466 – Real GLB Concert Quality Inspector

## Live user workflow

Run Sonic Display, switch to the **Avatar** visualizer, start a song and press the small **QA** button in the upper-right of the live 3D stage. The button toggles a panel showing:

- **Actual render metrics** (FPS, P95 frame time, draw calls and triangle counts) reused from `AdaptivePerformanceController`, with a five-second freshness cutoff.
- **Projected head anchor counts** from the current R3F/Three.js scene and **current camera**, 1–4 performers. Where a matching *Head* bone exists, its actual world position is used; otherwise a dashed marker indicates an estimated head height. A model with no meshes is explicitly reported as not loaded.
- **Active immersive lyric DOM rectangle**, read with `getBoundingClientRect` (not a static guessed lyrics region). A projected head point inside this area is an **overlap warning**.
- **Warnings and source limits** without trying to automatically change the scene, clips, camera, rendering budget, singing roles or saved settings.

The QA panel is opt-in, not an additional show setting. It is inactive until clicked; closing it resets all transient samples. It samples no more than once per second *while open*, with no extra FPS controller, microphone, network, file writes or persistent recording. Switching songs or encountering a WebGL loss resets QA samples. No additional GPU lights, Canvas or extra render passes are used.

## Exactly what is measured — and what is not

| Shown | Method | Limit |
| --- | --- | --- |
| FPS / P95 / draw calls / triangles | Existing V218/V253 WebGL render statistics | Not GPU execution time or GPU utilization; numbers can be stale if Canvas stops rendering |
| Head in frame | World-space head bone when named `Head`/`mixamorigHead`; projected by live camera | **A projected head is not proof of a visible face**; other 3D objects, haze, clipping, face orientation and lighting can still obscure it |
| Estimated head position | Fallback offset above real avatar root when no head bone found | Approximate; dashed yellow marker; rig scales/geometry can differ |
| Lyrics overlap | Bounding rectangle of active immersive lyric line and projected head point | Geometric proximity only, not optical pixels; for other text modes marked unavailable |
| Lyrics rectangle outside WebGL area | DOM rectangle intersection comparison | Some deliberate split-screen layouts can extend beyond the Canvas without being wrong; warning is informational |
| Render status thresholds | <25 FPS = issue, 25–44 = watch, >=45 = OK | Diagnostic classification, **not** a measured Raspberry Pi performance target |

This inspector does **not** recognize a vocalist or actual word timings, verify lip sync, detect genuine photometric visibility, sample GPU memory, or measure device throttling. It does not silently change animation or manual edits.

## Reproducible checks

```powershell
npm install
npm run test:v466
npm run verify:v466
npm run typecheck
npm run build
```

A separate **layout-only** Chromium fixture uses the real CSS and a simulated QA panel at three viewport sizes:

```powershell
python -m pip install playwright
python -m playwright install chromium
python scripts/v466-live-concert-quality-smoke.py --fixture --screenshots v466-fixture-screenshots
```

Once the Next.js app is running with **your installed GLB rig(s)**, open the local browser with `--headed`, connect Spotify, activate avatar mode, then run:

```powershell
python scripts/v466-live-concert-quality-smoke.py --url http://127.0.0.1:3000 --headed --seconds 30 --screenshots v466-live-screenshots
```

The script checks the panel's DOM geometry and captures browser screenshots. Real FPS requires the application to be playing a song and the QA panel to be open. Inspect the actual avatar silhouettes, animation, face orientation, occlusions, Lyrics and FPS over a longer session by eye. **The release-build environment did not have the user's GLBs, working Spotify credentials, or Raspberry Pi hardware.**

## Changes relative to V465

- `services/show/concertQualityInspectorV466.ts`: pure, bounded assessment of view, FPS and lyrics overlap.
- `components/visualizer/concertQualityStoreV466.ts`: opt-in live snapshot with `useSyncExternalStore`, no growing history.
- `components/visualizer/ConcertQualityProbeV466.tsx`: actual scene head-anchor projection and browser rectangles.
- `components/visualizer/ConcertQualityInspectorV466.tsx`: accessible QA control, warnings and markers.
- `components/visualizer/ThreeAvatar.tsx`: optional probe and UI integrated into the live avatar canvas, resets on song change and WebGL faults.
- `app/globals.css`: small, responsive opt-in QA panel and markers.
- `tests/v466-real-concert-quality-regression.cjs`, `tests/tsconfig.v466-core.json`, `tests/fixtures/v466-inspector-layout.html`, `scripts/v466-live-concert-quality-smoke.py`.
- Existing V465 and earlier functionality preserved; V465's version assertion accepts the new minor project release.
