# V777 Verification / Release Gate

Checked in the project execution environment:
- `npm run test:v777` — PASS: six GLB concert scenes (2 and 4), deterministic audio cues, GLB-2 binary rig/morph/animation validation, report summary and P95, hash/rig/environment matching, blocked states, localhost-only runner, non-destructive baseline fixture installation.
- `npm run test:v777:types` — PASS, strict independent TypeScript type check for `concertBenchmarkV777.ts`.
- `npm run test:v776`, `npm run test:v776:types`, `npm run test:v775`, `npm run test:v774`, `npm run test:v773` — PASS.
- Individual regression tests V760–V772 and V552/V569 — PASS, including long-loop assertions.
- `npm run verify:v777:static` — PASS: 1,101 TS/TSX source files, architecture 793 references, lockfile 18 direct packages and 1,866-case-insensitive module paths.
- GLB independently parsed with `trimesh.load` (two geometries, skin hierarchy). This is **format parsing only**, not a Three.js rendering proof.

**Not verified:** full `npm run typecheck` fails because this container has no installed project dependencies (`next/server`, React/R3F/Three types, `@types/node` etc.); `next` production build cannot run. `npm run benchmark:v777:browser` correctly produces a `blocked` JSON when the local Next.js server is unreachable. No real browser FPS/Draw Calls or Pi hardware measurements were collected. The reference GLB is very small and must not be used as an absolute hardware recommendation.

Use `npm ci && npm run typecheck && npm run build` on a computer with dependencies, then run the V777 CDP browser test against a production Next.js server, ideally with the user's full-size GLB(s). Compare with the same fixture installed into V776 and identical asset hashes; see V777-CONCERT-BENCHMARK.md.
