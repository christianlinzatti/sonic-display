# Sonic Display V141 — Intelligent Duo Choreography Director

Builds on V140. Enable **Automatische Solo-/Duo-Choreografie** in Avatar tuning to activate phrase-aware solo/sync/mirror/duet mode changes. Manual V140 mode persists and is restored when automation is disabled. No audio stems or mic data are fabricated.

## Verification

- `npm run test:duo-director`
- `npm run verify:offline`
- `npm run build` (requires Next.js/node_modules)

This is a rule-driven director, not AI pose generation. Clip synchronization remains best effort; visual GLB tests are required.
