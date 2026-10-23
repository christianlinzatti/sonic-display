# Sonic Display V181 – Genre Correction Memory & Artist Intelligence

V181 extends V180 without replacing Last.fm recognition or lighting profile mappings.

- Selecting an avatar genre stores a manual override by **Spotify track ID** in localStorage (`sonic-display:v181:genre-corrections`). The saved selection takes precedence during later playback of exactly that song.
- "Gespeicherte Korrektur löschen" clears the override for that song and falls back to Last.fm.
- A separate **artist suggestion** appears only when at least two *other distinct corrected tracks* from the normalized artist match, and at least 75% agree. It is not applied until the user clicks "Für diesen Song übernehmen".
- Corrections are bounded to 250, latest-first. Artist names use normalized casing. Invalid storage entries are ignored.
- "Alle Korrekturen löschen" requires browser confirmation; clearing the localStorage/site data will also remove all learned corrections.
- Genre memory influences the already existing genre-dependent avatar and lighting preset selection via MusicContext; it does **not** claim to analyze Spotify audio or identify genre with certainty.
- No external synchronization or data transmission was added.

## Test

`npm run test:genre-memory`, `npm run verify:offline`, `npm run typecheck`, `npm run build` (last two require installed npm dependencies).
