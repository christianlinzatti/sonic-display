# Sonic Display V469 – Expanded Genre Intelligence

Builds on **V468 Reactive Visual Performance**, retaining all existing visual and avatar features.

## 20 new genres (27 total)

| Group | Additional styles | Behavior |
| --- | --- | --- |
| Rap & Urban | Deutschrap, Trap, Drill, Boom Bap, R&B/Soul | Hook/verse focus, 808/half-time or relaxed groove, lyric-friendly camera |
| Hard Dance | Rawstyle, Hardcore/Gabber, Uptempo Hardcore | High-energy kicks, faster footwork, bounded festival effects |
| Techno & Rave | Hard Techno, Schranz | Industrial lighting and high-energy kicks |
| Electronic | House, Trance, Psytrance, Drum & Bass, Dubstep, Synthwave | Separate tempo/energy, colors, stage palettes and motion emphasis |
| Other | Reggaeton, Metal, Jazz, Klassik | Rhythm-appropriate movement; gentler styles have restrained camera and FX |

Existing genres remain: Hardstyle, Hardtekk, Techno, Hip-Hop, Rock, Ambient, Pop.

## Architecture

- `config/musicGenres.ts`: canonical 27-genre registry, palettes, display names, parent families, Last.fm label aliases.
- `services/genre/genreIntelligence.ts`: distinguishes new styles from generic parent labels; artist tags have reduced heuristic confidence; BPM alone never selects a style.
- `services/stageContent/genreVisualDirectorV352.ts`: individual visual/camera/light/photo/FX cue profiles; respects reduced motion, pause, lyric focus and user-selected stage themes.
- `components/visualizer/adaptiveGenreDance.ts`: distinct BPM/energy/attack templates. Clip-based choreography continues to use available GLB clips only.
- `components/visualizer/genreSpecificDanceIntelligence.ts`: differentiated scoring for installed motions; compatible family-tagged motions remain eligible.
- `components/visualizer/lightingGenreProfiles.ts`: a manually assigned preset for a subgenre takes priority; otherwise falls back to its historical parent genre before the general manual preset.
- `components/MusicAwareThemes.tsx`: picks genre palette from the same registry, so new genres have no missing color definitions.
- `components/visualizer/VisualizerStage.tsx`: optional automatic avatar selection uses parent genre when the subgenre lacks its own mapping.
- UI selectors in Music Animation, Genre Corrections, Adaptive Genre Dance, Genre Visual Director and Lighting Studio offer the expanded genres.

The 7 original genre IDs and existing local-storage keys remain unchanged. No GLB models, shader downloads or new render passes are required.

## How to use

1. Set `LASTFM_API_KEY` to enable automatic tag-based genre detection; without it, use the manual selection / correction UI.
2. Open **Genre Visual Director**, keep Auto on (default), and select the music stage. New genre colors/cues follow the detected track automatically.
3. For optional automatic **adaptive dance**, turn on `Bei Track-/Genre-Wechsel automatisch anwenden` in Adaptive Genre Dance Studio.
4. In **Lichtstudio**, optionally assign a lighting-library preset to each new genre. No assignment means the parent genre's preset is used, or the manual preset if none is assigned.

**Limits:** Last.fm tags are heuristics, not reliable stem/genre annotations. Genre BPM values are defaults, not actual Spotify audio analysis. Dance styles cannot synthesize new GLB animation files; they rank/select installed motions. Visual effects remain bounded and are governed by existing quality/reduced-motion constraints.

## Validation

Commands: `npm run verify:v469`, `npm run test:v469:types`. Includes V469 genre behavior, earlier V467/V468 regression suites, V210 genre-movement regression, syntax, module-case and import integrity. `npm run typecheck` and `npm run build` require `npm install` with functioning npm registry access; they were not fully validated in the offline build environment.
