# V148 – Advanced Full-Body Partner IK & Contact Stabilization

Adds bounded additive chest/spine assistance before V147 hand IK. The assist uses reachable hand targets only, a conservative 0.09-radian per-frame torso yaw cap, and framerate-aware blending. The previous frame's torso offset is removed before applying new overlay so authored animation poses remain in control. It falls back from chest to spine and skips rigs with insufficient arm/hand bones.

## Verification

Run `npm run test:partner-fullbody` and `npm run verify:offline`; use `npm install && npm run build` for the full Next.js build locally. No guaranteed physical hand contact or anatomy-aware joint constraints; requires GLB visual verification.
