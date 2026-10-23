# Sonic Display V117 — Avatar Motion Debugger

Under **Settings > Avatar & Tanz > Dance Debugger**, enable the live Skeleton Helper and selectively disable additive motion layers: head, torso, arms, legs, expressions, and physics. Settings are in-memory and reset on refresh. Imported clip animations are not muted by these controls. Model GLB must have bones for skeleton lines to appear.

Diagnostics are local. The skeleton overlay is visible on the rendered GLB avatar, not on the simplified procedural avatar. Live layer isolation is deliberately non-destructive and never changes the source animation files.

Checks: `npm run check:syntax`, `npm run test:motion`, `npm run test:motion-debug`; full build requires `npm install` and `npm run verify`.
