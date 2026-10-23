# Sonic Display V334 — Intelligent Content Scheduling

## Overview

V334 extends the V333 multi-screen content composer with an optional per-screen scheduler. The scheduler chooses **already loaded** media items. It does not query concert databases or independently retrieve content.

- Per-screen source rules: Canvas, album cover, API text, artist photography and concert events.
- Each source has a priority (0–3), duration (3–120 seconds), eligibility toggle and allowed musical sections (Verse, Hook, Build-up, Drop, Break).
- Weighted, deterministic time-slot interleaving. Priorities alter frequency rather than excluding low-priority sources. Multiple media entries of the same source remain eligible.
- Section-aware routing uses the existing `musicTimeline.section` signal (via `cameraDirectorSection`) already calculated by Sonic Display. If that signal is unavailable, Verse is the fallback.
- V331/V332 real-time push and V333 per-screen push policy remain authoritative: `immediate` interrupts the scheduled content; `next` appears at the next rotation interval; `off` ignores it. After push expiration the scheduled display resumes.
- If no source is available or allowed for a screen in the current section, that screen displays no scheduled content. V333's old rotation resumes unchanged when scheduling is disabled.

## Settings

Settings → Dynamic Stage → Stage Content Plugins → V333 Visual Stage Content Composer → V334 Intelligent Content Scheduling.

Enable Stage Content, V333 multi-screen layout and V334 Scheduler. Select an existing screen, then set enable/priority/duration/allowed sections for each source. Rule changes are live and persist locally in browser localStorage under `sonic-stage-content-scheduler-v334`.

Recommended example:

- Center screen: Canvas priority 3, 18 s in Verse/Hook/Drop; album cover priority 1, 10 s in all sections.
- Left screen: artist photos priority 3, 15 s in Verse/Break; text priority 2, 12 s in Verse/Hook.
- Right screen: concerts priority 2, 20 s in Verse/Break; texts priority 1, 10 s in Build-up.

Enable the corresponding providers and provide your API routes separately. Selecting a provider in the scheduler does not override provider settings or create missing remote data.

## Compatibility and limitations

- Up to five screens from V333; V330 single screen remains unchanged when the multi-screen layout is disabled.
- Per-screen push rules from V333 still govern urgent incoming messages.
- The scheduler runs a lightweight one-second wall-clock tick while the stage is mounted, independent of playback; section eligibility follows the detected musical section. This is a display scheduler, not an audio-sample-accurate sequencer.
- A priority of 0 still participates once per interleave cycle; to remove a source disable it. Duration controls each occurrence, not the global content-fetch frequency.
- Neither new external API credentials nor network dependencies are required.

## Validation

- `npm run test:v334`: regression for validation, bounded priorities, duration, section matching, deterministic rotation and integration.
- `npm run verify:offline`: all existing tests through V334.
- `npm run check:syntax`: TypeScript / TSX parse inspection.
- Standalone `tsc --strict --noEmit` for scheduler and related data modules.
- A complete Next.js browser/build verification still requires `npm install` and `npm run verify` on a machine with access to the project dependencies. Testing with live Spotify Canvas, Ably and real artist APIs requires the respective configured external services.
