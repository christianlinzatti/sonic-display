# Sonic Display V150 – Automatic Avatar Proportion & Contact Calibration

Built on V149. The Three.js GLB rig is inspected separately for each rendered avatar. The shoulder→elbow and elbow→wrist distances provide an estimated arm length. The existing bounded manual V149 calibration is combined with the estimate before Partner Torso IK and Hand IK; manual strength, reach and height remain available. If the rig has no valid arm chain, defaults apply. Proportions are measured only once after a valid rig becomes available to avoid reinterpreting dance poses as body changes.

Limitations: this is a **heuristic**, not an automatic anatomical calibration or bone-axis retargeter. The 0.75-world-unit reference is model-dependent; large variation in GLB scale may require manual adjustment. No world-space hand-contact height is inferred without a validated ground/hip landmark. Does not guarantee collision-free or anatomically correct contact. Real GLB visual validation remains necessary.

Offline checks: `npm run test:avatar-proportions`; full suite `npm run verify:offline`. Production: `npm install && npm run verify`.
