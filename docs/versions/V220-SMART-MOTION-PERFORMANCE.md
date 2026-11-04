# V220 – Smart Motion Quality & Performance Tuner

The noncritical choreography/personality update cadence now considers both the rendering quality tier and the CPU bottleneck scheduler tier. Under constrained CPU pressure, expensive secondary motion planning is capped at balanced cadence; under critical pressure, at low cadence. This never raises quality beyond the user/render tier. When the CPU scheduler is disabled, the render tier alone determines cadence.

Per-frame beat impulses, audio features, clip playback, pose interpolation, rig updates and IK are unchanged. The scheduler tier is queried without React state updates. This is a conservative CPU-pressure policy, not a measured FPS improvement.

Validation: `npm run verify:offline`; full Next.js build requires installed dependencies.
