# V197 – Choreography Learning Dashboard & Motion Recommendations

Based on V196. Shows per-avatar, per-phase motion rankings derived from existing local counts; genre filtering, transparent confidence and evidence totals, manual adoption and targeted dismissal.

## Operation
Open Settings → Avatar → Character & Motion Library. V196 optional learning must be enabled to collect observations. V197 only reads stored learning counts and cannot determine future Spotify song structure. Accepted suggestions save as V196 manual phase assignments and affect its existing live selection. Dismissal removes only learned evidence for one phase/motion. Clearing history preserves manual overrides.

Scores are a simple frequency ratio (not a probabilistic calibrated confidence). Recommendation threshold is at least 3 observed segments and 60% within one phase. Genre filtering is display-only and does not alter live playback. Data persists in browser localStorage; no raw audio stored.

## Validation
`npm run test:learning-dashboard`, `npm run test:adaptive-choreography`, `npm run check:syntax`, `npm run typecheck`, `npm run build`. Full install required for typecheck/build.
