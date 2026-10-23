# Sonic Display V154 — Automatic IK Constraint Integration & Joint Safety Engine

- Applies explicitly saved V153 XYZ min/max calibration to **incremental IK-generated rotations**, relative to the current authored pose. Imported animation tracks are not clamped.
- Integrates with right-arm partner hand IK and both legs of foot IK. Other procedural torso/left-arm overlays are not yet constrained.
- Per-GLB constraints are loaded via V153 localStorage key; same-tab editor changes and cross-tab `storage` events refresh them.
- No stored constraint: existing IK behavior unchanged. Invalid storage: safe empty map.
- XYZ Euler-angle approximation; avoids pose overrides but does not enforce anatomically verified joint axes, hard contact or physical collision.
- Tests: `npm run test:ik-joint-safety`, `npm run verify:offline`; full production build requires installed npm dependencies.
