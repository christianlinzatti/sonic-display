# V1091 · Smart Concert Story Arc Director

- New opt-in, song-scoped stage-only narrative curve for existing V1059 LED and V1036/V1039 laser renderers.
- Scene moods opening/quiet/steady/building/accent/closing with 0.65s stability except measured strong beat accents.
- Audio confidence is not confused with verified musical sections. Song progress is a *visual navigation hint* only.
- All brightness gains are in [0.5,1]. Existing V1090 soft transitions multiply only within established brightness budgets.
- Automatic patterns only, no extra render pass, hardware, Govee, external network, microphone, audio controller or fake drop.
- Performance low/reduced motion, disabled, paused, seek/new song and invalid data fail open to original visuals.
- Dedicated 170k adversarial samples, isolated strict TypeScript, release readiness, CI and Vercel integration.
