# V113 – Natural Dance Motion Engine

- Phase-coherent counter rotation of torso, hips, head, and arms.
- Gentle knee follow-through, with lower amplitude for hard dance genres.
- Deutschrap, hip-hop, and trap use a relaxed halftime phase.
- Additive joint rotations preserve imported clips and world-space foot IK.
- Automatically fades to neutral when paused or Reduced Motion is enabled.
- Avoids double application of head X rotation in the existing rig overlay.

The engine uses estimated BPM and audio energy where supplied; it does not claim true kick/snare/verse detection from Spotify streams.

## Validate
`npm install && npm run typecheck && npm run build`
