# V250 – Performance Monitoring & Long-Running Stability

Built upon V249. Adds a bounded local-only session telemetry collector, active during music playback. Samples existing 3D render metrics at 5-second intervals, tracks up to 720 samples, and optionally samples browser JavaScript heap (where supported). Pause/resume retains elapsed playback duration. Hidden tabs skip sampling. Settings → Diagnose shows FPS average/P10, slow frames, heap trend, recent records and a reset control. **This release collects metrics, but does not alter dance quality or automatically tune animations.** This avoids destabilizing existing real-time animation code. No network transmission or persistent storage.

## Validation
Run `npm run test:v250`, `npm run check:syntax`, `npm run typecheck`, and `npm run build`. The full Next.js production build must be validated on a machine with dependencies installed.
