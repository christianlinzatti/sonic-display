# V146 – Smart Partner Dance Interaction Director

Uses V145 additive arm gestures as the output layer. When the automatic duo director is enabled, a single per-frame state machine selects greeting, call, response, together, and recovery phases. Separate gain envelopes produce responsive back-and-forth. Musical timing is based on BPM; sufficiently confident phrase position can guide phase selection. Kick/phrase accents and envelope energy adjust intensity, with genre-specific cycle length.

The manual duo mode continues using the V145 gesture engine directly. Solo, pause, or reduced motion resets the director. Track changes reset timing. Root motion, imported GLB clips, ground IK, retargeting and LOD remain unchanged.

Tests: `npm run test:partner-interactions` and `npm run verify:offline`. Production build: `npm install && npm run build` in a working Node environment.
