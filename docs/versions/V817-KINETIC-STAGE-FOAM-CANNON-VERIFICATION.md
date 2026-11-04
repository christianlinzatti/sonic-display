# Sonic Display V817 — Kinetic Stage Architecture & Virtual Foam Cannon

## Delivered

Starting from **V816 Reactive Particle Studio**, V817 adds two independently controllable effects:

- **Kinetic Stage Architecture**: at most 12 GPU-instanced moving LED columns behind the performers, controlled by existing verified song dramaturgy and budgeted through V640.
- **Virtual Foam Cannon**: side-stage nozzle props, white foam bubbles and fine mist using two bounded instanced particle meshes. Emission is physically *simulated*, not linked to any physical foam cannon. Up to 128 coarse + 160 fine instances in Ultra mode before device budget scaling.

The Concert FX Studio provides independently persisted enable switches, 0–100% intensity controls, cannon position (left/right/both), and a clearly simulated preview. Default settings have been added to the existing V810 normalizer, so older backups without these settings can be loaded.

The foam effect requires verified V810/V604/V761 cues, music playback and a genuine measured kick/energy accent. It is generally reserved for build, hook, drop and finale, with hardtekk/hardstyle more intense, rock/NDH intermediate, and Deutschrap deliberately subdued. Intro, verse and break do not fire foam. No effect is triggered during pause, blackouts, authored lighting overrides, Reduced Motion or low-device tier. The particles originate on both stage wings and do not enter the central vocalist corridor.

These are **virtual WebGL visual effects** only, not controls for real-world foam, spray or stage equipment.

## Verification carried out in this environment

- `node tests/v817-kinetic-foam-regression.cjs` — PASS (16 test groups).
- `npm run test:v810` through `npm run test:v816` — PASS.
- `npm run test:v800` through `npm run test:v808` — PASS after extending the historical hard-coded version allowlist to V817 (no productive test expectations changed).
- `npm run test:v809` — PASS, 60 groups and 2,500 deterministic samples, earlier in this iteration.
- `npm run check:syntax` — PASS, 1,175 TS/TSX files.
- `npm run check:architecture` — PASS, 873 referenced files.
- `npm run test:v817:types` — isolated V810/V817 pure TypeScript planner check. This is **not** the full project typecheck.

## Release gates still open

The **full** `tsc --noEmit` attempt did not finish within the available execution time; it **must not** be counted as passed. A Next.js production build, React/Three.js renderer typecheck with all installed dependencies and actual WebGL/GPU visual acceptance tests still need to be run after `npm ci` on your normal development machine. No working `node_modules` installation exists in this container. This release is a source-level integration candidate, **not** an approved production deployment.

Suggested checks:

```powershell
npm ci
npm run test:v817
npm run test:v817:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

For a complete visual check, inspect multi-artist/Deutschrap scenes, both one-sided foam settings, lyric readability, time-seek behavior and device quality tiers.
