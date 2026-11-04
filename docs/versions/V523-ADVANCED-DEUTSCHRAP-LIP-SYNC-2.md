# V523 – Advanced Deutschrap Lip-Sync 2.0

Builds on the full published V522 zip. The V523 `advancedDeutschrapLipSyncV523.ts` pure refinement improves *illustrative* close-range rap-word movement using **existing, verified word timings**. For proven dense runs of short words it adds a very small, smooth jaw and expression carry-through. Coarticulation toward a next verified word is suppressed before B/P/M onsets; existing lip closures are never reduced. A restrained phrase head cue is limited to non-authored body animation. The existing `VocalRigV368` owns both GLB morph-target and jaw-bone driving; V523 refines its **input pose**, without creating a competing jaw overlay.

- No fabricated phoneme timestamps, vocal stems, voice isolation or singer inference.
- Manual V420 edits, V423 audio-derived poses, V385 / V496 singer roles, accessibility reduced motion, and imported choreography always have priority.
- Uses the existing per-frame pipeline: no new render loop, worker, dependency or saved settings.
- Integrates with both procedural and GLB avatar paths; protected clips remain unmodified.
- The following **V524 Natural Full-Body Dance 3.0**, then **V525 Cinematic Lyrics 6.0** remain prioritized.

## Local checks
`npm install` then `npm run test:v523 && npm run test:v523:types && npm run build`.

The V523 regression checks both GLB morph-target and procedural integration. Real face-rig compatibility, all-assets production builds and actual raspberry-pi visuals must be validated on an environment with dependencies, actual GLB characters and the display.
