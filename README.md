# Sonic Display

A Raspberry Pi-friendly Next.js/React starter for a Spotify now-playing display with album artwork and lyrics. It uses a central React `MusicContext` and normalized app types so later modules (e.g. Three.js/React Three Fiber visualization, clock, weather, or other metadata) can consume the same current context.

## Included

- Spotify OAuth Authorization Code flow with `state` validation
- Spotify Client Secret stays on the server
- Encrypted AES-256-GCM `HttpOnly` session cookie (access + refresh token)
- Access-token refresh when near expiry
- Current track, artist, album, cover, playback state and progress
- LRCLIB lookup and basic LRC timestamp parsing
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
- `lib/lrclib.ts` — lyrics lookup and LRC parser
- `components/SonicDisplay.tsx` — presentation only

## Notes / troubleshooting

- **Invalid redirect URI:** exact mismatch between dashboard URI and `SPOTIFY_REDIRECT_URI`.
- **No current track:** start playback on Spotify and verify the account authorized the app.
- **No lyrics:** LRCLIB may not have a match; the initial implementation queries by title, artist, album and duration.
- **Session not retained:** verify HTTPS in production and that `SESSION_SECRET` is configured consistently across deployments.
- **Token refresh failure:** reconnect Spotify; the app clears the session on an API 401.

LRCLIB docs: https://www.lrclib.net/docs
