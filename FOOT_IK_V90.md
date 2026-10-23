# V90 – Two-bone Foot IK (experimental)

- Detects hip, knee and ankle chains for each leg independently.
- During likely foot contact, applies a bounded two-joint inverse-kinematics correction after animation/rig motion.
- Uses current joint positions and a bend-direction pole from the animated knee.
- Gradually acquires and releases planted feet to avoid freezing jumps or fast footwork.
- Uses the V89 root-height stabilization as a fallback when no valid IK chains are found.
- Does not modify imported animation assets.

## Limitations

Bone names/hierarchy must be recognizable; only basic rotational two-bone IK is implemented. Rest-pose differences, joint limits, forward kinematics / heel/toe controls, true collision detection and perfect foot-plant preservation are not guaranteed. Test using each avatar and dance animation.
