# Sonic Display V322 — Intelligent Foot Lock & Ground Contact

Built on **V321**, V322 extends the existing V89/V90/V135/V204 two-bone foot IK implementation rather than replacing it. Existing GLB clips, authored motion timeline records, manual dance selections, imported asset files, foot IK constraints, and original animation channels are not rewritten.

## Where to use it

Open **Settings → Dynamic Stage → Smart Stage Director → Intelligent Foot Lock & Ground Contact · V322**. This is explicitly **opt-in** (disabled by default to preserve V321 playback). Foot IK itself must already be enabled in the avatar settings and the loaded GLB model must have a compatible `hip → knee → ankle` hierarchy. The feature applies on the main GLB avatar stage, not the procedural placeholder. The existing **Avatar → 3D Avatar Preview → Vorher/Nachher** view compares no IK (left) with active IK (right); if the V322 toggle is on, right-hand IK also receives the V322 world-space lock constraints. The two sides have separate animation mixers/IK states, but do not claim ground-truth physical contact.

## Controls

- Enable smart world-space foot locks (default **off**).
- Anchor strength: default 72%; decreases the optional blend when lower.
- Release speed: default 65%; accelerates transition out of a planted position.
- Floor tracking: default 35%; permits **very small** changes to the estimated ankle-ground level *only* when a foot has firm, recent planted confidence.
- Maximum correction: default 6 cm **at an illustrative 1.8 m-avatar scale** (normalized against total leg length); capped by live rig length and the original joint-safety solver. It is *not* guaranteed anatomical centimeters for arbitrary scaled GLB models.
- Status: live planted/unplanted state, estimated horizontal/vertical ankle-anchor deviation, sampled at most once per second; if no recognized legs are active no diagnosis is claimed.

## Implementation and safety

`components/visualizer/intelligentFootLockV322.ts` is a standalone deterministic module with settings and bounded frame-time independent blending. Every foot has its own anchor, confidence blend and release state. It captures the ankle's **world-space** position *once* after V135's planted-contact classifier reports sufficient confidence, then resists limited movement while the foot is planted. It stops refreshing anchors until contact ends. An airborne or raised foot cannot newly anchor, and an elapsed/seek/track discontinuity resets the reference. A new plant captures a new anchor. An estimated floor is initialized from ankle positions and only slowly nudged by firm stance candidates, guarded against lifting the whole body to an implausible new floor.

`avatarFootIK.ts` computes suggestions through `updateFootLockTargetV322()` inside the existing IK update stage, after imported animation and natural additive moves. It passes each bounded world-space target through **the existing two-bone IK** and joint-limits code, respecting reach, user Foot IK strength, V234 footwork cues, and V204 leg balance. It never changes root, pelvis, mesh geometry, original keyframes or actual source animation files. V320 Natural Dance Intelligence remains a separate, upstream additive layer. A missing chain still uses the prior fallback mechanism and is **not** artificially corrected. Pausing, Reduced Motion or disabling the feature stop the correction and reset state. Runtime settings are cached to avoid storage access in frame loops.

**Important limitations:** This is a heuristic *foot stabilization* from animation-derived world-coordinate probes, **not** ground-mesh raycasting, real physical collision, measured friction, guaranteed anatomical accuracy, or a full root-motion compensation solver. On uneven 3D terrain, complex mocap rigs or when the entire character is translated, the reference floor is only an estimate; intentional stepping must be allowed to release the anchor. When uncertain, turn V322 off and use the V321 diagnostics and existing IK/rig settings. V322 does not access undocumented Spotify services.

## Verification

- `npm run test:v322`: anchor latch, bounded drift correction, lift/release, replant, false contact rejection, seek/new-track reset, floor-estimate constraints, invalid data, browser settings and UI/live/preview wiring.
- `npm run verify:offline`: existing regression suite through V322 and source syntax checks.
- `tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck components/visualizer/intelligentFootLockV322.ts components/visualizer/groundContactEngine.ts`: strict check of the isolated core, including the contact type definitions.
- `npm run verify` after `npm install` locally for full typecheck and optimized Next.js build. The execution environment for this release lacks most npm dependencies; no claim is made that the full build or GLB visual browser test passed.
