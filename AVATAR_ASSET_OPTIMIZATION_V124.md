# V124 – Avatar Asset Optimization Studio

Settings → Diagnostics → Avatar Asset Optimization Studio: offline GLB 2.0 header/JSON inspector. Counts meshes, primitives, estimated triangles, materials, textures, embedded-image byte sizes, animation channels, skins and named LOD families. Rejects malformed, oversized files. No uploads.

## Optional CLI optimization (requires internet for first install)

```bash
npm install --save-dev @gltf-transform/cli
npm run avatar:optimize -- public/avatars/source.glb public/avatars/source-optimized.glb
```

Source and destination must be separate, non-existing files. The CLI runs the glTF Transform default `optimize` preset; inspect the result in the avatar preview and confirm skinning, morph targets, textures and animations before switching. This does **not** automatically synthesize LOD0/LOD1/LOD2 mesh families. Author those in a DCC tool (e.g. Blender) and export as an explicitly named rig-compatible asset. Render performance has to be measured on target hardware. Run `npm run test:asset`, `npm run check:syntax`, and `npm run verify` after dependencies are installed.
