# V152 – Interactive 3D Skeleton & Joint Calibration Editor

New `AvatarSkeletonEditor` in Avatar tuning provides a model preview with an interactive bone overlay, clickable bone points, slot selection, per-model localStorage mappings, reset, and JSON export. The original avatar GLB is never modified. Anatomical mappings are diagnostic only and do not alter production IK targets or joint constraints. V151 anatomy measurements and V150 proportion calibration remain available.

Run `npm run test:skeleton-editor`, `npm run verify:offline`, and (with npm dependencies installed) `npm run build`.
