# V80: Real 3D Lyrics

- Avatar mode: lyrics render as real @react-three/drei Text objects in the same WebGL Canvas as the avatar.
- Three adjacent lyric lines are positioned in 3D, configurable left/right with adjustable depth.
- Existing word-timed LRCLIB data is respected for the progress indicator; estimated timing is used when only line timing exists.
- Beat/bass drive smoothed micro-motions; reduced-motion settings disable motion.
- Existing modes (wave, particles, album glow) retain the CSS perspective fallback.
- All existing lyric styles, audio controls, lyric offset and lyrics studio remain available.
- Text faces the camera for legibility. The typography is rendered via Drei Text (Troika SDF), and font loading might need an internet connection unless a local font is supplied.
- V80 does not yet render each word as an independent 3D mesh; individual-word highlighting remains in the 2D styles, and the 3D mode indicates word timing with an underline.
