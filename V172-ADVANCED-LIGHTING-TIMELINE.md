# Sonic Display V172 – Advanced Lighting Timeline & Drop Cue Editor

Based on V171. All pre-existing components remain in the package.

- The Lighting Studio now has a song-scoped cue timeline using Spotify's current track ID, progress and duration.
- Supported manual cue kinds: drop, build, blackout, strobe and color; each has an editable start time, intensity and duration.
- The “Drop-Vorschlag” action proposes the current playback position but does not automatically save or infer a guaranteed song drop.
- User-approved timelines persist in browser localStorage, scoped to the Spotify track ID. A stage-side change listener reloads timelines immediately.
- The 3D render loop evaluates cues without adding extra React state updates or new shader passes; base V171 heuristic lighting still runs when no cues exist.
- Sanitation limits inputs to 128 cues, bounded durations and intensities; strobe is mild and disabled with Reduced Motion.
- No Spotify API write operations are performed. Saving is local to the browser profile; it is not synchronized between devices.

## Verification

Run `npm install`, `npm run test:lighting-timeline`, `npm run verify:offline`, `npm run typecheck`, `npm run build`. Production bundling and GPU behavior require the npm dependencies and a browser.
