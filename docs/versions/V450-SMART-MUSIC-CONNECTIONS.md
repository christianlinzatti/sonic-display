# V450 – Smart Music Connections & Artist Spotlight

V450 adds a short, non-obstructive evidence-based music-connections card to the existing V447/V448/V449 Genius panel, without introducing any new API requests, Python dependencies, or keys.

## Behavior

- **Sample/remix/cover connections:** Visualizes the current track, a labeled arrow with the exact relationship from Genius, and a linked verified track.
- **Producer/feature spotlights:** Uses credits from the existing `/api/genius/insights` response, with an explicit producer/feature label. It does **not** claim to identify a singer from an audio signal.
- **Spotify search:** A button opens the existing MusicDiscoveryV361 search through the already-established V449 event. A matching Spotify item is not assumed to exist.
- **Timing:** A deterministic 10-second display window beginning at 25 seconds, recurring every 56 seconds. Nothing displays while playback is paused, without data, or outside the window. Seeking recovers the same appropriate cue.
- **Presentation:** In the song/track info column, not over the canvas or karaoke. Animations disable with both OS `prefers-reduced-motion` and the app's reduced-motion preference.
- **Configuration:** Exactly one additional checkbox, enabled by default: **V450 · Animierte Musikverbindungen & Producer-Spotlight**. Existing V449 detailed disclosure and V448 cinematic cards remain independent.
- **Data safety:** Reuses the same guarded server-side Genius data and V449 validated `genius.com` links; no new external requests, private keys on client, fabricated timelines, sample dates, artist IDs, or audio/vocal identity claims.

## Verify

`npm run test:v450` – pure planner/tests + isolated TypeScript.

`npm run verify:v450` – preceding regressions, syntax, imports, and case-sensitive module checks.

`npm run typecheck && npm run build` – production verification when project dependencies are installed.
