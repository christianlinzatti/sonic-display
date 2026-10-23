# Sonic Display V103 – Advanced Retargeting Studio

Settings → Avatar & Tanz → Advanced Retargeting Studio. Includes per-avatar humanoid bone mapping, per-bone local Euler offset controls (degrees), live application to imported animation in the main avatar and animation timeline preview, localStorage persistence, reset and JSON export/import with input validation. V102 Dance Debugger and other features retained.

Scope: imported quaternion tracks only; no automatic root motion, translation or scale transfer. Rest-pose and hierarchy differences may still require rig authoring in Blender. Local settings do not sync between devices.

Verify: `npm install && npm run typecheck && npm run build`.
