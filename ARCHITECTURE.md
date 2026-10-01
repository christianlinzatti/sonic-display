# Architecture

The Raspberry Pi browser communicates only with the Next.js application on Vercel. Server routes handle Spotify OAuth and API calls. A signed/encrypted, HttpOnly cookie stores the session payload; the client receives only normalized track/playback data. `MusicContext` is the shared state source for the current track, playback progress and lyrics. Future visualizer components should consume this context rather than implement their own Spotify polling.
