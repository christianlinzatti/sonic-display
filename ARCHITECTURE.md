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

### Optional audio analysis
`AudioAnalysisProvider` owns the opt-in microphone lifecycle and `useMicrophoneAnalysis` performs local Web Audio frequency analysis. It publishes normalized `bass`, `mids`, `highs`, `volume`, and heuristic `beat` metrics. UI/visualizer components consume metrics through context or can receive the metrics as props from a host. Audio capture is never required for Spotify metadata/lyrics and is stopped when disabled/unmounted.


## Genre detection
`MusicContext` requests `/api/genre` when the current track changes and exposes the detected genre, lookup status/source/tag, and an optional manual override through `useMusic()`. The server-only route queries Last.fm `track.getTopTags`, falling back to `artist.getTopTags`, then maps known tags to supported avatar genre IDs. Last.fm credentials stay server-side; unknown tags or lookup failures do not block playback or avatar rendering. Responses are cached for 24 hours. The animation controller is presentation-only and does not fetch genre data.


## Music source and UI preferences
`MusicSource` defines the source adapter boundary. Provider responses are mapped into normalized app playback data before entering `MusicContext`. The current adapter is `services/musicSource.ts` (Spotify). UI-only choices live in `UiPreferencesContext`, persisted independently from playback state in localStorage. `MusicProvider` composes playback polling and `useGenreDetection`; add future features as focused hooks/contexts rather than expanding this provider with unrelated concerns.

## Genius lyrics
The lyrics chain is LRCLIB → lyrics.ovh → Genius. The Genius adapter is server-only and normalizes plain text into `Lyrics` lines with `synced: false`. Configure `GENIUS_ACCESS_TOKEN`; without it Genius is skipped.

## Visualizer composition
`VisualizerProvider` composes normalized playback/genre state, microphone audio metrics, and persisted UI preferences into one `useVisualizer()` interface for visual components. It is nested inside the music and audio providers; visual components should consume this interface rather than coupling directly to those underlying contexts.

## Visualizer registry
`components/visualizer/registry.tsx` maps stable mode IDs to metadata and components. `VisualizerStage` selects the registered mode from persisted UI preferences and passes normalized audio, track, playback, and reduced-motion props. Add new visualizers by implementing `VisualizerProps` and registering a definition; keep source/provider concerns outside visualizer components.

## 3D Avatar
The `avatar` registry entry renders `ThreeAvatar`, a client-side React Three Fiber scene. It consumes the same normalized `VisualizerProps` as other visualizers, keeping Three.js out of the playback and audio-analysis contexts.

### Avatar model adapter
`ThreeAvatar` selects a custom GLTF scene when `NEXT_PUBLIC_AVATAR_MODEL_URL` is configured; otherwise it renders the procedural fallback. The model is loaded client-side through `@react-three/drei`/`useGLTF`. The adapter applies subtle whole-model motion from normalized audio features. Animation-clip selection and rig-specific bone mapping remain future work.

### Rigged GLTF animation clips
The GLTF avatar reads embedded animation clips. Clip names containing `dance`, `move`, or `groove` are preferred during playback; names containing `idle`, `stand`, or `rest` are preferred while paused. Clips cross-fade on playback state changes. If no matching clips exist, the existing procedural motion remains active. `reducedMotion` suppresses authored dance clips.
