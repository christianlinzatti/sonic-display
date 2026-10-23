# Sonic Display V412 — Rap Choreography Presets & Opt-in Live Mode

## Release focus

V412 extends the V411 Motion Timeline in **Einstellungen → Anzeige → Rap Performance Editor → Motion-Timeline**. Presets are scoped to **one selected installed GLB avatar**. No existing motion installers, legacy choreography stores, Spotify controls, camera or lyric visuals are replaced.

### Editor

1. Choose an installed GLB/GLTF avatar and enable **Motion-Timeline V411**.
2. Add embedded or installed clips; edit duration, transition, Verse/Hook role and Rap accent.
3. Enter a name, select either **Verse/Hook aus Musik** (default) or **Zeitgesteuerte Timeline**, and click **Als neues Preset speichern**.
4. Re-select a saved preset, choose **In Vorschau laden**, or **Für Live-Show aktivieren** for the currently active live avatar.
5. Use **Live-Preset deaktivieren** to revert; this does not delete any preset.

The preset library is stored in browser localStorage (`sonic.rap.choreography.presets.v412`). It records clip **identifiers and timing**, not GLB binaries or arbitrary URLs. The activated preset is also saved in UI preferences for reloads. Presets can be deleted; deleting the active preset disables that activation.

### Live motion playback

V412 uses the **existing** GLTF avatar animation actions. Embedded references map to the avatar's animation order; installed references map to the retargeted `Library:<motion id>:0` animation. If predictive prefetch would otherwise omit a referenced installed motion, V412 explicitly loads it for that avatar using the established GLTF retargeting path. Unsupported `configured:active` aliases and missing/deleted installed motion references cannot be activated; edit them out or install the relevant motion.

- **Zeitgesteuerte Timeline** follows the V411 deterministic timeline positions and crossfade weights.
- **Verse/Hook aus Musik** selects the first authored Verse or Hook segment, smoothly crossfading as the estimated song section changes. The section inference prefers existing show cues and otherwise uses the music structure's *drop* phase as a Hook proxy. This is **not** a definitive vocal Verse/Hook transcription or AI stem separation. For tracks with weak structural evidence, use the timed mode.
- The selected segment's `rapGain` scales bounded head/arm accents on the GLTF dancer while keeping the V405+ mouth articulation intact. The preview still uses simulated beats and phrases.
- The live clock advances only during playback; pauses and reduced motion do not advance it. The clock resets on an avatar preset or track change.

### Safety / precedence

Activation is explicit and requires matching the current live avatar, valid clip identifiers, and a disabled legacy live motion timeline. Manual choreography sequences, avatar loops, authored choreography mode and manual dance overrides retain precedence at runtime. Secondary dancers are not silently affected. The active live preset can be disabled without modifying saved timelines or manually assigned choreography. Missing/unloadable animation clips do not crash the stage; content availability still depends on assets and compatible rigs.

### Verification

Run from the project root:

```powershell
npm install
npm run test:v412
npm run verify
```

`npm run build` runs V412 and earlier preflight tests automatically. `npm run verify` also executes offline regression and TypeScript validation. Node 22 is recommended. Tests cover normalization, safe storage representation, crossfades, deterministic sampling, missing motion checks, runtime wiring, and manual priority. The GLTF/Three.js rendering path and complete Next.js compilation still require the project's npm dependencies and a browser/WebGL runtime.
