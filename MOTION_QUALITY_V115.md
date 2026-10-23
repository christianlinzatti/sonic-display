# V115 Motion Quality & Diagnostics

Extends the existing diagnostics panel with live, once-per-second heuristic sampling of rig overlay targets. Detects large angles, rapid frame-to-frame changes and simultaneous strong torso overlays. Displays actionable warnings and a **heuristic** score (not a biomechanical realism rating). It does not change dance poses. No cloud processing.

Run `npm install`, `npm run typecheck`, and `npm run build`. Tests require actual runtime rig and avatar review.
