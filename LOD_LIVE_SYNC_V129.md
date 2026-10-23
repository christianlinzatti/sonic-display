# V129 – Live LOD animation handoff

- Retains stable asset identity for outgoing and incoming LOD render layers.
- Resets fade timing on direction changes.
- Provides a transient, per-source live playback snapshot to synchronize clip time, action weights, speed and pause state.
- Falls back to the V127 unmount snapshot if no live outgoing instance exists.
- No manifest required when matching `_LOD0`, `_LOD1`, `_LOD2` GLB siblings exist.

## Constraints

- Visual zero-pop cannot be guaranteed: joint rest poses and animation track compatibility may differ between LODs.
- Short crossfades require both avatar assets to be in GPU memory.
- Browser testing with representative skinned GLBs and an npm/Next.js production build is still required.

## Checks

`npm run test:lod-live-sync && npm run test:lod-continuity && npm run test:lod-no-manifest && npm run check:syntax`
