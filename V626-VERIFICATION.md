# V626 – Verification results

Status at packaging: **PASS** for the checks below. The full Next.js `npm run build`, whole-project `npx tsc --noEmit`, and real visual/hardware measurements could **not** be performed in this environment because local project `node_modules` and a browser/WebGL device are not available.

| Check | Result |
| --- | --- |
| `npm run test:v626` | PASS: 19 groups + 1,500 deterministic grouping samples |
| `npm run test:v626:types` | PASS |
| `npm run test:smoke:v626` | PASS: V625–V616, V610, V600, syntax and architecture |
| `npm run verify:v626` | PASS: smoke chain plus V522, V518, V543, V553, V519, V520, V590, V602 |
| Source syntax | PASS: 850 TS/TSX source files |
| Architecture | PASS: 503 verified code references and documentation links |
| Full Next.js build | Not executed here (project dependencies not installed) |
| Real GPU/10-inch hardware measurements | Not executed here (no test hardware) |

Changes tested:
- Reads measured main WebGL drawing-buffer width/height via existing one-second V518 recorder; rejects incomplete/invalid dimensions.
- Existing V522 benchmarking configuration now locks actual render resolution, so a resize invalidates active trial. Old V518 records without dimensions remain backwards compatible, but cannot qualify for a V626 device baseline.
- V626 compares three completed V522 runs for each 2/3/4 avatar count under identical genre scene, target FPS, DPR, quality, feature flags, Pi budget and measured resolution.
- Manual launch, no extra RAF/timer, no new animations/effects or automatic quality changes.
- Exported data discloses observed-only Windows measurements; no claims about Raspberry Pi performance, GPU load, VRAM, power, temperature, or total memory.

On a Windows machine after extracting the ZIP:
```powershell
npm install
npm run test:smoke:v626
npm run verify:v626
npx tsc --noEmit
npm run build
```
