# Sonic Display V324 — Adaptive Ensemble Balance

Built on V323. **V324 coordinates the stage-space positions of the two already-rendered dancers.** It is an opt-in, conservative follow-on to V206/V274 multi-avatar choreography and V142/V143 formation/separation. The current renderer supports **two dancers**, not arbitrarily sized ensembles; V324 does not claim physically accurate foot grounding, collision simulation, multi-agent pathfinding or biomechanical mass balancing.

## User controls

Go to **Settings → Avatar → Multi-Avatar Choreography → Adaptive Ensemble Balance · V324**. The controls appear inside the existing `MultiAvatarChoreographyPanel`; changing the original V206 Director checkbox is not mandatory when the user's selected two-dancer scene, automatic duo director or intelligent V312 show is already active. For solo scenes V324 takes no action.

| Setting | Default | Purpose |
|---|---|---|
| Adaptive Ensemble Balance | **OFF** | Explicitly opt in; older shows retain their stage motion |
| Minimum spacing | **1.75 stage units** | Approximate spacing of the group origins in the stage XZ plane |
| Transition smoothness | **70%** | Slower easing between roles/formations |
| Solo focus | **50%** | Small foreground shift for the active solo; background dancer remains visible |
| Drop expansion | **55%** | Stage-space width expansion for a confirmed cue drop |
| Lane safety | **ON** | Preserve left/right ordering and discourage inadvertent crossings |

Settings are persisted in `localStorage`, sanitized for invalid or nonfinite input and refreshed on settings changes. Live diagnostic values are published at most once a second: approximate inter-avatar origin distance, whether the planner applied safety spacing, active role and whether V322's foot-lock slowdown is active.

## Integration and boundaries

1. `FormationDancers()` still obtains both targets from `duoFormationTargets()` and applies V230 phrase-level line/diagonal/wide adjustments. V143 `separatePartners()` remains the first conservative separation pass.
2. When opted in, `advanceEnsembleBalanceV324()` further enforces a configurable XZ gap, keeps left/right lanes if requested, gently moves solo leads toward the camera and allows bounded extra width for strong drops. It computes **both dancers in one call with one shared delta**, then applies both coordinated results to the existing Three.js group transforms. GLB mixers and per-avatar IK do not receive edited keyframes.
3. Group movement is damped with exponential easing and a hard travel cap. V322 being enabled limits the cap further and slows easing; this minimizes but **cannot eliminate** movement of planted feet during stage-level travel. V322's local world-space foot anchoring is still owned by its own IK chain. No fake stance or collisions are inferred.
4. When disabled, when only one avatar is visible, or when Reduced Motion is requested, the original formation behavior and controls remain authoritative. Pausing holds the last planned ensemble position. Switching titles reseeds the coordinator, avoiding travel across unrelated formations.
5. V324 does not change root translation inside the source motion asset, V320/V323 additive motion or the authored timing. Existing avatar contact calibration, partner gestures and V312 role priorities are preserved. There is no external dependency and no Spotify-private API request.

**Known limitations:** Separation is based on dancer group origins, not full humanoid meshes, swinging arms, costume volume, stage walls or prop geometry. Group movement is visually eased but not a foot-placement planner; strong hip/root movements inside GLB files can still bring bodies closer than their group origins. Exact phrase and drop cues are only as accurate as available song analysis and live estimates. The live status is an algorithmic estimate, not physical distance in meters.

## Changes

- `components/visualizer/adaptiveEnsembleBalanceV324.ts` — pure stateful two-dancer placement planner, limits, persistence, diagnostics event.
- `components/visualizer/ThreeAvatar.tsx` — one shared V324 calculation in `FormationDancers`, opt-in settings listener, at-most-one-per-second diagnostics and conservative V322 slowdown.
- `components/visualizer/AdaptiveEnsembleBalanceControlsV324.tsx` — opt-in controls and live status.
- `components/visualizer/MultiAvatarChoreographyPanel.tsx` — integrates the new controls into existing settings.
- `app/globals.css` — compact responsive control styling.
- `tests/v324-adaptive-ensemble-regression.cjs` — separation, transitions, speed cap, solo, role, drop, pause, reduced motion, hostile input, storage, track switch and UI wiring.

## Verification

- `npm run test:v324` — dedicated deterministic offline regression.
- `npm run verify:offline` — all retained regression suites through V324 + 376 TS/TSX syntax files.
- `tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck components/visualizer/adaptiveEnsembleBalanceV324.ts` — isolated strict typecheck for the new pure core.
- After `npm install`, run `npm run verify` to execute the full repository typecheck and Next.js production build. This execution environment is missing the Next/React/Three dependencies; **no complete Next.js build or actual in-browser WebGL verification has been performed**.
