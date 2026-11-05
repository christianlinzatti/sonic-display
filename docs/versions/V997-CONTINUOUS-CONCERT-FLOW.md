# V997 – Continuous Concert Flow

A conservative, opt-in **visual** handover between observed Spotify titles. V997 never crossfades or controls the Spotify audio. The next song or playlist is not predicted.

- Requires both tracks to be playing, the preceding observed progress within 15 seconds of its end, the new track within 12 seconds of its start, and a recent observation (≤15 s).
- Requires concert auto-mode and a dedicated per-device opt-in. Pausing, seeking, disconnects, a manual trigger, reduced motion, lyric focus and an invalid clock fail closed.
- One V882 snapshot carries a current-track-bound immutable handover. The existing R3F frame loop renders two dim decorative light rings behind performers, duration 1.8–2.7 seconds, opacity capped at 0.32. No additional render loop, API polling, new audiovisual subsystem or Govee/Alexa commands.
- A Spotify manual skip made just at the very end of a song can look identical to natural advance; V997 cannot prove playlist continuity.
- The previous/next songs are **not** mixed. This first version establishes a shared cross-song transition signal for later camera/LED/Govee continuity improvements.
- Settings: Concert Studio → V997. Default OFF, three visual styles and intensity control. `prefers-reduced-motion` always wins.

## Checks

`npm run test:v997`, `tsc -p tests/tsconfig.v997-planner.json --noEmit`, and on Node 24 with dependencies installed `npm run test:v997:types`, `npm run typecheck`, `npm run build`. CI includes the V997 gate via prebuild and Vercel. GitHub workflow edits are protected from ZIP import and must be reviewed separately.
