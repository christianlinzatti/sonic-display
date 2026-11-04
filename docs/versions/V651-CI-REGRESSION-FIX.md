# Sonic Display V651 — CI regression repair (28 October 2026)

## Root cause

The GitHub `production-quality-v405.yml` workflow invokes `npm run verify`, which runs `verify:offline:fast`. Local `npm run build` previously skipped this suite. Consequently Ubuntu and Windows failed at V461's outdated literal JSX assertion although the new V634 code applies a stricter caption-width limit with `Math.min`.

## What changed

- V461 now validates actual computed width bounds over layouts/ensemble sizes and checks that the renderer applies both the V477 and V634 caps.
- Camera, cast, dance and vocal integration regressions now verify the current composition pipeline, including modules split from `ThreeAvatar.tsx` in V492, while continuing to check the protected functionality.
- Historic regressions no longer contain fixed version allowlists ending at V417/V426. The shared `tests/helpers/project-version-v651.cjs` checks the expected release family and minimum version for all future versions.
- `tests/helpers/release-coverage-v651.cjs` checks whether a test is reachable from the build gate through nested npm scripts, instead of searching for an exact command string in `build:preflight`.
- `prebuild` now runs the full `verify:offline:fast` suite, current V651 smoke checks and `check:release` on every local and CI build. `verify` delegates to `build`, so both start the same gate without duplicating the suite in `verify` itself.
- GitHub workflows upgrade to `actions/checkout@v5` and `actions/setup-node@v5`; `ubuntu-24.04` prevents an unintended moving-runner-image upgrade.
- README links to existing V315/V379–V382 feature documentation were restored.

## Validation and limitations

- The 171 historical Node test invocations all passed in a continuing-failure scan.
- `npm run verify:offline:fast` passed end-to-end with exit code 0, including the full historical runner with 180 isolated test invocations.
- `npm run test:v461`, `npm run test:v651:types`, `npm run test:smoke:v651`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case` and `npm run check:test-types` passed in the repair environment.
- This runtime lacks the project's installed Next.js/React dependencies, so full `npm run typecheck` and `npm run build` need to be confirmed on the Windows development machine and GitHub Actions after installation.
- For genuine e2e visual verification, real-browser and GLB scenes still need separate testing.
