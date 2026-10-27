# Sonic Display V503 – Intelligent Concert Performance 6.0

## Neu

V503 erweitert V502 um einen **passiven, rein berechneten** Performance-Overlay für reale, im Lyrics-Datensatz vorhandene **Wort-Zeitmarken**. Bei Deutschrap, Hip-Hop, Trap, Drill und verwandten Stilen wird die bekannte V372/V374-Vocal-Performance um dezente Bewegungs- und Gesichtsausdrücke ergänzt.

- **Natürlicher Rap-Flow:** Kopfnicken, minimaler Head-Tilt, Schulter-/Armakzente und Oberkörpergegenbewegung teilen sich einen **langsamen Phasenverlauf von 1,98 Sekunden**. Das verhindert hektische neue Armstöße pro Wort.
- **Schnelle Vocals:** Wenn der V453/V459-Lip-Sync kurze schnelle Wörter signalisiert, sinkt die zusätzliche Gestenstärke auf **44 %**. Die präzise Mundanimation bleibt unangetastet.
- **Verse/Hook:** In einer Hook sind die zusätzlichen Ausdrücke etwas stärker als in einer Verse, Builds und Drops bleiben kontrolliert; Breaks erhalten keine neuen Akzente.
- **Gesicht:** Ein minimaler, optionaler Augenbrauen-/Wangenakzent bei verified word. Kein Eingriff in Jaw, Lip-Closure (insbesondere B/P/M), Lächeln oder Blinzeln.
- **GLB/Prozedural:** Die vorhandene `gltfVocalPerformanceV492.ts`-/V371-Body-Rig-Mischung, `ProceduralDancerAvatarV492.tsx` und die eigentliche GLB-Morph-Steuerung in `VocalRigV368.tsx` nutzen denselben V503-Kern. Keine neuen Hooks, Mixer oder Render-Loops.
- **Performance:** Die Qualitätseinstufung `getActivePerformanceTier()` reduziert zusätzliche Bewegungen auf 64 % (Balanced) oder 25 % (Low); keine neue Audio- oder Cloud-Verarbeitung.

## Bestehende Regie hat Vorrang

- Kein Track, Pause, Reduced Motion, fremdes Genre, fehlendes oder unsynchronisiertes Wort: neutraler Cue.
- Die **bereits existierenden** Sängerrollen (V385/V496) bestimmen, ob ein ausdrücklich nicht singender Avatar Akzente erhält. Ohne Rollenmarkierung erfolgt **keine Stimmenerkennung**.
- Nutzer-Choreografien, installierte GLB-Clips und manuelle Morph-Vorschauen werden nicht verändert; Body und Face können unabhängig neutral bleiben.
- V420-/V423-Wort-/Audio-Edits, die V499-Hand-offs, V500-Duett-Gesten, V501-Lyrics und V502-Bühnen-Regie behalten ihre eigene Verantwortung.
- Keine zusätzlichen Fuß-, Root- oder IK-Manipulationen. GLB-Morph-Blends verwenden weiterhin die alte subtract-last-overlay-Strategie.

## Tests

```powershell
npm run test:v503
npm run test:v503:types
npm run test:v502
npm run test:v501
npm run test:v500
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Die V503-Regressionen decken unter anderem 20.000 Playback-Zeitpunkte, Genre-/Abschnitts-Gates, manuelle Prioritäten, Off-Cues, 2–4 Avatar-Slots, Worttempo, deterministic seek/replay, Kanalgrenzen und drei Avatar-Implementierungen ab. Diese Tests sind **kein Beleg** für echte Phonem-Synchronisierung, visuelle GLB-Qualität oder einen vollständigen Next.js-Build.
