# Sonic Display V682 – Cinematic Camera Variety

The V655 natural-camera director already supplies vocalist-aware and V604-act-aware shots. V682 adds **non-repeating shot motifs** instead of inventing additional hard cuts or singers. This release remains inside the existing React Three Fiber camera pipeline.

## Features

- Five subtle motifs: centre, stage left, stage right, elevated crane, and wide frame.
- At least ~6.5–10.3 seconds of hold, depending on the verified shot type; a verified singer handoff may adjust sooner.
- Per-track short history avoids immediate and next-to-last motif repetition. Seeking backwards or changing tracks resets it.
- Smooth 1.5-second influence fade-in. The existing camera interpolation remains responsible for transitions.
- Full visible avatar set (1–4) measured with **V550** body/head and **V540** screen-space diagnostics before accepting any adjustment. Lyrics side/bottom zones remain protected; **V351** applies the final safety guard.
- No effect on manually authored camera timelines, keyframes, camera presets, direct live edits, paused playback, Reduced Motion, or low quality settings.

## Limits and correctness

The 3D safety checks use live avatar anchors and approximate head/foot envelopes, **not pixel-perfect visibility testing**. V682 cannot invent a verified singer, generate song sections, or guarantee cinematic composition for an imported avatar with unusual geometry. All history is transient in a React ref; no user data is stored or transmitted.

## Validation

`npm run test:v682`, `npm run test:v682:types`, `npm run test:quick`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`. A complete Next.js production build needs installed project dependencies and must be checked separately; this ZIP is not declared production validated without it.
