# V153 – Advanced Joint Rotation & IK Constraint Editor

## Changes
- Select bones using the existing V152 GLB skeleton viewer.
- Edit local-axis (XYZ) rotation minimum, maximum, and preview degrees (-180 to 180).
- See joint preview on a cloned GLB, based on its captured rest pose, without editing the original asset.
- Keep per-avatar constraints in `localStorage` under `sonic-display:v153:joints:<modelUrl>`.
- Reset a selected joint or all constraint overrides; export anatomy mappings and joint constraints together as JSON.
- Validate loaded data (finite values, angle bounds, maximum entries, unsafe keys).

## Scope and limitations
The constraints are **calibration metadata**, not yet applied to runtime foot/hand IK. This deliberate separation avoids inadvertently changing existing dance motion and cannot promise anatomical correctness for every rig. The preview uses a local rotation overlay on the cloned preview rig; it is not an automatic joint-axis solver.

Run `npm run test:joint-constraints`, `npm run verify:offline`, then `npm run build` with dependencies installed.
