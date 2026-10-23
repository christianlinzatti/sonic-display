# V466 – Verification and limitations

## Completed

- `npm run test:v466`: **pass**; real scene/projector wiring, live lyrics DOM geometry, limits and warnings, renderer freshness, boundaries (1–4 avatars), not-loaded GLB mesh guard, deterministic 30-minute logic stress test and isolated TS compile.
- `npm run verify:v466`: **pass**; targeted regression tests V441, V446, V451, V455–V465; source import integrity, module casing, TypeScript/TSX parser checks.
- Browser fixture: **pass**, Chromium 800×480, 1024×600, 1280×800 with actual project CSS. Panel stays within stage boundary and UI control opens. Screenshots use **fake FPS and placeholder stage only**, not real GLB, WebGL or Spotify.
- ZIP integrity and comparison with V465: check after packaging.

## Not completed — do not infer a passing production build or actual GPU measurement

- `npm run typecheck` and `npm run build` **with all project dependencies installed**: no npm modules available in the offline container; npm registry cannot be reached. The new pure assessment module passed isolated `tsc`. This is not equivalent to whole-project type safety.
- Real React/R3F/Next.js stage with imported user GLB models, Spotify playback and headset/head rotations: **not run**. Bone naming may vary; fallback estimates are marked.
- Real Pi 4/5 hardware, actual GPU thermal metrics and a multi-hour concert: **not measured**.
- Chromium fixture shows layout only and never establishes avatar face visibility or actual FPS.

## Acceptance steps on Windows/Raspberry Pi

1. Extract this full release, run `npm install`, `npm run verify:v466`, `npm run typecheck`, `npm run build`.
2. Run `npm run dev -- --hostname 127.0.0.1` (or the production service), sign into Spotify, import representative GLB avatars, enable avatar stage.
3. Click **QA** on the real stage, observe FPS + P95 during solo, duo and 4-avatar performance, rapid lyrics and camera moves; check which projected head markers are solid (identified bone) or dashed (estimates).
4. Verify manual vocal/keyframes/lighting stay untouched; use the visual screen for actual face illumination/occlusion.
5. Run browser QA against a running local instance with `scripts/v466-live-concert-quality-smoke.py --url http://127.0.0.1:3000 --headed --seconds 30`.
6. Test song switching, background-tab return and several hours of sustained playback on the real Pi; record actual device temperatures and hardware behavior separately.
