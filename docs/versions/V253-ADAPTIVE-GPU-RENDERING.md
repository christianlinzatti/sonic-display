# Sonic Display V253 – Adaptive GPU & Rendering Optimizer

Built on V252. Uses existing FPS, frame-time and adaptive DPR infrastructure. Adds a low-overhead render-workload governor based on WebGL draw calls and triangle counts **as proxy indicators, not actual GPU timings**.

- Checks approximately once per second, only in `auto` quality mode.
- Three consecutive high-workload / slow windows lower the render budget by one step.
- Ten stable windows restore it by one step.
- DPR caps follow high (1.5), balanced (1.15), low (0.8), without overriding a user's selected manual quality mode.
- Existing adaptive dance/lighting/FX quality integration continues to use the selected performance tier.
- Beat transport, Spotify timing, motion animation and audio analysis are untouched.
- WebGL recovery remains handled by the existing scene boundary.

Thresholds (draw calls >170 or triangles >420,000 together with FPS <57 or slow frame ratio >12%) are conservative heuristics and should be calibrated on actual devices. This change does **not** claim real GPU timing measurements or guaranteed speedups.
