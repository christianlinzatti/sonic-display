# V88 – Automatic Humanoid Animation Retargeting

Imported `.glb` clips are retargeted at runtime before being handed to the existing Animation Mixer. The original files remain unchanged.

- Maps common Mixamo and Blender bone names for hips, spine, head, arms, legs, hands and feet.
- Converts local quaternion keys relative to source/target rest rotations.
- Filters unmatched joints and non-rotation tracks; no risky translation or scale copying.
- Embedded animations, imported animation priorities, crossfading, and hybrid choreography remain.

**Limitations:** Not all humanoid rigs are compatible. Rigs with different hierarchy/orientation, VRM conventions, rest poses, missing bones or IK constraints can still show distorted motion. This is a conservative first-pass bone-mapping retargeter rather than full anatomical retargeting. Root motion is deliberately not transferred. Try animations exported with compatible rest poses, such as Mixamo humanoids, first.
