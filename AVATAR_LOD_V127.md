# V127 – Seamless Avatar LOD Transition Engine (playback continuity)

The loader retains V126 fallback/probing logic. At LOD remount, V127 captures active animation names, clip playback times, weights, speeds and paused state, then restores any corresponding animation clips on the newly loaded model. The timeline offset is likewise restored.

**Limitations:** Each GLB still remounts a separate rig. There may be a short visual transition or a visible pose difference, especially if the target LOD has different bones or clips. This is playback continuity, not mathematically seamless cross-rig pose transfer or crossfade. For truly seamless transitions, compatible LOD meshes attached to one persistent skeleton are preferable.

Run `npm run test:lod-continuity`, `npm run check:syntax` and `npm run verify` with dependencies installed.
