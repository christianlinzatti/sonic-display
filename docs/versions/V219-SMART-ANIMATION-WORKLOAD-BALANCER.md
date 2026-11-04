# Sonic Display V219 – Smart Animation Workload Balancer

- Per-avatar scheduler keys based on React instance identity, preventing interference between dancers using the same model URL.
- Scheduler entries released on unmount to avoid accumulating stale task timestamps.
- Secondary dancer choreography evaluation phase offset by half a quality interval, spreading expensive non-critical updates across frames.
- Beat timing, mixer advancement, rig application and IK stay on their original per-frame paths.
- Offline regression suite includes the V219 integration checks.

## Validation
Run `npm run verify:offline`; a complete Next.js build requires `npm install` and `npm run build` on a machine with dependencies installed. This version does not claim measured FPS gains.
