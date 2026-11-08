# V1094 · Concert Timeline Studio 3.0

- Realtime stage-cue timing can be authored by changing the six inner boundaries of the existing 7-act V1040 arena show plan. The unchanged V1040 stage sampler reads these updated boundaries directly; no parallel stage timeline or polling is introduced.
- Visual seven-segment overview with a virtual playhead, cue preview, boundary sliders and precise seconds inputs.
- All updates are validated to be contiguous, fully covered, bounded, finite and at least 2% of song duration per act. The editor reserves 2.5% when moving boundaries.
- Reset boundaries to templates without overwriting user-authored LED, laser, choreography, camera or intensity choices.
- Conservative song authority: these are editable templates, never detected hooks or real drop proof. Preview does not control Spotify playback. Manual timelines, device settings and existing beat requirements retain priority.
- Regression, isolated strict TypeScript, prebuild, CI, Vercel and production gate wiring included.
