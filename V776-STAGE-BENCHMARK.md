# Sonic Display V776 — reproducible stage benchmark (V766+ vs V776)

V776 provides a **real WebGL benchmark fixture** under `/diagnostics/stage-benchmark?stageBenchV776=1` (loopback only). It uses **the actual StageEnvironment implementations** (classic, galaxy, cyberpunk, white, rock, vaporwave) with two standard procedural actors in one 960 × 540 R3F Canvas (DPR=1, antialias off, 1 directional light, ambient). This intentionally does **not** cover the entire Concert/Spotify renderer, GLB retargeting, lyrics or live microphone input. It is an apples-to-apples *static stage* test for geometry/instancing changes. It does not isolate DanceFX or moving spotlights.

Every scene is run through **2 shader/cache warm-up passes**, then warmed for **60 frames** in each measured pass and sampled for **240 frames**, 2 measured passes. The first sampled frame after a scene transition is discarded. Data include delivered FPS from render-frame deltas, P95 frame time (milliseconds; lower is better), average GPU Draw Calls, triangles, and WebGL resource object counts (`renderer.info.memory`); these are **not VRAM bytes**, and browser-wide FPS is not a measured display-refresh-independent truth. Chromium headless or `--software` may be slower than the actual touchscreen. Use the **same exact browser executable, GPU, renderer, resolution, power mode and test flags**, preferably with the screen on and the tab visible. The comparison tool refuses different environments/configurations.

## One machine, two builds, same fixture

1. Extract the original baseline V766–V775 ZIP into a separate directory, and extract the new V776 ZIP into another directory. For an older baseline, from the **V776 project** run:

   `node scripts/v776-install-benchmark-harness.cjs --target="C:\sonic-baseline"`

   This copies *only 3 new files* (the same fixture/module/page) to the baseline. It will **not replace** existing files, packages or stage code; run once. For V776 or later, no installation is required. (The original V766–V775 source code and release version remain unchanged.)

2. In **both** project directories, run `npm ci`, `npm run typecheck`, `npm run build`. Fix build issues before benchmarking. Start the baseline with `npx next start -p 3001`; candidate with `npx next start -p 3000`. Keep both terminals running. Do **not** use `npm run dev` for final comparisons, because hot reloading/dev overhead affects measurements.

3. From the V776 directory, run both in the **same Chromium build**:

   ```sh
   npm run benchmark:v776:browser -- --url=http://127.0.0.1:3001 --label=V767-baseline --out=artifacts/v776/before.json
   npm run benchmark:v776:browser -- --url=http://127.0.0.1:3000 --label=V776-candidate --out=artifacts/v776/after.json
   npm run benchmark:v776:compare -- --before=artifacts/v776/before.json --after=artifacts/v776/after.json --out=artifacts/v776/compare.json
   ```

   For Windows, pass `--chromium="C:\Program Files\Google\Chrome\Application\chrome.exe"` to **both** browser runs if `chromium` is not on PATH. Pass `--software` **only** when you deliberately test SwiftShader, not for a real hardware FPS conclusion. `--frames=240 --warmup=60 --passes=2` are configurable but **must match**.

4. Inspect the generated JSON and the console table; for FPS, **higher** is better; P95, Draw Calls and triangles **lower** is better; positive resource count deltas may reflect intended resources/caches, not a proven leak. Run several pairs, ideally alternating baseline/candidate order, and compare their medians to reduce external noise.

The runner returns a `blocked` JSON when no server/Chromium/WebGL is available and exits nonzero; it never manufactures measurements. Comparison returns `incompatible` and exit code 2 for unequal renderer/browser/viewport/DPR/fixture/config or missing scene counts.

## Offline verification

`npm run test:v776` and `npm run test:v776:types` work without project npm dependencies if a global TypeScript compiler is installed. `npm run verify:v776:static` also performs the project source-syntax, architecture and lockfile checks.

**Unverified here:** full Next.js production build and real browser hardware comparison (no full npm dependency installation available in this execution environment). No numerical performance improvement can be claimed before running the browser suite.
