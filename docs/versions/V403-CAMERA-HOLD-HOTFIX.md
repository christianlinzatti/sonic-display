# V403 – Camera hold and CSS hotfix

- Corrected `clamp` call in `visualPerformanceDirectorV397.ts`: 3 arguments instead of 4.
- Preserves the intended 1150 ms fallback for non-finite durations, and clamps valid durations to 450–2400 ms.
- Added behavior cases in V397 regression and a dedicated `npm run test:camera-hold` check, run by offline verification and build preflight.
- Replaced flex alignment `start`/`end` with `flex-start`/`flex-end` in `app/globals.css` where relevant to the autoprefixer warnings.
- Full Next.js build requires dependencies; run `npm install && npm run build` locally.
