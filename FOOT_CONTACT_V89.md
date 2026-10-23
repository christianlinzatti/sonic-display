# V89 – Foot contact stabilization

The runtime measures world positions of identified left/right foot bones and uses a bounded root-height correction after reactive motion. It avoids cumulative drift by removing the previous correction before measuring each frame. Unrecognized feet or reduced-motion state disable the correction. This is **not** a full two-bone inverse-kinematics solver; it does not solve knee angles or guarantee planted feet with all rigs. The GLB animation clips and model files remain unchanged.

For best results, use a humanoid GLB with clearly named foot bones and animation clips authored with reliable foot contacts.
