# Sonic Display V385 – Multi-Vocal Performance Studio

A per-Song, manually authored VISUAL vocal casting system for duos and groups (2–4). Based on V384; all previous features are preserved.

## User workflow

1. Open **Settings → Avatar & Tanz → V385 · Multi-Vocal Performance Studio** and select a Spotify song with synchronized lyric lines.
2. Select a lyric line (or a start/end line range), choose a visual stage role and an avatar slot (1–4).
3. Save the passage. Multiple passages form a song-specific map. Edit/remove entries at any time. Later overlapping entries override earlier ones.
4. Enable **Manuell zugeordnete Stimmen auf der Bühne verwenden**. Optionally enable **Kamera automatisch zur zugeordneten Hauptstimme führen**.
5. Use the preview scrubber to inspect which role will be active at each time without seeking or pausing Spotify.

The settings are stored in `UiPreferences.avatarVocalAssignmentsV385` indexed by `track.id` (Spotify track identifier) in the existing preferences persistence. The map is **disabled by default**, and no artist/speaker identities are inferred from audio or lyrics.

## Architecture

- `components/visualizer/manualVocalCastingV385.ts`: bounded pure, seek-safe assignment validation; a time-based resolver that honors only real synchronized lyric line timestamps; adapter to V376's duet/handoff cues.
- `components/visualizer/MultiVocalPerformanceStudioV385.tsx`: controls for range, stage slot, role, editing and preview; no autoplay/audio processing.
- `ThreeAvatar.tsx`: feeds the resolver into shared duo/group refs at animation frame rate; never restarts motion clips, reparses GLB, or modifies foot IK. Authored choreography and explicit show formations win.
- `vocalPerformanceQualityV374.ts`: explicitly assigned vocalists get lead/ensemble roles; mouths of other dancers relax instead of lip-syncing to the same syllables. Both procedural and imported GLB rigs use this through V384 articulation.
- `StageCameraDirectorV289.tsx`: when enabled, follows the assigned lead or shows the group for common hooks via the existing V377 camera system. V377 manual editor, saved paths, keyframes and other manual priorities remain untouched.

## Semantics and safety

- **Hauptstimme**: one nominated avatar articulates the timed lyrics while the other avatars continue dancing.
- **Feature / Antwort**: another avatar takes over, with short bounded acknowledgment gesture/visual handoff at a valid passage boundary.
- **Gemeinsame Hook**: all configured avatars articulate together; camera chooses the wide shot if automatic camera casting is enabled.
- Timed lyric line gaps, pause, stale/unsynced lyrics, missing song assignments, a one-dancer stage or disabled V385 fall back to the old system; no random or invented dialogue timing.
- Selected slots not present in the actual 2/3/4-person stage are ignored until the stage has enough avatars.
- Reduced-motion disables the V385 handoff gesture and the cinematic camera behavior.

**Limitations:** User-authored stage casting is not source separation, speaker diarization, phoneme recognition or verified artist identification. It does not load extra avatars. Imported model facial rig calibration from V383 and V384 remains essential.

## Verification

`npm run check:syntax && npm run test:v385 && npm run verify:offline`

For a full Next.js production build on your network-connected Windows PC: `npm install && npm run verify`. npm packages and lockfile are not bundled; an offline full Next.js build is not verified.
