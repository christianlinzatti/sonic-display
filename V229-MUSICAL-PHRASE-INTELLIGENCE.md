# Sonic Display V229 – Musical Phrase Intelligence

Uses the existing performance director (intro/verse/chorus/drop/break/outro) to modulate secondary motion. Rap and hard dance have separate intensity profiles. Expontential smoothing prevents sudden steps; pause and reduced-motion mode fade output to zero. The kick/beat and foot-IK processing remains per-frame. Sections are heuristic, not guaranteed ground-truth music segmentation.

Run: `npm run test:v229`, `npm run verify:offline`, and (with dependencies installed) `npm run typecheck && npm run build`.
