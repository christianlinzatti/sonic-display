# Sonic Display V108 · AI Choreography Composer

The composer is an **offline, deterministic, rule-based generator** (not an LLM or learned AI).

Settings → Avatar & Tanz → Motion Timeline Studio → AI Choreography Composer.

Select genre, BPM, bars, energy, variation, drop interval and seed. Generate preview, then explicitly apply to the timeline. Existing V107 timelines remain unchanged until applied. Export through existing JSON export.

The generator uses the GLB animation names currently discovered by V107, chooses suitable motions using genre tags, adds beat-aligned transitions and drop accents. Generated sections are **heuristic musical structures**, not live Spotify audio analysis or real drop detection.

Constraint: existing timeline sanitizer accepts up to 40 segments; large arrangements may be truncated. For a reliable 32-bar composition choose 8-16 bars to leave space for drop accents.

Verify locally: `npm install && npm run typecheck && npm run build`.
