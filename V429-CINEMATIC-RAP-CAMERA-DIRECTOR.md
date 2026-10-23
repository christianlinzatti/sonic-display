# V429 – Cinematic Rap Camera Director

## Ziel und Einsatz

Die in V425 nur angezeigte Kameraenergie wird als **explizit einschaltbares, sehr kleines Framing-Signal** in die bereits vorhandene `StageCameraDirectorV289` eingebunden. Es gibt **keine zusätzliche Kamera, kein eigenes WebGL-Canvas und keine dauernden React-State-Updates pro Renderframe**. V426-Qualitätsprüfung und 3D-A/B-Vorschau bleiben erhalten.

## Funktionen

- **Songgebundene Regie:** Verwendet dieselben V416-Zeilen- und Rapper-Zuordnungen wie V425. Szenen: `solo-close` (dezenter Zoom), `reply-side` (leichter Rollen-/Seitenwechsel), `duet-wide` (leicht zurückgezogene Gruppenansicht), `hook-push` (langsame Annäherung). Voraussetzung sind synchronisierte Lyrics, aktuelle Track-ID und gültige V416-Zuordnung zu zwei oder mehr Performance-Slots. Keine KI-Stimmenerkennung.
- **Unabhängige Aktivierung:** Neue Preferences `rapCameraEnabledV429=false` und `rapCameraStrengthV429=65`. V425-Gesichts-/Gesten-Live-Regie muss hierfür **nicht** eingeschaltet sein. Mit Stärke 0 entsteht kein zusätzlicher Kameraeffekt.
- **Beat-/Phrasen-Stabilität:** Deterministische Mindesthaltedauer von 1,1 Sekunden bzw. 1,4 Sekunden für Hooks. Auf Pause, Sprünge in der Spotify-Zeitachse oder Trackwechsel wird sofort reagiert; es wird kein unabhängiger Wandzeit-Timer gestartet.
- **Kleine, räumlich begrenzte Komposition:** Sicherer Mindestabstand bei einer automatisch gerahmten Kamera, begrenzter FOV und automatische Reduktion der Bewegung bei eingeblendeten/geschützten Lyrics. Bestehende Live-Kamera-Interpolation übernimmt die weichen Übergänge.
- **Bestehende Steuerung gewinnt:** Kein Overlay bei manuellem Eingriff, gespeicherten Kamera-Presets und Live-Edits, V354-Show-Timeline, V400-Kamera-Keyframes, V398-Kameraprofilen, V306-Show-Kameraplanung und manuell priorisierter Bühnenregie, aktiven V377-/V397-/V401-Kameraaufnahmen oder Konzert-/Festival-Kamera-Cues. Bei `reducedMotion` bleibt V429 inaktiv.
- **Nur Vorschau im Einstellungsdialog:** Zeit-Slider zeigt den geplanten Shot und die Stärke an; weder Spotify-Position noch Bühnenkamera werden durch den Slider geändert.

## Wo ein-/ausschalten?

**Einstellungen → Anzeige → Rap Performance Editor → V425 Expressive Rap Performance Director → V429 Cinematic Rap Camera Director.**

Der Kameraeffekt wird ausschließlich bei aktivierter Option und vorhandener V416-Rap-Rollenzuordnung eingesetzt. Die bestehenden, gespeicherten Kamera-Keyframes werden weder verändert noch überschrieben.

## Technische Dateien

- `components/visualizer/cinematicRapCameraV429.ts` – reine Planung, Timeline-Hold und Camera-Pose-Komposition
- `components/visualizer/expressiveRapDirectorV425.ts` – ergänzte Zeilen-/Rollen-/Zeitmetadaten
- `components/visualizer/VisualizerStage.tsx` – unabhängiges Rap-Kamerasignal aus der Spotify-Lyrics-Zeitbasis
- `components/visualizer/StageCameraDirectorV289.tsx` – konservativer, nachrangiger Kamera-Overlay
- `components/visualizer/ThreeAvatar.tsx` – Kamera-Director bleibt während eines Tracks mit gespeicherten Szenen stabil gemountet, damit zwischen Lyrics-Zeilen kein Kamerasprung durch Rendererwechsel entsteht
- `components/visualizer/ExpressiveRapDirectorPanelV425.tsx` – Controls und nicht-invasive Diagnose
- `types/music.ts`, `context/UiPreferencesContext.tsx`, `components/visualizer/registry.tsx` – typed preferences und Props
- `tests/v429-cinematic-rap-camera-regression.cjs`, `tests/tsconfig.v429-core.json` – Offline-Regressionen und strenge isolierte Typprüfung

## Prüfen

```powershell
npm install
npm run test:v429
npx tsc -p tests/tsconfig.v429-core.json
npm run check:syntax
npm run test:imports
npx tsc --noEmit
npm run build
```

## Grenzen

Die Kamerabewegung reagiert auf **manuell gespeicherte Regiecues**, nicht auf erkannte Lyrics-Emotionen, tatsächliches Audio oder Künstler in einer Audioaufnahme. Sie beeinflusst nicht selbstständig die Tanzgesten oder Lippenbewegungen. Ohne die für einen Produktions-Build notwendigen Next.js- und R3F-Abhängigkeiten sind Browser-/GPU-Eindruck und die Echtzeitframerate nicht abschließend geprüft.
