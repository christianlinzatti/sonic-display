# V125 – Avatar Optimization Pipeline & LOD Generator

Generate **separate** LOD0, LOD1, LOD2 GLB variants with `npm run avatar:lod -- input.glb ./output-directory`. Requires optional `@gltf-transform/cli` installed locally (`npm install -D @gltf-transform/cli`). Input and output must differ; an existing destination is refused.

The pipeline copies the source at LOD0 and simplifies geometry at approximate target ratios 0.65 and 0.35 for LOD1 and LOD2. It validates GLB structure and counts of animations, channels, skins, morph-target primitives, and triangle presence, then writes `lod-manifest.json` with before/after sizes and triangle estimates. On failure partial output is cleaned. Simplification may not suit every rig; visual validation remains essential.

**Integration limitation:** V123 selects named mesh variants *inside one GLB*. These output files are standalone GLBs and are **not yet hot-switched** by V123. No browser-side one-click optimization or before/after 3D split preview is claimed.

Run `npm run test:lod-pipeline` and `npm run verify` (requires installed dependencies).
