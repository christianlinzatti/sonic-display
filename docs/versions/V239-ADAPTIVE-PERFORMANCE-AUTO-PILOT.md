# V239 – Adaptive Performance Auto-Pilot

Opt-in live stage-effects governor in the 3D Performance Benchmark; no config-file changes.

* Current FPS and slow-frame percentage drive a pure, deterministic, bounded policy.
* Four consecutive poor readings degrade scene FX one level; twelve good readings restore one level. Minimum 14-second hold between changes.
* Preserves the original scene cap and always restores its initial state on stop, unmount or stale metrics.
* Only works with existing `auto` DPR mode. Changes scene decorations, never foot IK, music, lyrics or animations.
* Session-only; intended for real-world device testing. Does not measure Raspberry Pi CPU temperature.

Run `npm run verify:offline` and, after installing dependencies, `npm run verify`.
