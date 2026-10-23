# V136 – Smart Dance Transition Director

- Genre- and BPM-aware bounded clip crossfade durations.
- Phase matching when recognized V135 foot contacts are planted and both clips have usable durations.
- Existing Foot-IK anchors and tracking state are left intact through clip switches.
- No restart when the same clip stays selected.
- Supports auto/live clip selection and stored choreography crossfade durations; authored timeline positions are retained.

Phase matching is an approximation: it does not guarantee physically identical foot poses between unrelated animations. Foot-IK remains responsible for contact correction. LOD behavior and original assets are retained.

## Checks
`npm run test:transitions`
`npm run verify:offline`
`npm run verify` (requires installed dependencies)
