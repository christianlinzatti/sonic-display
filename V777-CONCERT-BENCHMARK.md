# Sonic Display V777 — GLB concert benchmark (measured, not simulated FPS)

V777 supplements (not replaces) the V776 **static stage** benchmark with an opt-in *concert-like* single-canvas test. It runs three existing stages (Cyberpunk, Rock, Galaxy), first with **2** then **4 actual GLB avatars**. Each cloned GLB has its own `AnimationMixer` and applies a deterministic synthetic vocal envelope to a named `mouthOpen`, `jaw`, or `viseme` morph target. It also uses the real `DynamicStage`, `StageEnvironment`, and instanced `DanceFX` components (V774), plus live 3D text from Drei. Three.js `renderer.info` and delivered frame timing supply real measurements: FPS, P95 ms, Draw Calls, triangles, geometries, textures and shader-program counts. A single WebGL canvas runs at 960 × 540, DPR 1, antialias off, shadows off. All performers share cached GLB assets but have private skeletons; only private skeletons are disposed upon unmount. NO separate renderer or motion interval is created.

**Scope and limits:** This is not the production Spotify concert pipeline: beat and vocal envelopes and the displayed lyrics are deterministic synthetic inputs, *not* real microphone/Spotify/Musixmatch data or the full app's retargeting/verse-to-hook director. The bundled reference `.glb` is only **38 KB**, about **1,100 triangles** and uses three bones, one dance clip and one mouth morph. It verifies pipeline functionality but cannot predict performance of complex production avatars. For a meaningful hardware comparison use your own high-detail rigs. A URL must be **same-origin, local path**, and its GLB must have skinned geometry, at least one animation clip and a named mouth/jaw/viseme morph. If any required feature is missing, the test deliberately returns `blocked` rather than silently simulating unsupported lip sync.

The benchmark works only on `localhost` / `127.0.0.1` with `?concertBenchV777=1`. It is independent of account login and does not store or transmit microphone, Spotify, credentials, or song history. Files are fetched from the local Next.js server for SHA-256 verification. No real song audio is played.

## One version: local real-browser benchmark

From your V777 checkout, install dependencies and create a production build:

```sh
npm ci
npm run typecheck
npm run build
npm run start
```

In another terminal, with a current Chromium/Chrome executable accessible as `chromium` or `--chromium=...`:

```sh
npm run benchmark:v777:browser -- --url=http://127.0.0.1:3000 --label=V777 --out=artifacts/v777/after.json
```

By default this uses the included *reference GLB* for 2 or 4 identical performers. For representative results, put your own GLB(s) (including embedded animations and mouth morphs) into the project's `public/benchmark/` directory, then run:

```sh
npm run benchmark:v777:browser -- --url=http://127.0.0.1:3000 --glb=/benchmark/my-animated-performer.glb --label=V777-own-rig --out=artifacts/v777/after.json
```

Optional second GLB `--glb2=/benchmark/second-performer.glb` alternates between the two models. For Windows specify `--chromium="C:\Program Files\Google\Chrome\Application\chrome.exe"` if needed. Options `--frames=180 --warmup=60 --passes=2` are accepted; keep them the same for every comparable run. `--software` deliberately uses SwiftShader, **not** real GPU performance. Browser measurement requires an already running **production** Next.js server; otherwise it generates an explicit `blocked` report, never invented FPS.

## Apples-to-apples: V776 vs V777

Use two separate checkouts. In the **V777** checkout, copy only the identical benchmark fixture to **V774–V776** (one-time, refuses overwrite):

```sh
node scripts/v777-install-concert-harness.cjs --target="C:\sonic-display-v776"
```

This copies the V777 benchmark component, independent metrics module, diagnostics page and reference GLB. It does **not** alter baseline `DanceFX`, GLB runtime, stage source, package version or dependency lock. Start the baseline server at port 3001 and candidate at 3000. Use identical own GLB file bytes in both public folders when measuring your actual rigs:

```sh
npm run benchmark:v777:browser -- --url=http://127.0.0.1:3001 --glb=/benchmark/my-animated-performer.glb --label=V776 --out=artifacts/v777/before.json
npm run benchmark:v777:browser -- --url=http://127.0.0.1:3000 --glb=/benchmark/my-animated-performer.glb --label=V777 --out=artifacts/v777/after.json
npm run benchmark:v777:compare -- --before=artifacts/v777/before.json --after=artifacts/v777/after.json
```

If using bundled reference GLB, omit `--glb` from **both** runs. The comparer checks SHA-256 of every GLB, lengths, rig feature counts, browser user agent, renderer string, viewport, DPR, software-vs-hardware, resolution settings, sample counts and fixture ID; if they differ, output is **incompatible** with nonzero exit code rather than a false benchmark improvement. Asset paths can differ if the content hashes match. Alternating baseline/candidate run order across multiple passes helps reduce thermal/browser noise.

For estimated Raspberry Pi requirements, evaluate several real assets at desired final display resolution and include the production application separately. 960 × 540 on desktop may not represent the final 10-inch display; this benchmark is primarily for comparing releases, not buying a Pi based on a single run.

## Tests

`npm run test:v777` verifies report aggregation, P95, six permutations, invalid frames/context loss, strict compatibility, GLB magic and rig/morph metadata, command wiring, and safe backport. `npm run test:v777:types` type-checks the pure metrics module. `npm run verify:v777:static` also runs earlier V776 and code syntax/architecture/lockfile/Windows-case checks. Full `npm run typecheck`, `npm run build`, and actual browser FPS must still be tested with full dependencies and a local browser; no hardware speedup was asserted while implementing V777.
