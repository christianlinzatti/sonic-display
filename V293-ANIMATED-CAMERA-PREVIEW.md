# V293 – Animated Camera Preview

The visual camera editor now allows selecting the current avatar’s installed motions (V190 library), embedded animations, or the model-specific animation file. Play/pause and speed (0.25–2x) only affect the isolated preview canvas. External GLB/GLTF animations are loaded on demand, retargeted to an independent cloned rig and cleaned up on unload. Selection does not change the live avatar. Some custom rigs/motions may not be retargetable; an avatar with no embedded clips will remain still until a suitable motion is selected.

Verification: `npm run verify:offline`; `npm run build` with dependencies installed.
