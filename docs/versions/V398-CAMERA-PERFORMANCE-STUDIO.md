# V398 – Camera Performance Studio

Interactive, opt-in camera tuning built on **V397 Visual Performance Director**. Opens from Settings → Avatar tuning → **V398 · Camera Performance Studio mit 3D-Vorschau öffnen**. It reuses the isolated V291 3D camera preview, loaded only on demand, so no new Canvas or GPU effects are introduced during regular playback.

## Usage

1. Enable V397 Visual Performance Director (*Dezent* or *Musikvideo*).
2. Open V398 and enable **V398-Einstellungen in der laufenden V397-Regie verwenden**.
3. Select *Verse*, *Hook* or *Drop*. For each section choose `auto`, `lead`, `two-shot` or `group`. Set **Zoom / Nähe**, **Seitliche Ausrichtung** and **Minimale Haltezeit**.
4. Click **3D-Vorschau öffnen** for the chosen avatar. Orbit/zoom the camera with mouse/touch. Zoom and lateral pan update the section values; arbitrary camera tilt stays preview-only. The preview has **one** avatar even for duet/group; verify real 2–4-avatar layouts on the main live stage.
5. Reset a section or the full profile without editing JSON. Changes persist in UiPreferences localStorage, the same backup pathway as existing preferences.

## Priority and guardrails

- V398 only retunes an already active V397 shot: it cannot synthesize speaker detection, lyric timing, a vocal handoff, hidden performers or a scene switch.
- A lead shot requires current **synchronized timed lyrics**. A duet shot additionally requires an existing duet/handoff with a valid partner. A group shot requires >=2 onstage avatars and an eligible section or synced verse.
- Final camera composition checks the **actual visible scene anchors** before applying shot or distance/pan tuning. Zoom is clamped to safe stage distances. Lyrics-protection reduces tuning; the existing final composition guard and downstream camera systems retain their control.
- Manual camera editing, authored stage presets, camera timelines, V377 selected duet shots, pauses, reduced motion, and manual stage casting priority suppress V397/V398 automation.
- Enabling this feature does not change recorded/imported GLB choreography, facial animation, lip sync, audio pipeline, lighting, laser or foot IK.
- `V398` is disabled by default. Solo/duet/group preview poses are simplified framing samples, **not live vocalist identification**.

## Validation

Run `npm run test:v398` or `npm run verify:offline`. The dedicated regression exercises persistence normalization, bounded orbit-derived camera settings, all three shot types and invalid speaker guards, manual priority source wiring, and lyrics safe-zone attenuation. A complete Next.js build, typecheck and real browser screenshots still require npm dependencies and a GPU-enabled browser, not covered by offline tests.
