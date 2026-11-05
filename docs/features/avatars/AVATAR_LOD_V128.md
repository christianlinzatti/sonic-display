# V128 – Zero-Pop (experimental) LOD & Manifest-Free Discovery

Supported naming convention in the **same directory**: `robot_LOD0.glb`, `robot_LOD1.glb`, `robot_LOD2.glb`. Selecting either `robot.glb` or `robot_LOD0.glb` works; absent files are probed via HEAD before selection. `lod-manifest.json` still takes priority when present and valid. Files are never overwritten.

Crossfade retains the outgoing rig for around 340ms while the incoming GLB fades in (280ms). It clones mesh materials before modifying opacity. **Not guaranteed pose-perfect**: animation continuity across duplicate live mixers is approximate; abrupt transitions can remain. The short overlap costs VRAM and draw calls and transparency may affect certain complex shaders. Browser and hardware validation required.

Run `npm run test:lod-no-manifest`, then `npm run verify`.
