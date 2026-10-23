# Sonic Display V134 – Unified Dance Animation Engine

Introduces a deterministic additive-motion compositor between the existing dance generators and the motion-debugger/rig-control pipeline. It sanitizes NaNs, enforces per-channel safety limits, and smooths tempo-sensitive motion with frame-rate-independent exponential interpolation. Halftime-friendly torso response for Deutschrap/Trap and sharper reactions for hard dance genres are supported. The existing GLB clips, timeline, director, retargeting, physics and LOD modules remain intact. Foot IK stays downstream. No claim is made that mixer choreography and procedural motion have become a single authoritative scheduler; this is a first staged consolidation of additive channels.

Included fixes from the confirmed local V133 build discussion: `Quaternion` value import, nullable genre, Object3D rig collection, effect cleanup return, `assetUrl` forwarding, lyricsScene typing and MouseEvent keyframe geometry.

Run `npm run verify:offline`, `npm run typecheck` and `npm run build` after installing dependencies.
