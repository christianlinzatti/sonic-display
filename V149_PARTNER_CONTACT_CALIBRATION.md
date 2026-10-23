# V149 – Advanced Partner Contact Calibration Studio

Based on V148. Avatar tuning contains per-dancer reach, hand-contact height and IK strength sliders. Preferences are saved with other UI settings. Each dancer applies its own calibration on top of the V147/V148 interaction cue before torso assist and hand IK.

Defaults: reach 1.0, height 0m, strength 1.0. Input values are clamped. This is manual tuning, not skeleton measurement or guaranteed contact. Existing animation clips and duo choreography are preserved.

Run `npm run test:partner-calibration` and `npm run verify:offline`, then `npm run build` on a system with dependencies installed.
