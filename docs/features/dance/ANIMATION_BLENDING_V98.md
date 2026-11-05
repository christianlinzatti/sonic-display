# Sonic Display V98 – Animation Blending Studio

- Settings → Avatar & Tanz → Animation Blending Studio: secondary GLB clip, overlay weight (0–85%), speed (0.25–2×).
- Main action and secondary action are mixed using three.js AnimationMixer weights.
- Supports embedded and imported GLB animation clips, including those that are compatible with the avatar rig.
- When a saved choreography is active, layering is suspended to avoid conflicting with its transitions.
- If no GLB model or fewer than two clips exist, layering is unavailable. Existing procedural animation unchanged.
- This is **whole-body weighted blending**, not additive blending, upper/lower-body masking, or automatic retargeting.
- The existing V97 Smart Dance Director and stored choreography settings are retained.
