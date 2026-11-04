# V959 – Automatic Parallel Production Validation

## Purpose

Automatic fail-closed build verification **without user PC access**. The workflow is triggered on GitHub push, pull request or manual dispatch **after the V959 project files have actually been committed**. The ZIP alone does not start GitHub Actions.

## Execution model

- GitHub Actions runs Ubuntu and Windows as **independent, parallel matrix jobs** (no fail-fast; both report results).
- After `npm ci`, V931 runs 27 **independent Node regression suites concurrently**, with bounded pool size 3 by default (`SONIC_TEST_CONCURRENCY=1..4`). Workers have individual logs, timeouts and exit codes. Failures in any worker block certification even when peers succeed.
- After all regression workers pass, V958 isolated core TypeScript, full `tsc --noEmit` and real `next build` run **sequentially**, so no steps concurrently modify `.next` or exhaust runner memory. No npm nesting / Windows PATH dependency.
- Every run produces `reports/v931-production-gate.json`, `reports/v959-build-proof.json`, `reports/v959-build-summary.md`, and `reports/v959-regression-logs/*.log`; all are uploaded even on failure.
- A missing lockfile, uninstalled dependencies, Windows/Linux case collision, timeout or failed command is a failure. A clean npm install and both OS builds are required for production approval.

## Commands

Regression-only checks (no `npm ci` required when the test TypeScript loader is available):

```bash
npm run test:v959:parallel
```

Full release approval (requires `npm ci` and installed TypeScript/Next.js):

```bash
node tests/v959-parallel-tests-regression.cjs
node tests/v959-production-validation-regression.cjs
node scripts/v959-production-verify.cjs
```

Use `SONIC_TEST_CONCURRENCY=1` (Windows PowerShell: `$env:SONIC_TEST_CONCURRENCY=1`) for a memory-limited machine, or 4 for a larger CI runner.

## Current verification boundary

Local non-build tests in the authoring environment are not equivalent to a completed Windows and Linux Next.js build. Package installation and full build must complete on GitHub to certify this version.

## Evidence from authoring environment

- **27/27 Node test suites passed concurrently** with three workers (`reports/v959-regression-only.json`). This includes Govee V909–V929, V958 concert regie and V959 guards.
- V958 isolated core TypeScript was checked with globally available `tsc` and passed. This is **not** a full app typecheck.
- Full production verification currently **fails closed** (`reports/v959-build-proof.json`): `node_modules/typescript/bin/tsc` and `node_modules/next/dist/bin/next` are absent after an incomplete dependency installation. Therefore no complete `next build` or Linux/Windows deployment acceptance is claimed.
- For compatibility with legacy version-specific regression tests, `package.json` and lockfile stay on `0.1.0-v908`; the integrated release milestone is explicitly identified by `sonicRoadmapRelease: v959`.
- `npm run test:v959:parallel` executes tests only and **never** reports a successful production build.
