# V465 – Visual Show Quality & Real-World Validation

## Scope

This version is a deliberately small integration/QA release on top of V464, not a new GPU show engine. It improves crowded-stage readability and adds a **reproducible browser layout inspection tool**. The tool can inspect a local running app, but the current release was validated against a *static test fixture*, not live Spotify, real GLB models, or actual Raspberry Pi hardware.

### Visual priority for 3–4 avatars

`services/show/visualShowQualityV465.ts` composes the existing V441/V460 artist-name stage plans with V451's reliable synced-lyrics attention. With three/four visible artist credits and an active immersive lyric line, only the two most relevant *automatically inferred* stage name labels remain visible. During a visual duet reply, the two visual slots receive priority. A manually authored V416 stage arrangement and the user-selected **Always** label mode retain their original labels.

It makes **no assumption about who is actually singing**. The V459 lip sync, V460 stage cues, V461 lyric text/timestamps, V462 lighting, V463 quality controller and V464 drama remain unchanged. The algorithm stores nothing and runs without an extra animation loop or timer.

### Layout/browser smoke test

`tests/fixtures/v465-visual-layout.html` is a *layout-only fixture with static silhouettes*. The fixture includes the **actual `app/globals.css` styles**, lyrics overlay classes and a long German rap line. Run the optional Playwright/Chromium script:

```powershell
python -m pip install playwright
python -m playwright install chromium
python scripts/v465-browser-quality-smoke.py --fixture --output v465-layout-report.json --screenshots v465-layout-screenshots
```

The fixture checks **both lyrics sides**, at 1024×600, 800×480 and 1280×800 by default. It measures real DOM rectangles, checks that the lyrics overlay remains inside its stage, detects DOM overflow and can capture PNG snapshots. All six fixture combinations passed in the release environment. This is a useful regression baseline, **not proof that a real avatar face is unobscured**.

To inspect a locally running app with active immersive lyrics:

```powershell
# Start the application in a separate terminal, connect Spotify and choose immersive lyrics.
python scripts/v465-browser-quality-smoke.py --url http://127.0.0.1:3000 --headed --settle-ms 20000 --screenshots v465-live-qa
```

The optional `--headed` mode lets you interact with the local browser before measurements. A browser without visible immersive lyrics reports failure rather than a false pass. Never share a screenshot that reveals account details without checking its content first. Browser `requestAnimationFrame` timing in the report is **not WebGL GPU FPS**.

### Actual device acceptance test — still required

On the target Pi, run at least 30 minutes and preferably several hours with 1, 2 and 4 installed GLB models, synchronized and non-synchronized lyrics, alternating left/right lyrics, camera movement, and active stage lights. Measure device FPS, GPU memory/thermal throttling, GLB load and song-switch responsiveness. Inspect face visibility, gestures, mouth motion, name labels and line clipping manually. A headless DOM fixture cannot verify any of those 3D behaviors.

## Design constraints

- Never edit saved choreography, manual vocal assignments, camera keyframes or user lighting timelines.
- No new API, server, microphone use, external data collection, or mandatory setting.
- Do not claim artist recognition, real-word phoneme timing, or Pi FPS from simulated data.
