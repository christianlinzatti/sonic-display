# Sonic Display V254 – Device-Adaptive Render Calibration

Based on V253. V254 adds a passive, device-specific upper bound to auto rendering quality.

- Uses 10 one-second windows of actual (nonempty) 3D scene metrics, including FPS, slow frame ratio, p95 frame time and render workload proxies.
- Uses a cached recommendation for the same browser/device/display fingerprint for at most 14 days. No user account or server-side tracking.
- Starts with an uncapped automatic mode unless a valid saved calibration exists, and adapts during the first eligible live scene samples.
- Quality cap high/balanced/low never overrides manual quality mode; the existing V253 performance decision and workload budgets can still lower quality when necessary.
- Recalibrate via Settings → 3D render quality → Recalibrate device.
- The governor does not change music timing, choreography clocks, or microphone analysis.
- Draw calls and triangles are indicative workload proxies and not GPU timings. A loaded but very simple scene may yield a less useful calibration; recalibrate with a representative avatar and effects enabled.

## Validation

- `npm run test:v254` – calibration recommendation, cap, fingerprint and expiry checks.
- `npm run test:v253` / `npm run test:v252` – backward-compatible regression tests.
- `npm run check:syntax` – TS/TSX syntax.
- `npm install && npm run typecheck && npm run build` – final verification on a machine with dependencies.
