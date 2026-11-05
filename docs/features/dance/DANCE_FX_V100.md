# Sonic Display V100 – Dance FX

- Dance FX in Settings → Avatar & Tanz: Enable, intensity, shockwaves, footprint marks, motion trails.
- Reuses a bounded pool of 8 × 3 WebGL objects; no React state updates per beat.
- High: all effects (8 particles); Balanced: max 4 and no trails; Low: effects suppressed to preserve framerate.
- Respects reduced-motion, playing state and kick cooldown. Defaults OFF for compatibility.
- Footprints are stage-positioned approximations, not sampled from avatar foot bones. No actual drop detection is claimed.
- No extra npm dependency.
