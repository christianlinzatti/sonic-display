# V130 – Avatar Motion Continuity & LOD Diagnostics Studio

Passive comparison of overlapping LOD instances: live clip offsets, common bone quaternion angular differences, and heuristic sync score. Samples are throttled to ~8 Hz and expire after 600 ms. Status appears in Settings → Diagnose.

**Limitations:** Matches bones by exact name. Models with different bone naming, rigs or bone counts may have no comparable pose; scores do not guarantee visual seamlessness. Diagnostic implementation does not alter animation playback. Crossfade must overlap both models and be running in a browser to see values.

Run `npm run check:syntax`, `npm run test:lod-diagnostics`, `npm run verify` (last requires dependencies).
