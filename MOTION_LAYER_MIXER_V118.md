# V118 Motion Layer Mixer & Performance Optimizer

The Dance Debugger now supports per-layer gains 0–150% for head, torso, arms, legs, expression, and momentum. Existing enable/disable switches remain available. The 3D render loop uses a read-only settings snapshot accessor to avoid allocating new settings objects on every frame. The motion overlay remains additive and respects authored imported GLB clips.

The mixer settings are session-local like the existing debug switches; use 100% to restore original response. The renderer still creates one small motion values object per frame; performance gains have not been benchmarked on Raspberry Pi hardware.

## Verification

`npm install`
`npm run check:syntax`
`npm run test:motion`
`npm run test:motion-debug`
`npm run test:motion-mixer`
`npm run typecheck`
`npm run build`
