# Sonic Display V356 – Autonomous Show Intelligence 2.0

Base: **V355 – Performance & Stability**. The code extends the existing V306 automatic show, V351 content safety, V352 genre styles, V353 visual FX and V354 authored show timeline. It does **not** create an additional `Canvas`, requestAnimationFrame loop, microphone analyzer, AI service, or camera system.

## Scope

- **Bounded forward show plan:** use the actual track ID, song position, duration, BPM and *currently observed* section (`verse`, `hook`, `build`, `drop`, `break`). Compute a stable 2/4/8-bar phrase grid and preview 1–8 upcoming phrases. Future sections are **provisional estimates using the current section**, not verified detection or actual forecast of future song structure.
- **Reduced repetition:** seeded, per-track cycling of appropriate camera shots and dance formations; no consecutive repeat when multiple choices exist. For eligible embedded/installed GLB clips named like dance/groove/step/kick/motion, and only with at least two recognized alternatives, V356 can also rotate actual motion clips on phrase boundaries, using the already-existing GLB mixer/crossfade/motion matching.
- **Musical dynamics:** current section and genre influence the choice pool, intensity and bounded light/FX gain. Lyrics on screen limit camera shots to wide/medium and cap lighting/FX. Reduced Motion suppresses generated camera/movement/effect overrides.
- **No invented song time:** disable when no finite playing position, no matching track, no enabled V306 automatic show, or at the end of the track. Pause means no generated cues.
- **Strong priority:** a V354 authored timeline enabled for this track (or for all tracks) suppresses V356. Existing hand-edited cameras and keyframes keep priority inside the V289 camera director. Multi-avatar authored clips, V325/V326/V328/V329 group sync, V206 interaction modes, animation timelines, user motion overrides, active loops, overlays and explicit library choices are not replaced by V356.
- **Performance:** at most eight moment descriptions calculated per render and no new timers. V355 stabilization and render-scale limits still apply after V356 gains.

## Settings / Preview

Under **Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V356 – Autonomous Show Intelligence 2.0**, toggle the feature, choose intensity, bars per phrase, forecast size, and independently enable camera, formations, lighting, visual effects and eligible GLB motion rotation. A no-WebGL preview simulates genre, BPM, current section, playhead, lyrics visibility and number of avatars.

The feature defaults to enabled **but only participates when the existing V306 automatic show has been enabled**. For a manually authored V354 timeline, the timeline continues taking priority.

Settings are stored in browser localStorage under `sonic-autonomous-show-v356`; missing, unavailable or malformed storage values fall back to defaults.

## Implementation

- `services/stageContent/autonomousShowV356.ts`: pure deterministic bounded planner, eligibility-based motion rotation, storage and sanitization.
- `components/visualizer/AutonomousShowSettingsV356.tsx`: settings and honest read-only forecast simulator.
- `components/visualizer/ThreeAvatar.tsx`: integrate one generated cue as fallback to existing V354 cue and optional eligible motion choice; leave other priorities intact.
- `components/visualizer/registry.tsx`: optional phrase hint passed only to avatar renderers.
- `components/visualizer/GalleryPreviewEditorV343.tsx`: settings entry point.
- `tests/v356-autonomous-show-regression.cjs`: deterministic behavior, clock/mismatch, manual and accessibility safety, GLB rotation, storage and wiring.

## Verification and important limitations

- `npm run test:v356`: passed.
- `npm run verify:offline`: **99/99 offline test commands passed** (including V350–V355).
- `npm run check:syntax`: **457 TS/TSX files syntactically validated**.
- Isolated semantic type check of the V356 planner + V354 timeline: **passed** with global `tsc`.
- **Full project TypeScript type checking and `next build`: not verified.** This archive contains no `node_modules` or lockfile; preflight reports 14 missing direct dependencies (1/15 resolve). Run `npm install && npm run verify` on a development machine with package registry access.
- No soak tests or frame rate benchmarks were performed on actual Raspberry Pi or 10-inch display hardware.
- Heuristic planning does not infer upcoming verse/hook/drop boundaries from raw audio; it uses the current section as a short-horizon assumption. A full bar-accurate music-structure forecast would require separate confidence-scored analysis.
- Motion rotation requires **two eligible named GLB dance clips** and hybrid mode; it deliberately leaves ambiguous animations untouched. It does not install, download or synthesize missing motions.
