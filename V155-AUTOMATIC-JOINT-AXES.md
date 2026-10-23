# Sonic Display V155 — Automatic Joint Axis Detection & Anatomical IK Limits

V155 extends V154's IK-only safety filter with conservative automatic hinge-axis inference for clearly recognizable elbow/forearm and knee/shin bones.

## Behavior
- Uses joint->child and parent->joint offsets to estimate the bend-plane normal, transformed to the joint's local coordinates.
- Applies a maximum incremental IK twist about that axis (28° elbows, 24° knees) relative to the current animated pose.
- Rejects straight, degenerate, or unrecognized chains instead of guessing an axis. These keep V154 behavior.
- Explicit per-bone calibration saved by the V153 editor ALWAYS takes priority.
- Does not edit GLB assets, rest pose, authored clips, or stored calibrations.
- Inference is cached by bone object and used by both hand and foot IK through the existing V154 safety hook.

## Limitations
- Geometry-based inference is heuristic and depends on rig names and the bone hierarchy.
- A cached inference during an animated pose can be less reliable than a bind-pose measurement; tests on actual avatar GLBs are still required.
- Only elbow/knee-like joints are automatically constrained; hips, shoulders, and arbitrary custom rigs continue to use explicit V153 constraints or legacy behavior.
- Limits apply only to the additional per-step IK rotation, not the absolute joint angle or the underlying animation pose.
- Structural offline tests do not replace runtime three.js or full Next.js production tests.

## Check
```
npm install
npm run test:anatomical-axes
npm run verify:offline
npm run build
```
