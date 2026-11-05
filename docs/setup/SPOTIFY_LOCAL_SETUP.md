# Spotify login: local setup

1. Spotify Dashboard redirect URI: `http://127.0.0.1:3000/api/spotify/callback`
2. `.env.local` must include `SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback`, plus `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and a long random `SESSION_SECRET`.
3. Restart Next.js after changing `.env.local`: `npm run dev -- --hostname 127.0.0.1`.
4. Visit `http://127.0.0.1:3000/` and start the Spotify login there. If you accidentally start on `localhost`, the login endpoint redirects to the canonical origin *before* setting the OAuth state cookie.
5. If a previous attempt left stale cookies, clear site data for both `localhost` and `127.0.0.1`, then retry.
6. If `invalid_state` persists, check the server log for `Spotify OAuth state mismatch`. The log only includes booleans and host names, not tokens or the state itself.

The Spotify dashboard URI must match the env URI byte-for-byte. Use HTTPS on deployed sites. Cookies are `HttpOnly`, `SameSite=Lax`, and Secure for HTTPS origins. The OAuth state is single-use and expires after 10 minutes.
