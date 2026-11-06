# V1010 – Central Network Coordination

**Source:** `SonicDisplay-V1009.zip`. This version implements shared request coordination in the browser. The coordinator is **not** a process-global Next.js server cache, so it cannot accidentally share Spotify data between server requests.

## Included

- `lib/networkCoordinatorV1010.ts`: single-flight per scoped request key; separately reserved action/regular/optional slots (2/2/3/2); bounded 48-item waiting queue and 120-entry in-memory cache; optional prefetch eviction; per-subscriber abort; stale-while-revalidate with subscription callbacks; bounded exponential retry; provider-wide Spotify 429 `Retry-After`; offline/hidden-tab optional work suspension; optional provider circuit breaker (3 failures, 30 seconds, single half-open probe); account reset invalidating late results. No client tokens or persistent personal cache.
- `lib/networkJsonV1010.ts`: shared GET decoder with body-inclusive deadlines, deterministic HTTP failure handling, response cache only for successful requests, prioritized, deadline-bounded and **non-retrying** user mutations.
- Browser integrations: Spotify now-playing, lyrics, the genre/background JSON path, artist follow and discovery, playlist lists and stage media providers. Follow/unfollow mutations use reserved capacity and, on ambiguous errors, query actual status instead of replaying the write.
- Account isolation: `/api/spotify/current` includes a server-side HMAC session scope derived from the existing server-held refresh token. It is never the token itself; the client uses it solely to namespace memory. Session changes/disconnect wipe caches and abort stale work, including cross-tab sign-out notification.
- Spotify Follow API 429 now forwards `Retry-After` so all coordinated callers can obey Spotify's requested pause.
- Regression tests and the Vercel production gate include V1010. All preexisting V1009 network-timeout behavior remains available for injected transports and server-side callers.

## Behavior and scope

- Playback and explicit actions are separate from optional photos, which cannot use their reserved execution slots.
- Read keys incorporate provider, URL including song/language parameters, and authenticated session scope. Cached lyrics / biographies remain visible during a stale refresh. Playback requests intentionally have no stale cache.
- No persistent offline cache and no queued replay of writes. Optional background work resumes on foreground/online events and respects current queue bounds.
- This covers the above named browser fetch paths, not every historic server-to-server API route. For scale across multiple server instances, Spotify's upstream rate budget would need a shared distributed limiter (e.g. Redis), which is not provided here.

## Verification

`npm run test:v1010`, `npm run test:v1010:types`, `npm run check:syntax`, `npm run typecheck`, `npm run build:vercel`. The latter two need the project's installed Node dependencies and an appropriate build environment.

## Validation on the attached V1009 source (local 2026-11-06)

- **PASS** `npm run test:v1010` (shared GET, independent abort, queued capacity, reserved playback/action lanes, account reset, Spotify Retry-After, stale refresh, circuit half-open probe, transport cancellation ignoring signals, browser response/error caching and no write replay).
- **PASS** `npm run test:v1010:types` (isolated TypeScript with strict options).
- **PASS** `npm run check:syntax`, `npm run check:architecture`, `node scripts/release-integrity-v752.cjs --ci`, `node tests/vercel-production-parity-regression.cjs`, `node tests/v1004-production-reliability-regression.cjs`.
- **NOT VERIFIED in this environment** full `npm run typecheck`, `npm run build:next`, V1009 dependency-bound regression and production Playwright. This container has Node 22 instead of required Node 24, and `npm ci` failed to reach `registry.npmjs.org` (`EAI_AGAIN`). The CI jobs are configured to run real Node 24 builds after dependency installation; the ZIP does not claim the remote jobs have passed.

When uploading to `releases/`, note that GitHub workflows may be protected by the ZIP importer; `.github/workflows/v1010-central-network-validation.yml` may need a separate commit.
