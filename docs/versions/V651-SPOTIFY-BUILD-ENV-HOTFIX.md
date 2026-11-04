# Sonic Display V651 – Spotify configuration at runtime (28 October 2026)

## Problem

`next build` evaluated `/api/canvas` while collecting route metadata. Importing `lib/session.ts` immediately initialized `cookieOptions`, which called `getEnv()`. In GitHub Actions, where the Spotify OAuth credentials are intentionally not present, this threw `Missing environment variable: SPOTIFY_CLIENT_ID` before any API request was made.

## Fix

`lib/session.ts` now derives cookie options lazily for each request that sets or clears a session/state cookie. The OAuth configuration is **not** evaluated when the module is imported during a production build. Required configuration remains validated when invoked; secure cookies are still conditioned on the HTTPS redirect URI, and session encryption remains protected with `SESSION_SECRET`.

A new `npm run test:env:spotify-build` covers a credential-free module import, a missing-config error when a cookie is actually used, encrypted session round-trip, OAuth state cookie attributes, and HTTPS/HTTP cookie security. `npm run check:release` runs this check before the application's full TypeScript typecheck, both locally and in CI.

**Do not add dummy Spotify secrets to GitHub Actions** to work around this build issue. Real Spotify credentials still belong in the local `.env.local` and/or the deployment environment and must never be committed.

## Validation

- `npm run test:env:spotify-build`: pass.
- `npm run test:smoke:v651`: pass.
- `npm run test:v330`: pass (Canvas integration).
- `npm run test:v359`: pass (Spotify library API).
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types`: pass.
- Full `next build` and root `tsc --noEmit`: not executable in this container without the project's installed Next.js/React dependencies. Verify with `npm run verify` after updating on the Windows machine or in GitHub Actions.
