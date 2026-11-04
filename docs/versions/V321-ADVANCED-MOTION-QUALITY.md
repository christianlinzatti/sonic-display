# Sonic Display V321 – Advanced Motion Quality Studio

## Scope

Builds on V320. Expands the existing **Multi-Motion Character Library → V207 Motion Quality Optimizer** into a targeted, optional V321 diagnostic-and-preview workflow. Prior features and installed animation sources remain intact.

## Usage

1. Open **Settings → Avatar → Multi-Motion Character Library** and choose an avatar with a GLB motion.
2. In **Advanced Motion Quality Studio · V321**, choose and inspect a motion. Choose the animation clip to check.
3. Jump to time-stamped suspect keyframes; use the **Original und Glättung in 3D vergleichen** button to view two independent avatar/mixer instances at the same time. The comparison has pause, seek and restart.
4. Adjust smoothing strength (default 65%). By default, **live application is disabled**. Enable the explicit checkbox to apply conservative smoothing on **cloned animation clips**, for the live GLB avatar. Optionally protect embedded authored model clips (default enabled).
5. Disable or reset V321 at any time. Persisted settings live in browser localStorage under `sonic-motion-quality-v321`; editing/removing the GLB is not part of V321.

## What V321 measures

- Bounded sampling of quaternion keyframes and position tracks (max 240 tracks, 4096 keys each and 120 report events).
- Rotational discontinuities, including single-frame outliers when the immediately adjacent poses nearly match. Only these isolated quaternion outliers are eligible for automatic smoothing.
- Unusually fast model-local translation, large keyframe gaps, non-monotonic timestamps.
- Potential foot sliding *candidates* when a foot-named translation track moves quickly horizontally with little change in its **local** vertical value. This is not proof of ground contact or world-space drift. V321 does **not** auto-rewrite foot/root translation tracks or alter IK.
- Optional transition advisory for two clips: average endpoint-to-start quaternion difference for joints with matching channel names, plus a bounded **suggested** fade duration. It does not rewrite your existing transition timeline.

## Safe motion polish

`components/visualizer/advancedMotionQualityV321.ts` holds the deterministic core:

- `inspectMotionQualityV321()` returns time-stamped reports.
- `polishMotionClipV321()` *clones* the AnimationClip and edits only a suspect one-keyframe quaternion spike using spherical interpolation between neighbouring samples, scaled by smoothing strength.
- `transitionQualityV321()` reports local rotational mismatch and a suggestion, not an automatic change.
- `readMotionQualityV321()` / `writeMotionQualityV321()` provide local opt-in settings. The default is off.

Live pipeline: in `ThreeAvatar.tsx`, the existing `GltfAvatar` clip collection optionally maps through `polishMotionClipV321()` before the `useAnimations()` mixer. Original embedded sources are excluded when `protectAuthored` is enabled; imported and library clips are eligible. The original GLB file, cached Three.js GLTF, keyframe times, foot translations, procedural avatar, and authored Timeline records are not modified.

## Limitations

This is a **heuristic review tool**, not an automatic physically accurate motion-retargeter. The filter does not correct intentional abrupt pose changes, long-duration displacements, contact drift, root translation, unrelated rig/calibration issues, or foot sliding without reliable contact data. 3D previews run in two canvases and may cost GPU memory; open them only when needed. The imported motion must be supported by the retargeter and its asset URL must be accessible. The preview's retargeting may differ from rendering on a complex final stage, and the browser rendering has not been verified in this environment.

## Verification

- `npm run test:v321`: deterministic isolated spike fix, source immutability, foot-track guard, transition advisory, opt-in storage, 3D/wiring test.
- `npm run verify:offline`: syntax + complete existing regression suite through V321.
- Standalone strict TypeScript test of V321 core (without external npm packages) passed.
- Full application build / browser verification still require installing dependencies locally: `npm install && npm run verify`.

No undocumented Spotify endpoint or private session token is used.
