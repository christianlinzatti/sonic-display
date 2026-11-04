# V921 – Verification Report

Date: 2026-11-04

## Scope

Sonic Display V921 adds the opt-in Cinematic Concert Light Synchronization layer on the existing V909/V910 Govee LAN bridge, V911 concert director, V912–V916 show/transition/group/preset pipeline, V917/V918 bass/beat logic, and V919/V920 verified section/genre brightness dramaturgy.

## Executed and passed

| Check | Result |
|---|---|
| `npm run test:v921` | PASS – 30 groups / 5,000 deterministic sampled stage states |
| `npm run test:v921:types` | PASS – isolated TypeScript core |
| `npm run test:v921:ui-types` | PASS – isolated TypeScript UI |
| V909–V920 regression tests, run individually | PASS |
| `npm run test:v908` | PASS – 966 checks |
| `npm run test:v907` | PASS – 1,096 checks |
| `npm run check:syntax` | PASS – 1,349 TS/TSX source files (rerun after final changes recommended in CI) |
| `npm run check:architecture` | PASS – 1,103 code references |
| `npm run test:module-case` | PASS – 2,314 source files, no case-insensitive module collisions |

The V920 regression assertion for prebuild test ordering was generalized to require the V920 checks without incorrectly demanding that V920 be the very first command. This preserves the earlier V908 and V916 first-stage quality gates mandated by V910/V916 regression tests. All V920 functional checks still execute.

## Not verified – do not label production-ready

- The full `npm run typecheck` was started but did not complete in the available execution time; the command produced no successful result.
- `react` and `next` could not be resolved from the working directory (`MODULE_NOT_FOUND`): project `node_modules` is not installed. A complete production Next.js `npm run build` therefore could not be established here.
- No Raspberry Pi / Govee physical-device or network-latency measurement was carried out.
- Local and GitHub CI behavior on Windows and Linux should be checked after a fresh `npm ci` with online package access.

## Behavioral gates validated

- Disabled by default; bad configuration cannot enable it.
- Stage events must carry a matching track, current playback, a fresh timestamp and a matching playback position.
- Manual camera priorities remain intact; V921 consumes the same show cue rather than commanding cameras.
- If the stage is absent, paused, hidden/unmounted or its cue becomes stale, no V921 enhancement is applied.
- Automatic V356 show cues can be excluded; confirmed track-section events remain the responsibility of V919/V920.
- Reduced-motion mode blocks camera/dance-inspired light intensity changes.
- Actual lyrics visibility can dim distracting rhythmic lights without fabricating a show section.
- V912–V920 RGB and transition settings survive unchanged; V915 group dimmer applies last.
- Govee V909/V910 API, authorization and UDP pacing are unchanged; no additional power or strobe commands.

## Deployment gate

```bash
npm ci --no-audit --no-fund
npm run test:v921
npm run test:v921:types
npm run test:v921:ui-types
npm run typecheck
npm run build
```

Run on the real Windows/Linux CI environments and test Govee latency on the future Pi installation before declaring a production-ready hardware release.
