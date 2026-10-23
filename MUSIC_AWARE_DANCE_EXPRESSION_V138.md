# V138 – Music-Aware Dance Expression Engine

Enhances V137 with additive, bounded expression accents sourced from the existing beat-flow estimate. Deutschrap and trap emphasize snare-triggered head nods and shoulders; Hardstyle/Hardtekk emphasize kick-driven arm and chest accents. No audio stem isolation or lyrical syllable detection is claimed.

Processing: V137 `advanceBeatFlow` → V138 `computeMusicAwareDanceExpression` → V134 `composeUnifiedMotion` → motion debug controls → rig overlay → Foot IK. This preserves imported animation clips and applies expressive accents only to recognized bones.

Run `npm run test:music-expression`, `npm run verify:offline`, and when dependencies are available, `npm run verify`. Requires a visual test on real GLB assets.
