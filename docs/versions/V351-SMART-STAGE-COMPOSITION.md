# Sonic Display V351 – Smart Stage Composition

V351 ergänzt V350 durch **eine gemeinsame Entscheidungsinstanz** für die bereits vorhandene 3D-Bühne. Avatare, aktive Lyrics, Einzel- und Mehrfachleinwände, Fotokarten, Licht, Effekte und die automatische Kamera erhalten aufeinander abgestimmte Vorgaben.

## Was ist neu?

- **Prioritäten je Musikabschnitt:** Bei aktiven Lyrics rücken in Versen Text und Lesbarkeit in den Vordergrund; bei Hook/Drop werden die Tänzer stärker betont, ohne angezeigte Lyrics zu verdrängen. Ohne Lyrics können Leinwände höher priorisiert werden.
- **3D-Sicherheitszonen:** Fotobildschirme werden in den vorhandenen V333-Bühnenkoordinaten vorsichtig verkleinert bzw. an den Rand gesetzt; zentral platzierte Hintergrundscreens bleiben hinter den Tänzern. Mögliche Kollisionen zwischen benachbarten Leinwänden werden reduziert. Eine pixelgenaue, perspektivenabhängige Occlusion-Garantie ist dies nicht.
- **Lyrics/Fotogalerie:** Die V350-Choreografie bleibt erhalten, V351 begrenzt bei Bedarf zusätzliche Fotoebenen, Kontrast/Deckkraft und deren Bewegung. Die Lyrics werden in der 3D-Szene seitlich etwas weiter freigestellt.
- **Automatische Kamera:** Ein Mindestabstand, Sichtwinkel und begrenzter seitlicher Ausschlag schützen den Bühnenausschnitt. **Live-Kamera-Edits, manuelle Kameramodi und gespeicherte Kamera-Presets bleiben vorrangig** und werden nicht verändert.
- **Licht/Effekte:** Die bestehenden Bühnenlichter und DanceFX erhalten abgestimmte Intensitätsbudgets. Gespeicherte Lichteinstellungen, Songs und Choreografiedaten werden nicht geändert.
- **Touchfreundlicher Szenensimulator** direkt im Gallery Preview Editor: Lyrics-Seite, Musikabschnitt, Tänzer- und Leinwandzahl auswählen; derselbe reine Entscheidungsalgorithmus liefert die Regie-Cues und Leinwandpositionen, ohne einen zweiten WebGL-Renderer.

## Einstellungen

`Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V351 – Smart Stage Composition`

V351 ist bei einer frischen Installation **aktiviert**, kann jederzeit deaktiviert werden und bietet Automatik bzw. explizite Fokuswahl (Lyrics, Avatare, Fotos, Ausgewogen). Schieberegler steuern Lyrics-Lesbarkeit, Schutzabstände, Kamerasicherheit, Lichtschutz und Leinwandgröße.

**Wichtig:** Die neue Sicherheitssteuerung ist ein heuristisches Bühnenlayout in Weltkoordinaten. Sie erkennt keine tatsächlichen Pixel-Silhouetten und garantiert daher nicht, dass unter jeder eigenen Kameraeinstellung oder bei jeder Motion eine vollständige Überlappungsfreiheit besteht. Insbesondere manuelle Kamera-Presets haben bewusst Vorrang.

V351 speichert ausschließlich UI-Einstellungen in `localStorage` unter `sonic-smart-stage-composition-v351` – keine Lyrics, Bild-URLs, Musikdaten oder Bewegungsverläufe. Keine zusätzlichen WebGL-Passes, Web Worker oder RAF-Schleifen.

## Code und Verifikation

- `services/stageContent/smartStageCompositionV351.ts`: Validierung, Cue-Berechnung, Leinwandkorrekturen und Kamera-Schutz in reinen Funktionen.
- `components/visualizer/ThreeAvatar.tsx`: eine gemeinsame Cue-Entscheidung anhand tatsächlicher Formation und Bühnensignale.
- `StageContentScreenV330.tsx`, `StageContentScreensV333.tsx`: Fotokarten und Leinwandpositionen.
- `DynamicStage.tsx`, `StageCameraDirectorV289.tsx`, `SmartStageCameraV236.tsx`, `Lyrics3DScene.tsx`: bestehende Regien übernehmen den V351-Cue.
- `SmartStageCompositionSettingsV351.tsx`: Regler und Bühnen-Simulator.

```sh
npm install
npm run test:v351
npm run verify
```

## Danach (Roadmap, **nicht** Teil dieses Releases)

- **V352 – Genre Visual Director:** eigene Regiestile für Deutschrap, Hardstyle, Hardtekk, Techno und weitere Genres.
- **V353 – Visual Effects Studio:** Partikel, Glows, Shader und Bildübergänge visuell konfigurieren.
- **V354 – Show Timeline Editor:** komplette visuelle Show-Abläufe erstellen und bearbeiten.
- **V355 – Performance & Stability:** Touch-Layout für 10-Zoll-Geräte, Raspberry Pi und stabiler Dauerbetrieb.

Die ältere V330–V340-Tanzshow-Roadmap besteht unabhängig davon; hier wird keine rückwirkende Implementierung ihrer dort beschriebenen Features beansprucht.
