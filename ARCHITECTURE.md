# Sonic Display architecture

## Boundaries
- `app/api/**`: server-side routes; OAuth, encrypted session and Spotify tokens remain server-only.
- `services/spotify`: browser-facing API adapter. It calls our own Next.js routes and never handles credentials.
- `services/lyrics`: server-side provider orchestration and adapters. LRCLIB is preferred; lyrics.ovh is a plain-text fallback. Both normalize to `Lyrics`, and the UI does not depend on external response formats.
- `hooks/usePlaybackPolling`: polling, retry/backoff, visibility handling, last-known-state retention and lyrics refresh.
- `context/MusicContext`: shared application state and commands; components consume `useMusic()` only.
- `components`: presentation only. Keep data fetching out of visual components.
- `types`: stable app-level contracts, independent from external API response types.

## Extension points
1. Add further lyrics providers under `services/lyrics/providers/`, then register them in `services/lyrics/server.ts`; normalize each result to `Lyrics`. Current chain: LRCLIB first, lyrics.ovh fallback.
2. Add visualizer implementations under `components/visualizer`; pass normalized playback/track props rather than fetching data.
3. Add a `MusicSource` interface if another player/source is introduced; map it into `MusicState` before it reaches the context.
4. Persist UI preferences separately from playback state.

## Runtime flow
Spotify OAuth and token refresh run in server routes. The client polls `/api/spotify/current`, stores the latest normalized response in the context, and fetches lyrics only when track identity changes. Transient failures retain the last known track and set `connectionStatus` to `reconnecting`; authentication failures set it to `disconnected`.
