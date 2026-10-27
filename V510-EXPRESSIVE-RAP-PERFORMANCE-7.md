# Sonic Display V510 – Expressive Rap Performance 7.0

## Implementierung

Die neue pure Datei `components/visualizer/expressiveRapPerformanceV510.ts` baut auf V503 und V509 auf und **erfindet keine neuen Lippen-, Phonem-, Sänger- oder Beat-Daten**. Für jede aktive Wortmarkierung prüfen wir die autoritative V372-Wortkonfidenz und vergleichen den tatsächlich aktiven Text mit dem V415-Markensatz am originalen V372-`effectiveTimeMs`. Nur innerhalb der vorhandenen Markengrenzen werden zeitkontinuierliche, stateless Mikroausdrücke zugelassen. Echte Stille zwischen Wörtern bleibt still.

### Aktive Verbesserungen

- **Kopf/Oberkörper:** äußerst geringe Pitch-/Tilt-/Sway-Zusätze, mit 2,24-Sekunden-Welle, nie pro Silbe hektisch.
- **Arme:** kleine gegenseitige Rap-Akzente; niedriger Qualitätsmodus und schnelle Rap-Wörter reduzieren die Intensität.
- **GLB-/prozedurale Mimik:** Augenbrauen, Wangen und minimal Squint; Kiefer, Lippenrundung, Lippenbreite, B/P/M-Verschluss, Blinzeln, gespeicherte Morph-Animationen und Facial-Prioritäten werden nicht ersetzt.
- **Sänger und Feature-Tracks:** ausdrücklich zugewiesene V385/V416-Rollen dürfen nur bei passender Track-ID animiert werden; wenn der V496-Sängerzeit-Editor für diesen Track aktiv ist, benötigt der Avatar seine aktuell zugewiesene Rolle. Fehlende Rollen sind kein Indiz für eine bestimmte Stimme.
- **Sicherheit:** Pausen, Reduced Motion, fehlende / nur zeilensynchrone Lyrics, Wortlücken, ungültige Timestamps, manuelle Körper-/Gesichtsvorränge und Break-Segmente sperren die jeweilige Zusatzanimation.

### Einbindung und Leistung

GLB-Körper: `gltfVocalPerformanceV492.ts` vor dem bestehenden V371-Stage-Overlay; prozeduraler Avatar: `ProceduralDancerAvatarV492.tsx`; GLB-Face-Rig: `VocalRigV368.tsx`. Es gibt **keinen neuen useFrame, keinen neuen AnimationMixer, keine neuen npm-Abhängigkeiten**, und keine neue Root-/IK-Steuerung. Der Kern berechnet nur additive Sollwerte und benutzt die bestehende Wortermittlung. V503-/V509-Funktionen bleiben erhalten.

### Prüfung

```powershell
npm run test:v510
npm run test:v510:types
npm run test:v509
npm run test:v499
npm run test:gltf-hook-split
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Die isolierten TS- und Offline-Tests bestätigen keine erfolgreiche Next.js-Produktionskompilierung. Mit echten GLB-Modellen und einem schnellen Deutschrap-Feature-Track sind Bild- und Ton-Synchronität anschließend visuell zu prüfen.
