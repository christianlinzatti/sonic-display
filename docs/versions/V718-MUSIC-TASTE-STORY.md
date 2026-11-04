# Sonic Display V718 – Music Taste Story

## User experience

Under **Zuletzt gespielt → Last.fm-History → History Explorer**, an interactive, horizontally scrollable timeline presents each archived calendar year. Tapping a year selects its chapter with yearly scrobbles, active days, distinct artists and tracks, a short fact-based recap, first-observed vs previously archived artists, five top artists, three top songs, and twelve monthly activity bars.

- **Year button:** select a year without modifying the archive.
- **Year → Wiedergaben öffnen:** apply an inclusive local Jan 1–Dec 31 window in the existing V715 history explorer and focus the chronicle.
- **Artist button:** apply both the selected year and the artist; clear any stale song term.
- **Monthly bar:** apply the already-tested V717 full-month filter (first day through last day), focus the chronicle.
- **Header shortcut:** jumps to the story within the Last.fm panel.

### Statistics and interpretation

- The data comes **only** from the active account's full V713 IndexedDB archive passed as `archive.events`. No new network calls or stored copies.
- A “scrobble” is an observed Last.fm history event. Neither play completion nor listening minutes can be inferred.
- All bucketing uses the **browser's local timezone** (like V716), including DST and year boundary midnight transitions. This differs from V714's selectable Europe/Vienna / UTC option.
- First-observed artists are first **seen in the archive**, not necessarily artists the person first listened to that year. Returning artists were observed in an earlier archived year. Continuity counts artists observed in both adjacent years, as a percentage of artists observed in the selected year.
- Missing years between observed years are shown as **no archived data**, never as proof of no listening. Previous-year comparisons show a dash if either adjacent year lacks data. Current year is explicitly labeled incomplete.
- “Most diverse year” refers only to the **count of distinct observed artists**, not musical genres. No genre classification or Spotify preference inference is claimed.
- Normalization of artist/song identifiers uses NFKC + case-folding, making case variants count as one. The newest spelling provides the displayed name. Invalid timestamps, future events, blank/control-character labels are excluded.
- Records tie-break toward the most recent year, not a speculative quality score. Invalid input is ignored without changing it; aggregation works for large archives.

### Files

- `lib/lastfm-taste-story-v718.ts` – validated, read-only one-pass archive aggregation; yearly summaries and comparisons.
- `components/LastFmTasteStoryPanelV718.tsx` – accessible year picker, charts and actions with no API endpoints.
- `components/LastFmHistoryPanelV706.tsx` – integration and explicit year/artist/month navigation.
- `app/globals.css` – responsive/touch-friendly styling.
- `tests/v718-lastfm-taste-story-regression.cjs`, `tests/tsconfig.v718-*.json` – regression and isolated TS gates.

## Backward compatibility and limits

V706 through V717 behavior, the existing Last.fm↔Spotify separation, JSON backup, automatic recovery and explicit opt-in settings are unchanged. No duplicate Last.fm scrobbling. The archive is per account in this browser profile, not a cloud backup. If Last.fm itself or the local archive lacks a period, V718 cannot reconstruct it.

See `V718-VERIFICATION.md` for the actual checks performed and remaining validation steps.
