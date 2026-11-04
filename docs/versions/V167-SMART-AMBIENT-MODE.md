# Sonic Display V167 — Smart Screen Layout & Ambient Mode

Basis: V166. New features are opt-in in Touchmodus: **Auto-Layout** chooses Mix while music plays, and **Ambient** shows a non-WebGL standby after 30 seconds of paused/no-track playback while connected to Spotify. Resume music instantly exits standby. Buttons and view choice remain available, and full-screen controls are kept. The clock uses device local time, updates every 15 seconds, and supports reduced-motion preferences. Preferences are stored locally under new V167 keys. Spotify connection failures do not trigger the standby; disconnected view still shows the login screen.

## Tests
`npm run test:smart-ambient`, `npm run verify:offline`, `npm run typecheck`, `npm run build`. The first two work without Next.js node_modules. Functional browser/GPU tests and production build require npm dependencies.
