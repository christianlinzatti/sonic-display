# Sonic Display V255 – Quality Decision Diagnostics

Adds an **in-memory, privacy-preserving log** of actual automatic render-quality tier transitions. Records last 24 decisions (from/to, cause, FPS, P95, slow-frame ratio, draw calls, triangle count and device cap), and shows them under Settings → Diagnostics → 3D render diagnostics. Clear from the interface. No persistent telemetry or GPU-time claims. Manual mode does not generate governor transitions. Beat processing unchanged.

Build on V254. Validation: `npm run test:v255`, `npm run check:syntax`, `npm run typecheck`, `npm run build`.
