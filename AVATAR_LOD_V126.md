# V126 Automatic LOD Asset Loader

Opt-in: run `npm run avatar:lod -- public/avatars/avatar.glb public/avatars/avatar-lods`, then set the avatar URL to `/avatars/avatar-lods/avatar_LOD0.glb`. Keep `lod-manifest.json` next to the generated GLBs. V126 checks the manifest and selects LOD0/1/2 based on the existing performance tier, preserving the original identity URL used for choreography and calibration. If the manifest is missing, the avatar keeps its original URL. Missing variants are skipped on unsuccessful HEAD checks.

**Limitation:** Separate GLBs are separate animated rigs; switching remounts the avatar and restarts the current clip, potentially causing a visual discontinuity. A truly seamless cross-rig animation continuity system requires explicit pose/time transfer and model-specific validation. HEAD is required by the hosting environment. Animation fidelity must be visually tested after simplification.

Validate using `npm run test:lod-loader`, `npm run check:syntax`, and `npm run verify` after installing dependencies.
