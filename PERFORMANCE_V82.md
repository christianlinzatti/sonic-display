# Sonic Display V82 – Adaptive 3D Lyrics Performance

The existing adaptive scene performance setting (Auto / High / Balanced / Low) now controls 3D word rendering as well.

- **High**: individual karaoke word meshes for lines up to 28 words; subtle individual word scaling.
- **Balanced**: individual meshes for active lines up to 14 words, no per-word scale or costly full-strength outlines.
- **Low**: one text mesh for the active line, no context-line word meshes and no animated floating/bass movement.
- Longer lines automatically fall back to one text mesh **without truncation**.
- Troika text is wrapped in a memoized component to reduce unnecessary React reconciliation.
- Playback timing and all four existing lyric styles remain unchanged; 3D karaoke word highlighting is deliberately reduced at lower tiers.

Set quality in the existing **3D render quality** dropdown in Diagnostics; Auto uses frame samples with cooldown/hysteresis.

Note: no Raspberry Pi hardware measurements or completed production build are claimed here.
