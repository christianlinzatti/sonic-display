# V840 - Dynamic Performer Stage Blocking 2.0

## Changes

- `components/visualizer/dynamicPerformerStageBlockingV840.ts`: deterministic, conservative, track-scoped depth-only smoothing for already validated V808 phrase cues. Two-, three-, and four-performer ensembles supported. Subtle vs Concert profiles, adjustable strength, persistently saved. Song changes, seeks, missing foot evidence, manual/authoritative cues, reduced motion and low quality fail closed. Scene depth remains bounded and lateral lanes untouched.
- `components/visualizer/DanceFormationActorsV492.tsx`: integrates verified plan with duo scene roots (without modifying existing foot or clip owners).
- `components/visualizer/GroupDancersV326SceneV492.tsx`: uses real root coordinates, V494/V487 foot evidence and V506/V508 collision-risk scores in existing group render callback.
- `components/visualizer/NaturalDanceControlsV320.tsx`: new on/off, style, strength, reset and save-status controls.
- `services/settings/unifiedBackup.ts`: includes portable V840 setting.
- `tests/v840-dynamic-performer-stage-blocking-regression.cjs`: 82 deterministic new checks, including spacing, incomplete/unsafe evidence, timing, manual overrides, seek/track reset and 2/3/4 person formations.
- Existing V808 structural regression updated solely to account for the V840 intermediary gate; underlying V808's 2500 safety probes retained.
- Version/gate scripts, lockfile and architecture documentation updated to V840. CI workflow V832 continues to run the full technical gate on push/pull requests after repository update.

## Verification executed here

| Check | Result |
| --- | --- |
| V840 functional suite | PASS - 82 test groups |
| Historical `test:v800`...`test:v839` | PASS - 40/40 suites, including V808 2500 position probes |
| Targeted historical V596 footwork regression | PASS |
| V837/V838/V839 isolated TypeScript checks | PASS |
| V840 isolated TypeScript check | PASS |
| Total invoked regression/type suites (V800-V840 plus supplemental) | 46/46 PASS (last full run; V840 additionally rerun after minor continuity fix) |
| Source syntax/import checks | PASS - 1211 TS/TSX files |
| Architecture validation | PASS - 938 references |
| Package and lock versions | PASS - 0.1.0-v840 |
| Case-insensitive filename collision scan | PASS - 0 collisions |
| ZIP archive integrity | Verified after packaging |

## Release blockers / limitations

- **Full project TypeScript**: `tsc --noEmit --incremental false` did not finish within the 24-second execution limit (exit 124). This is not a successful typecheck.
- **Next.js production build**: not run: local `node_modules/.bin/next` and project dependencies are absent. V831 Production Gate **blocked** as required (exit 1); no release approval was fabricated.
- **Real GLB / browser / GPU evaluation**: not performed; actual collision avoidance, footplant appearance, and framing must be inspected with live rendered scenes and 2/3/4 real avatar rigs.
- New checks constrain stage-root projections; they do not measure true skinned mesh collision or guarantee visual quality.
- Automatic CI runs only once the updated project is pushed to the connected GitHub repo, which has not been done from this conversation.

To run the complete technical gate in an installed environment: `npm ci && npm run verify:production:v831`. A technical green gate still requires live visual acceptance.
