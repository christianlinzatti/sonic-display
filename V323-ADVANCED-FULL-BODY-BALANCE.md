# Sonic Display V323 — Advanced Full-Body Balance

Built on **V322**. V323 uses previously observed foot contact from the existing V135 ground-contact classifier and V90/V204/V322 two-bone IK chain to guide restrained **additive** upper-body balance. It does **not** synthesize physical center-of-mass positions, apply physics forces, translate the character root, modify authored GLB keyframes, or write to imported files.

## Usage

Go to **Settings → Dynamic Stage → Smart Stage Director → Advanced Full-Body Balance · V323**. The new feature is **off by default**. Turn it on for a loaded, compatible GLB avatar, with **Foot IK enabled**. It does not simulate invented contacts for the procedural placeholder. V322 world-space foot lock is **not required** to enable V323; both use the same existing IK contact classifier, and work independently. V320 Natural Dance Intelligence remains upstream.

Settings:

- **Stance transfer** (default 60%): subtle upper-body lean/counterrotation toward the estimated support foot.
- **Turn counterbalance** (default 55%): small upper-body response to *measured animated hips* world-heading angular velocity. Uses shortest-arc angle differences across ±π, filters sudden changes and clamps resulting rotations. Falls back to stage-root yaw when hips cannot be identified.
- **Landing softness** (default 65%): temporary, bounded chest damping when the number of supported feet increases.
- **Response** (default 55%): critically damped lateral tracking, with hard limits on lean and velocity to avoid sudden offsets at lower frame rates.

The settings are saved in localStorage; toggling them does not rewrite older show presets or manually selected choreography. Live status reports (once per second) show the **estimated support side** and normalized balance impulses. Those are heuristic model signals, **not biomechanical measurements or calibrated forces**.

## How it works

1. The existing `avatarFootIK.ts` owns ground contacts and the actual two-bone IK solver. New `sampleStanceV323()` returns conservative **previous-frame** contact states and avatar-local ankle-X, normalized by each leg's rig length. It returns `null` for missing/uninitialized legs and does not place or move foot targets. A left or right foot is considered planted only if the contact phase and confidence threshold agree.
2. `advancedFullBodyBalanceV323.ts` estimates left/right/double support. No reliable planted foot → **no enhancement**. For a single foot it follows the estimated lateral position via a critically damped update. Both feet planted blend toward their weighted center rather than artificially favoring a side.
3. Angular velocity uses the hip's animated quaternion yaw when a recognized hips node exists, else the avatar root's heading. It applies small opposing `torsoTwist`/`hipCounter`/`counterArm` adjustments; changes are bounded and use the shortest angular delta. On landing, a decaying micro-response modifies `chestPulse` only.
4. V323 is inserted **after V307 → V311 → V320**, before motion debug, the GLB additive rig controller and the original foot-IK stage. It makes a new motion object; it never touches `footStep`, `legGroove`, target foot transforms, root/pelvis translation, original clips or IK joint constraints. Manual library/author-selected choreography scales back the response to 30%.
5. Pausing, reduced motion, disabled/absent IK, track changes and transport seeks reset the state; separate GLB avatar instances own separate balance states. Existing IK protections remain the only authority for joint corrections. V322 remains opt-in independently.

**Limitations:** Contacts come from animated ankle velocity and estimated floor level. No raycast terrain detection, high-resolution ground collision, dynamic biomechanics or root-motion correction is implemented. A non-humanoid rig, irregular scale, strong mocap hip translation or airborne dance move may produce unavailable or uncertain support estimates; V323 then avoids adjustment. Some GLBs expose hip orientation axes differently, so reduce or disable turn counterbalance if they appear unnatural. The feature is a visual refinement, not proof that balance or slipping is physically accurate.

## Files

- `components/visualizer/advancedFullBodyBalanceV323.ts`: pure bounded motion engine, persistence, confidence and diagnostics.
- `components/visualizer/avatarFootIK.ts`: read-only stance probes from the existing contact tracker.
- `components/visualizer/ThreeAvatar.tsx`: GLB-only additive hookup and hip orientation sampling.
- `components/visualizer/AdvancedFullBodyBalanceControlsV323.tsx`: opt-in controls and live status.
- `components/visualizer/StageDirectorControlsV287.tsx`: settings mounting.
- `tests/v323-full-body-balance-regression.cjs`: left/right and bilateral stance, no-contact fallback, turn wraparound, authored precedence, pause/seek/track-reset, localStorage/settings, boundedness and project integration.

## Verification

- `npm run test:v323`
- `npm run verify:offline` (all retained tests through V323 plus syntax)
- `tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck components/visualizer/advancedFullBodyBalanceV323.ts` — standalone V323 engine type check.
- After `npm install`, `npm run verify` for complete Next.js TypeScript/production build. Current environment has only 1 of 14 dependency manifests; no claim of complete Next.js build or in-browser 3D validation is made.
