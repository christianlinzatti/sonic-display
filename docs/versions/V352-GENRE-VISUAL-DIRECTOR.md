# Sonic Display V352 – Genre Visual Director

V352 ergänzt die gemeinsame V351-Bühnensteuerung um **stilabhängige Show-Cues**. Vorhandene Musikerkennung, R3F-Canvas, DynamicStage-Lichter, StageEnvironment-Modelle, Kamera, DanceFX und die V350-Fotogalerie werden weiterverwendet. Es gibt **keine zusätzliche WebGL-Szene, keinen Worker und keine zusätzliche Render-Schleife**.

## Genreprofile

| Genre | Standard-Stil (wenn „Classic“ gewählt) | Regie |
|---|---|---|
| Deutschrap / Hip-Hop (auch Rap, Trap, Drill) | White Showroom | Warmes Orange/Lila, lesbare Verse, kontrollierte Kamera |
| Hardstyle | Festival | Breite Licht-Beams, betonter Drop, kräftige FX |
| Hardtekk | Cyberpunk | Industrieller Rave, Magenta/Türkis, dynamische Drop-Akzente |
| Techno | Neon Club | Dunkler Club, pulsierende Lichter, ruhigere Kamera |
| Rock / Metal | Rock Arena | Warmes Gegenlicht, deutliche Refrains |
| Ambient | Cosmic Galaxy | Weiche Farben, reduzierte Bewegung |
| Pop | Vaporwave Sunset | Farbige Bühnenfarben, eingängige Hook-Akzente |

Die Profile wählen bereits vorhandene `StageEnvironment`-IDs und drei vorhandene Lichtfarben (Primär-, Sekundär- und Glowfarbe). Es wird **keine neue Bühne geladen** und es werden keine Choreografie-Dateien umgeschrieben. Die automatischen Moves stammen weiterhin aus dem vorhandenen Dance Director.

## Prioritäten und Zusammenarbeit

1. **Manuelle Live-Kamera-Edits, gespeicherte Kamerafahrten/Keyframes und Studio-Kameramodi** behalten absolute Priorität. V352 beeinflusst nur die Automatik. V351-Sicherheitsgrenzen bleiben erhalten.
2. **Manuell gewählte Bühnen-Presets** bleiben standardmäßig aktiv. Der Genre Director kann `Classic` automatisch ersetzen. Über die explizite Option „Auch bewusst gewählte Bühnen-Presets überschreiben“ darf er weitere Stages ersetzen.
3. **V351-Lyrics-Schutz und Abstände** bleiben vorrangig. Genre-Licht- und FX-Spitzen werden bei aktivem Text nicht über die V351-Grenzen angehoben.
4. **Licht-Timelines** und Blackouts werden nicht geändert. Die neuen Intensitätsfaktoren wirken auf die bereits berechneten Licht-Cues. Die bestehende Timeline-Farbwahl hat weiterhin Vorrang, wenn ein Cue eine konkrete Farbe enthält.
5. **Fotos** erhalten zusätzliche begrenzte Bewegung/Deckkraft. Die Regel greift auch dann, wenn V351 abgeschaltet ist. V350 und V351 werden nicht überschrieben.
6. **Pause und Reduced Motion** verhindern zusätzliche genrebedingte Foto- und Kamerabewegung. Hardware-Tiers und vorhandene FX-Schalter werden beachtet. V352 aktiviert keine abgeschalteten DanceFX eigenmächtig.
7. **Unbekanntes Genre:** neutraler Durchlauf. Keine Vermutung anhand bloßer BPM-Werte.

Die Cue-Stärke richtet sich nach Songabschnitt (Intro/Verse/Build-up/Hook/Drop), Beat-Akzent, Wiedergabestatus und globaler Intensität. Die Regie verstärkt oder dämpft lediglich vorhandene Licht-/Foto-/FX-Parameter. Es handelt sich nicht um eine KI-basierte Bilderkennung oder eine garantierte pixelgenaue Überlappungskorrektur.

## Bedienung

`Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V352 – Genre Visual Director`

- **Automatisch**: Verwende das von der vorhandenen Genre-Erkennung gelieferte Genre.
- **Manuell**: Wähle einen der sieben Stile, unabhängig von den Spotify-Metadaten.
- **Aus**: Keine Genre-Eingriffe.
- **Inszenierungsstärke**: Regelt die relativen Licht-, Kamera-, Effekt- und Medien-Cues.
- **Automatische Stage-Wahl**: Auf der Classic Stage aktiv, gespeicherte alternative Presets werden standardmäßig nicht überschrieben.
- **Vorschau-Simulator**: Wechsel zwischen Genre, Musikabschnitt, Lyrics/Audio-Zustand und Ausgangsbühne. Keine zweite 3D-Szene notwendig.

Nur die **Regie-Einstellungen** werden in `localStorage` gespeichert: `sonic-genre-visual-director-v352`. Es werden keine Songs, Künstlerfotos, Lyrics oder Avatardaten persistiert. Eine versehentliche Einstellung lässt sich jederzeit zurücksetzen.

## Dateien

- `services/stageContent/genreVisualDirectorV352.ts`: reine Genreerkennung/Normalisierung, Profilkatalog, Regie-Cue, V351- und Fotokoordination.
- `components/visualizer/GenreVisualDirectorSettingsV352.tsx`: Schalter, Slider, farbiger Simulator.
- `components/visualizer/ThreeAvatar.tsx`: einmalige Entscheidung für die gesamte R3F-Bühne, Weitergabe an alle beteiligten Komponenten.
- `components/visualizer/SmartStageCameraV236.tsx` und `StageCameraDirectorV289.tsx`: genreabhängige Automatik, mit manueller Priorität.
- `StageContentScreenV330.tsx`, `StageContentScreensV333.tsx`: Genre-Foto-Cue nach V350/V351.
- `GalleryPreviewEditorV343.tsx`, `app/globals.css`: UI-Integration.
- `tests/v352-genre-visual-director-regression.cjs`: 7 Genreprofile, Prioritäten, Pause, persistente Einstellungen, SSR, Zusammenspiel mit V351 und Stage-Integration.

## Überprüfung

- `npm run test:v352`: erfolgreich.
- `npm run test:v351` und `npm run test:v350`: erfolgreich.
- `npm run verify:offline`: 95 von 95 Offline-Prüfschritten erfolgreich (einschließlich TS/TSX-Syntaxprüfung).
- `node scripts/run-offline-regression-v352.cjs`: führt dieselben Prüfungen unabhängig voneinander aus, zeigt alle Fehler gesammelt.
- `npm run build:preflight`: blockiert, da die hochgeladene Projektbasis `node_modules` und `package-lock.json` nicht enthält und die 14 erforderlichen npm-Pakete nicht zur Verfügung stehen. Deshalb sind ein TypeScript-Semantik-Check (`tsc --noEmit`) und `next build` **hier nicht verifiziert**. Das ist kein behaupteter erfolgreicher Produktionsbuild.

Auf einem Rechner mit npm-Zugriff:

```sh
npm install
npm run test:v352
npm run verify
```

**V353–V355 sind weiterhin geplante Releases**, nicht Teil dieses ZIPs: Visual Effects Studio, Show Timeline Editor und Performance/Stability für 10-Zoll-Touchscreens und Raspberry Pi.
