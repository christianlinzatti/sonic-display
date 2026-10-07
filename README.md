# Sonic Display

A Raspberry Pi-friendly Next.js/React starter for a Spotify now-playing display with album artwork and lyrics. It uses a central React `MusicContext` and normalized app types so later modules (e.g. Three.js/React Three Fiber visualization, clock, weather, or other metadata) can consume the same current context.

## Included

- Spotify OAuth Authorization Code flow with `state` validation
- Spotify Client Secret stays on the server
- Encrypted AES-256-GCM `HttpOnly` session cookie (access + refresh token)
- Access-token refresh when near expiry
- Current track, artist, album, cover, playback state and progress
- Lyrics provider chain: LRCLIB (synced when available), then lyrics.ovh, then optional Genius (plain text); all normalize to the app-owned `Lyrics` type
- Responsive fullscreen UI suitable for Chromium kiosk mode
- No database required

**Lyrics/policy:** Review Spotify's current Developer Terms/Policy and the lyrics provider's terms before using playback-synchronized lyrics or synchronizing Spotify recordings with visual media. This starter displays LRCLIB timestamps against playback position; disable/remove that behavior if your use case is not permitted or licensed. It does not stream audio.

## 1. Spotify Developer Dashboard

1. Visit https://developer.spotify.com/dashboard and create an app for the Spotify Web API.
2. Copy the **Client ID** and **Client Secret**.
3. In the app settings, add an exact Redirect URI:
   - Local: `http://localhost:3000/api/spotify/callback`
   - Vercel: `https://YOUR-PROJECT.vercel.app/api/spotify/callback`
   - Custom domain: `https://music.example.com/api/spotify/callback`
4. The redirect URI must exactly match `SPOTIFY_REDIRECT_URI` (scheme, host, path).
5. Scopes requested by the app: `user-read-currently-playing user-read-playback-state`.

Spotify references:
- Authorization: https://developer.spotify.com/documentation/web-api/concepts/authorization
- Authorization Code flow: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- Currently playing: https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
- Scopes: https://developer.spotify.com/documentation/web-api/concepts/scopes
- Refreshing tokens: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

## 2. Run locally

Requirements: Node.js 20.9+ and npm.

```bash
cp .env.example .env.local
```

Set values in `.env.local`:

```dotenv
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
SESSION_SECRET=generate-a-long-random-secret
LRCLIB_USER_AGENT=SonicDisplay/0.1.0 (https://your-domain.example)
```

Generate a session secret, e.g.:

```bash
openssl rand -base64 32
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and press **CONNECT SPOTIFY**.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**. Set `SPOTIFY_REDIRECT_URI` to your exact production callback URL.
4. Deploy (or redeploy after changing environment variables).
5. Add the production callback URL to the Spotify app's Redirect URIs.
6. Open the deployed site and connect Spotify.

Do not commit `.env.local` or expose `SPOTIFY_CLIENT_SECRET` in any `NEXT_PUBLIC_*` variable.

## 4. Raspberry Pi kiosk

Open the deployed URL in Chromium. Example kiosk launch:

```bash
chromium --kiosk --noerrdialogs --disable-infobars --start-fullscreen https://YOUR-PROJECT.vercel.app
```

The display polls the app API every few seconds. The browser receives only normalized playback data and never receives the Spotify client secret or refresh token as JavaScript-readable data.

## 5. Architecture and extension points

```text
Raspberry Pi / Chromium
        │ HTTPS
        ▼
Next.js on Vercel
  ├─ /api/spotify/login
  ├─ /api/spotify/callback
  ├─ /api/spotify/current
  ├─ /api/spotify/disconnect
  └─ /api/lyrics
        │
        ▼
MusicContext (normalized shared state)
  ├─ Track: title, artists, album, cover, duration
  ├─ Playback: playing, progress, fetchedAt
  └─ Lyrics: provider, synced, timestamped lines
        │
        ├─ Now Playing UI
        ├─ Lyrics UI
        └─ Future visualizer / other widgets
```

Key files:
- `context/MusicContext.tsx` — single client-side state provider and polling
- `types/music.ts` — extensible app-owned data model
- `lib/spotify.ts` — server-side token exchange/refresh
- `lib/session.ts` — encrypted cookie helpers
- `services/lyrics/server.ts` — provider orchestration and normalized `Lyrics` result
- `services/lyrics/providers/lrclib.ts` — LRCLIB adapter and LRC parser
- `services/lyrics/providers/lyricsOvh.ts` — plain-text fallback adapter
- `components/SonicDisplay.tsx` — presentation only

## Notes / troubleshooting

- **Invalid redirect URI:** exact mismatch between dashboard URI and `SPOTIFY_REDIRECT_URI`.
- **No current track:** start playback on Spotify and verify the account authorized the app.
- **No lyrics:** the app tries LRCLIB by title, artist, album and duration, then lyrics.ovh by title and artist. lyrics.ovh provides unsynchronized plain text; provider availability and catalog coverage can vary.
- **Session not retained:** verify HTTPS in production and that `SESSION_SECRET` is configured consistently across deployments.
- **Token refresh failure:** reconnect Spotify; the app clears the session on an API 401.

LRCLIB docs: https://www.lrclib.net/docs

## Robuste Spotify-Verbindung

Die aktuelle Version erneuert Tokens 90 Sekunden vor Ablauf. Bei einem Spotify-401 wird einmalig ein Refresh versucht und die API-Anfrage wiederholt. Ein ungültiger Refresh-Token führt zu einer erneuten Anmeldung; vorübergehende Netzwerk-/Spotify-Fehler lassen die Session bestehen. API-Aufrufe haben ein 12-Sekunden-Timeout. Bei HTTP 429 wird `Retry-After` berücksichtigt, bei anderen Fehlern steigt das Polling-Intervall schrittweise bis maximal 60 Sekunden. Nach erfolgreicher Antwort wird auf 4 Sekunden zurückgestellt. Der letzte bekannte Track bleibt bei temporären Fehlern sichtbar.

Hinweis: Auf Vercel sind einzelne Serverless-Aufrufe nicht garantiert seriell. Die Anwendung vermeidet parallele Refresh-Aufrufe innerhalb eines Browser-Tabs; mehrere gleichzeitig geöffnete Tabs/Geräte können weiterhin konkurrierende Refreshes auslösen. Für einen einzelnen Raspberry-Pi-Kiosk sollte daher nur ein Display-Tab laufen.


## Erweiterbare Architektur (v3)

Die Anwendung trennt API-Adapter (`services/`), Polling/Retry (`hooks/`), globalen Musikzustand (`context/`), Datenverträge (`types/`) und Darstellung (`components/`). Spotify-Tokens bleiben serverseitig. Details und Erweiterungspunkte stehen in `ARCHITECTURE.md`. Neue Lyrics-Anbieter sollen auf den app-eigenen `Lyrics`-Typ normalisieren; Visualizer erhalten Daten als Props und führen keine eigenen API-Aufrufe aus.

## Lyrics providers

Lyrics lookup is server-side and runs through `services/lyrics/server.ts`. LRCLIB is preferred because it can return timestamped lines. If it has no usable result or is temporarily unavailable, the app tries lyrics.ovh. Both adapters normalize results to the app-owned `Lyrics` shape (`provider`, `synced`, `lines`, `plainText`); lyrics.ovh results are marked `synced: false`. To add another source, implement an adapter under `services/lyrics/providers/` and return the normalized type. Review each provider's terms and usage limits before deployment.

## Optional microphone audio analysis

The display includes an opt-in browser microphone analyzer. Click **Mikrofon aktivieren** and grant microphone permission. The signal is analyzed locally with the Web Audio API; raw audio is not uploaded to Vercel. It exposes normalized bass, mids, highs, volume and a heuristic beat impulse through `AudioAnalysisContext`, ready to be passed as props to visualizer modules. Disable the microphone to stop the media tracks and close the AudioContext.

Microphone access requires a secure context (HTTPS; localhost is generally allowed). On a Raspberry Pi kiosk, grant/allow the site's microphone permission in Chromium. Room noise and speaker placement affect results; beat detection is heuristic, not guaranteed musical beat tracking. Use a USB microphone for a first setup. No microphone permission is requested until the user enables it.


### Automatic avatar genre detection (Last.fm)
Create a Last.fm API key at https://www.last.fm/api/account/create and set `LASTFM_API_KEY` in `.env.local` and Vercel Project Settings → Environment Variables. The key is used only by the server route `/api/genre`; it is never sent to the browser. The route checks Last.fm track top tags first, then artist top tags if the track has no tags, and maps recognized tags to the avatar genres. Results are cached for one day. Unknown tags leave the current/manual genre selection intact.


### Genre state in MusicContext
Last.fm genre lookup now runs in `MusicProvider` whenever the current track changes. Components can read `genre`, `detectedGenre`, `genreStatus`, `genreSource`, `genreMatchedTag`, `genreError`, and `genreOverride` through `useMusic()`. Use `setGenreOverride(genre)` to choose a genre manually, or `setGenreOverride(null)` to return to Last.fm detection. The animation controller only renders this context state and does not call the genre endpoint itself.


### Genius lyrics provider
Set `GENIUS_ACCESS_TOKEN` from your Genius developer account in `.env.local` and Vercel environment variables. It is only read server-side. Provider order is LRCLIB, lyrics.ovh, then Genius; Genius results are unsynchronized plain text. The `genius-lyrics-api` package searches Genius and extracts lyrics from the Genius page, so it depends on the site's markup and applicable terms; treat it as a best-effort fallback. Do not expose the token in `NEXT_PUBLIC_*` variables.

### Music source boundary and UI preferences
`MusicSource` is the adapter contract in `types/music.ts`. A source adapter fetches its provider-specific data and maps it into the app-owned `CurrentTrackResponse`/`MusicState` shape before React context sees it. `services/musicSource.ts` currently implements Spotify. UI preferences are kept separately in `UiPreferencesContext` and persisted to browser localStorage; playback/connection state remains transient in `MusicContext`.

### MusicProvider organization
`MusicProvider` composes playback polling with `useGenreDetection` and owns only cross-feature orchestration (manual genre override and disconnect). Keep future independent features in focused hooks/contexts rather than adding unrelated state/effects directly to the provider.

### Visualizer state
Visual components can consume `useVisualizer()` from `context/VisualizerContext.tsx`. It combines track/playback state, genre selection, audio metrics, and persisted UI preferences while keeping the underlying providers separate.

### Visualizer modes
Visual modes are registered in `components/visualizer/registry.tsx` (`wave`, `particles`, `album-glow`, `avatar`). The selected mode is read from persisted UI preferences by `VisualizerStage`. Add a mode by implementing `VisualizerProps` and adding a registry entry.

### 3D Avatar (v14)
The Avatar visualizer uses React Three Fiber and a procedural, stylized 3D character. Bass drives a gentle head pulse, volume affects torso width, and beat strength adds a subtle rotation impulse. This is a procedural placeholder character; replace its geometry/materials in `components/visualizer/ThreeAvatar.tsx` with a GLTF avatar when ready. Install dependencies with `npm install` before running the app.

### Optional custom GLTF avatar (v15)
You can use your own `.glb`/`.gltf` character without changing the visualizer registry. Put the model in a publicly reachable location (for example `public/models/avatar.glb`) and set `NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb` in `.env.local`. Restart Next.js after changing the variable. When no model URL is configured, Sonic Display uses the built-in procedural avatar. The GLTF scene receives subtle beat/bobbing motion; rigged skeletal dance animations are not yet mapped.

#### Rigged avatar animation clips
For animated `.glb`/`.gltf` avatars, include animation clips in the model. Sonic Display automatically prefers clip names containing `dance`, `move`, or `groove` during playback and `idle`, `stand`, or `rest` while paused. Clips cross-fade when playback changes. Models without matching clips continue to use procedural movement. Reduced Motion suppresses dance clips.

### Avatar animation mapping (v17)

Edit `components/visualizer/animationMapping.ts` to map your model's animation clip names to genre-specific playback and idle behavior. Matching is case-insensitive and uses regular expressions. For example, a Hardstyle model can expose clips named `Headbang_Loop` and `Idle`; the `hardstyle` mapping will select them automatically. If no genre-specific clip matches, generic dance/move/groove and idle/stand/rest names are used as fallback. Add a `default` mapping for other genres.

### Avatar-Auswahl
Unter Settings kannst du zwischen dem prozeduralen Avatar und einem konfigurierten GLTF-Modell wechseln. Für ein eigenes Modell setze `NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb` und lege die Datei unter `public/models/avatar.glb` ab. Weitere Modelle können in `components/visualizer/avatarModels.ts` ergänzt werden; dort jeweils eine eindeutige `id`, ein Label und eine URL eintragen. Die Auswahl wird als UI-Präferenz lokal gespeichert.

### Avatar library (v19)
Choose an avatar card in Settings. Register additional entries in `components/visualizer/avatarModels.ts`; set the corresponding model URL in environment variables. Optional preview images belong in `public/avatars/`.

```env
NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb
NEXT_PUBLIC_AVATAR_NEON_URL=/models/neon.glb
NEXT_PUBLIC_AVATAR_FESTIVAL_URL=/models/festival.glb
```
Models without a configured URL are disabled in the library. The built-in procedural avatar is always available.
