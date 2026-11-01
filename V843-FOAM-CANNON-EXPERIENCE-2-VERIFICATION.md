# Sonic Display V843 – Foam Cannon Experience 2.0

## Implementation

- Adds `foamExperiencePlannerV843.ts` with verified, budget-respecting V843 cues and deterministic per-particle transforms, applied after V823 authoring/timeline and V825 resource/cast restrictions.
- Reuses the V817 foam cannon's **exactly two existing GPU instanced meshes** (bubbles and mist). Stage-wing restriction, instance caps and manual side selection remain in place.
- Procedural foam paths: arcing jet, small sideways flutter, varied particle sizes, slow landing and a temporary *stage-wing froth impression* from the same existing particles. This is visual simulation, **not physical fluid, persistent foam geometry or real foam deposits**.
- Larger bubbles and fine mist have distinct sizes and travel rates. Motion is deterministic from verified song/FX phase and pre-existing particle seeds, with reused mutable output to avoid per-particle heap allocations.
- Enhanced Hardtekk/Hardstyle drop gestures; softer verses remain gated by V817 (no always-on foam). V843 never increases source power/opacity, particle count or draw calls.
- Settings in Concert FX Studio: V843 on/off, realism (0–100), soft/natural/festival, temporary landing effect. Normalization and portable backup use existing V810 settings.
- V817 original particle trajectory remains unchanged when V843 is disabled.

## Automated verification actually executed

- `npm run test:v843`: **PASS (71 new groups)**.
- `npm run test:v843:types`: **PASS (isolated TypeScript; not full app compile)**.
- `npm run test:v817`: **PASS (16 legacy foam and kinetic safety groups)**.
- Previous version tests `test:v800` – `test:v842`: **PASS (43/43 suites, run across two passes)**. Historic tests asserting exact package versions were expanded for V843 only; domain assertions remain.
- `npm run check:syntax`: **PASS** (1,215 TS/TSX files).
- `npm run check:architecture`: **PASS** (938 linked references).
- `npm run test:module-case`: **PASS** (2,064 files; no case-insensitive module filename collisions).
- `npm run doctor:v831`: **executed** and reports BLOCKED dependencies as expected; it is not a production pass.
- V843 verification tests inspect the two instanced meshes and safe trajectory bounds (x stage-wing guard, height and scale). These are deterministic logic tests, **not browser/GPU rendering tests**.

## Production release blockers — DO NOT CLAIM A PASS

- `npm run typecheck`: ran for 22 seconds, then stopped with exit 124 (timeout; **inconclusive**, not PASS).
- Project-local `node_modules/next` and `node_modules/typescript` absent in this environment; `npm ci` not performed. **Real Next.js production build NOT run.**
- GitHub Actions workflow is present but was NOT triggered here.
- Actual image quality, sustained FPS, GPU performance, real GLB visual appearance and prolonged real concert runs NOT verified.

**Release status: tested integration artifact, NOT production released.**
