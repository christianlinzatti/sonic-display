# Sonic Display V1018 – AI Song Understanding 2.0

## Evidence-based song interpretation

- Read-only Song Understanding 2.0 view integrated next to existing V983 opt-in song AI.
- Combines **measured** normalized live audio from V896 with **verified** sections from V763/V604 when each source is present, fresh, and associated with the currently playing track.
- Displays current confirmed section and the *already known* next confirmed section; no fabricated hook/drop timing or invented BPM.
- Shows measured energy, bass and energy trend without additional audio collection, requests, cookies, or telemetry storage.
- Genre-specific performance **direction** for Deutschrap, Hardtekk/Hardstyle and Rock; genre alone is never evidence of a rap voice or a specific performance passage.
- Strict scope checks for track changes, playback pauses, timeline staleness, audio staleness, invalid values and discontinuities.
- No Govee commands, autonomous effect triggers, network calls, browser storage, timers or lyric access.
- V983 opt-in AI proposals remain distinct from verified evidence and retain existing permissions.

## Release protection

- V1018 regression and pre-install readiness checks are mandatory in GitHub production gate and Vercel gate.
- Versioned workflow run titles advance to V1018 in this ZIP, using the existing importer updater.
- Production requires successful Node 24 full TypeScript/Next.js/Playwright CI after import. Local focused checks are not production certification.
