# V132 – LOD Transition Quality Analyzer & Auto-Tuning

Auto-tuning estimates angular pose differences only for shared bone names, rejects invalid and >30° samples, smooths the mean error and adjusts the correction influence between 0.10 and 0.40. Correction retains the existing 5° step limit. Paused and reduced-motion playback reset the tuning state.

**Fix:** V131 had its correction hook in the procedural avatar referencing undefined GLB fields. It now executes within `GltfAvatar`.

Run `npm run test:lod-autotune`, `npm run check:syntax`, `npm run verify`. A real model comparison remains necessary.
