# Sonic Display V151 – Advanced Avatar Anatomy & Rig Calibration Studio

Built from V150; all prior settings and IK behavior retained.

## New features

The Avatar tuning area includes a **read-only anatomy diagnostics studio** for the selected GLB model. It detects humanoid head, torso, shoulder, arms, hips and foot bone landmarks using the existing avatar rig resolver. It estimates shoulder width, head-to-foot height, upper+forearm arm lengths, hip-to-foot leg segments and torso length in model/world units; these are **not physical meters** and not clinically accurate measurements. Missing bones are flagged and not assigned fabricated values. A table lists recognized bone names and XYZ positions and a JSON export captures the report. GLB assets are never modified.

The measurement is deliberately separated from V150's existing automatic reach calibration: a diagnostics-only report cannot safely override production IK thresholds until confirmed with real GLB samples. Joint axes, knee direction, physical contact and active bone overlay visualization remain future work.

## Verification

`npm run test:anatomy`

`npm run verify:offline`

With dependencies installed: `npm run typecheck && npm run build`
