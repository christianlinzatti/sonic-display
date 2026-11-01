# V725 – Connected Services Monitor

## What changed

Settings → **Dienste & Status** now begins with a compact, filterable service overview. The original V667 status view and V668 diagnostic assistant remain available below.

- Spotify: server OAuth completeness is separate from a live playback response, whose existing `fetchedAt` is considered fresh for at most 60 seconds; an existing playback error is shown as a warning, never as a success.
- Last.fm: a valid configured server key is separate from the selected browser account, explicit V708 auto-archive consent, and **last recorded successful sync**. Successful poll evidence is considered current for 15 minutes (V708 polls every 5 minutes); stale successful polls prompt review. Disabled automation never turns on without consent. This is **read-only archive syncing**, not a second Spotify → Last.fm scrobbler.
- Lyrics: only the exact provider that actually supplied the current song's lyrics is marked as confirmed. Configured external providers do not appear healthy merely because a key exists. Feature-disabled providers are marked off.
- Other providers: MusicBrainz, TheAudioDB, Flickr, Vercel Blob, Push and admin configuration are marked unknown/disabled without probing third-party APIs.
- Touch-friendly filter: all / attention / disabled / unchecked, with visible states, config and enabled flags, explanatory next steps, keyboard focus, and reduced-motion support.

## Boundaries and security

V725 reuses `/api/system/status` (V667 allowlisted booleans only), the existing Spotify MusicContext, and locally stored V706/V708 account/consent/success metadata. No secrets are fetched into the client, no background network probes, no automatic preference change or Scrobble writes are added. Last.fm archive contents are not read or mutated by the monitor. A successful V708 sync timestamp is evidence about the **local auto-archive poll**, not proof that Spotify or Last.fm independently scrobbled the current song. API errors and provider activity remain unknown until evidenced. Status changes while the settings view is open; cross-tab changes and V708 status updates refresh the local display.

## Verification

See `V725-VERIFICATION.md`; run `npm run test:v725`, `npm run test:v725:types`, `npm run test:v725:ui-types`, then `npm run test:quick`, `npm run typecheck`, `npm run build` after installing dependencies.
