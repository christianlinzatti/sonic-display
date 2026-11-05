# Sonic Display V102 – Dance Debugger

Under Settings → Avatar & Tanz → Dance Debugger, click **Avatar und Animation analysieren**. The diagnostics load your model and optional animation GLB client-side, check humanoid bone names and IK leg chains, inspect animation tracks and detect suspicious mismatches. Existing V101 features remain.

Limitations: static checks cannot quantify foot sliding or verify live action mixer blending. Bone alias coverage is conservative; results are heuristic. Browser permissions/CORS must allow loading external GLBs. Nothing is saved or uploaded.

Build: `npm install && npm run build`.
