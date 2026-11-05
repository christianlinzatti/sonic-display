# Sonic Display V123 — Avatar LOD & Smart Rendering Studio

Integrates with the existing V121/V122 adaptive performance modes. No second FPS controller.

## How to author avatar LOD meshes
Export separate mesh or group variants with suffixes `Body_LOD0` (high), `Body_LOD1` (medium), `Body_LOD2` (low). All variants in a family must share placement and compatible animations. The runtime selects the nearest available level to the active performance tier. Unmarked meshes and bones remain visible. No runtime mesh simplification or geometry regeneration is performed.

## Behavior and caveats
- High / Balanced / Low maps to LOD0 / LOD1 / LOD2.
- Swapping visibility avoids reallocating meshes in the render loop.
- Imported materials and animations remain unchanged.
- Actual FPS improvements require prepared lower-poly assets and a browser/hardware benchmark.
- As with any visibility-only LOD system, reducing polygon count is effective only if exported LOD variants contain fewer polygons.
- Tests: `npm run test:lod`, `npm run check:syntax`, `npm run verify`.
