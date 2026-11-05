# V112 – Full Body Rap Dance Intelligence

Adds low-amplitude hip sway, alternating foot steps, weight shifting and leg groove to the V111 Rap Groove Engine. Each component has a separate slider under Motion Timeline Studio. Defaults are backward-compatible with V111 settings. Genre gate, pause and reduced-motion gate remain enforced. Ground contact and foot IK are still handled by the existing avatar subsystems; this module only supplies additive rotational signals, not actual foot planting or physics. Audio kick/snare/beat-phase are approximate features, not isolated instruments or vocal detection.

## Local validation

Run `npm ci` (or `npm install`), `npm run typecheck`, `npm run build`. Test both procedural and imported humanoid avatars, with/without Foot IK, pause and reduced-motion enabled.
