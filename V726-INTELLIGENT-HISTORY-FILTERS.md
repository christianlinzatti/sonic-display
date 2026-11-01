# V726 – Intelligent History Filters

V726 adds a **shared browser-local timeframe and artist selector** directly above V722 Personal Music Insights. A **single derived list** of archived Last.fm events controls both the V722 summary/preset cards and V715 History Explorer (including its calendar and chronology). Neither the full IndexedDB archive nor Last.fm is changed. No network requests, new permissions or scrobbler.

## Timeframe definitions

- Entire archive.
- Last **7, 30 or 90 local calendar days**, including the **last recorded scrobble's calendar day** (not today, not 24-hour approximations). DST and leap days are handled through local calendar math.
- Any locally observed calendar **year**.
- **Custom inclusive dates**, invalid/inverted/partial dates explicitly rejected rather than silently showing unfiltered history.
- Optional **artist**, matched case-insensitively with Unicode NFKC normalization. Year and artist filters combine.

The selected scope is displayed with the matching count. Changing the global filter clears the Explorer's additional search/date/artist refinements and resets paging. Existing click-through links from record days, months, artists and years adjust the shared selection so their destinations remain visible even when the old filter excludes them. Account switches reset the filter to prevent cross-account context.

## Limits and deliberate exclusions

The existing Explorer's *additional* search and date filters refine only the chronology; they are named accordingly. Chronology's calendar is scoped by the shared filter, search, and local artist, but ignores its additional chronology date filter by design. Older full-archive longitudinal analyses (taste evolution, Year Compare, Discovery Timeline, Milestones, and Health) remain full-archive to avoid claiming an artist's first-ever archival occurrence based on a short filtered slice; their sections are labelled separately. The V722 overview explicitly states that first observations within a filtered window are **not necessarily** the first observation in the full archive. Filter state is session-only and is reset when switching accounts.

## Checks

`npm run test:v726`, `npm run test:v726:types`, `npm run test:v726:ui-types`, `npm run test:quick`; typecheck/build with installed npm dependencies.
