# V727 — Weekly & Monthly Music Recap

V727 adds a read-only Last.fm recap under History. It uses the complete archived event set (not the V726 temporary filter) so that first-observed artists and historical comparisons remain consistent.

- Weekly periods are Monday–Sunday in the **browser's local time**; monthly periods are calendar months.
- The default period contains the latest archived scrobble, not necessarily today; older weeks/months are navigable without an API request.
- Four summary metrics, daily bar chart, top five artists and songs, artists first observed **in the stored archive**, and artists with rising share relative to the preceding window.
- When the most recent archive period is not yet complete, the prior comparison uses the same number of **local calendar days**. Partial periods are labelled; zero archived plays is not proof of no listening.
- Deep links to the exact selected period, artist, song or calendar date in the existing History Explorer use the V726 shared filter.
- No new permissions, network requests, Spotify→Last.fm scrobblers, server tasks, local storage writes or scheduled notifications. Data recalculates when archive updates/when opened.

**Files:** `lib/lastfm-period-recap-v727.ts`, `components/LastFmPeriodRecapPanelV727.tsx`, `tests/v727-period-recap-regression.cjs`, `tests/tsconfig.v727-{core,ui}.json`, `app/globals.css` and existing history/dashboard integration.
