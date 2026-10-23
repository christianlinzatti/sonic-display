# Sonic Display V408 – Interactive Rap Performance Editor

Basis: V407 Rhythm-Aware Rap Performance, inklusive V406 Coordinated Rap, V405 Word Articulation und V404 QA.

## Bedienung

1. Einstellungen → **Anzeige** → **V408 · Rap Performance Editor öffnen**.
2. In der separaten **schematischen 3D-Vorschau** einen Abschnitt (Verse/Hook) wählen und Demo starten oder pausieren.
3. Kopfbewegung, Gesten, Verse- und Hook-Dynamik, Kick-/Snare-Akzente und Lip-Sync unabhängig auf 0–150 % stellen.
4. **Editor-Werte auf die Live-Show anwenden** aktivieren. Ohne Häkchen bleibt die Live-Performance unverändert. Die Regler wirken sofort und werden mit den normalen UI-Einstellungen im lokalen Browser-Speicher gespeichert. Zurücksetzen auf 100 % stellt das V407-Verhalten wieder her.

Die 3D-Demo zeigt einen prozeduralen Platzhalter-Avatar mit **ausdrücklich simulierten** Beat-Impulsen. Es ist **keine** exakte Voransicht eines heruntergeladenen GLB-Rigs und kein echter Karaoke-/Mikrofon-Sync. Bei reduzierter Bewegung stoppt die Demo. Das separate Vorschau-Pause-Element pausiert **nicht** die laufende Musik/Show.

## Live-Integration

- `rapPerformanceEditorV408.ts`: validierte, begrenzte pure Gain- und Lip-Sync-Berechnung, Defaults, Normalisierung zur Kompatibilität mit gespeicherten Einstellungen.
- `rapRhythmPerformanceV407.ts`: zusätzliche Wort-/Kick-/Snare-Gains nur **nach** V407-Sicherheits-/Rollenprüfung. Der Editor kann keine erfundenen Drum-Onsets erzeugen, keine stummen Sänger aktivieren und keine importierten Bewegungen überstimmen.
- `ThreeAvatar.tsx`: identische Editorwerte für prozedurale Avatare und GLTF-/R3F-Avatare. Choreography-Modus, Partner-IK und manuelle Motion-Clips behalten Vorrang.
- `VisualizerStage.tsx`: Lip-Sync-Wert multipliziert die bestehende Mundintensität von V367 und ist auf 0–150 % begrenzt; sonst keine Änderung des synchronisierten Lyrics-Timings oder der bilabialen Mundverschlüsse. Das ist ein Intensitätsregler, **keine** Phonemerkennung.
- `UiPreferencesContext.tsx` / `types/music.ts`: persistente Konfiguration unter dem bereits verwendeten UI-Preferences-Key; defensive Normalisierung älterer und beschädigter Werte. Keine neue Server-Route oder externe API.
- `RapPerformanceEditorPanelV408.tsx`: dynamisch nachladbare Benutzeroberfläche mit 3D-Canvas, Verse/Hook-Test und sieben Slidern. Eindeutig benannt, damit auf Windows keine TS/TSX-Dateinamenkollision entsteht.

## Überprüfung

- `npm run test:v408` – Reaktionsgains, 100%-Neutralität, deaktivierter Editor, Lip-Multiplikator, Persistenz-Anbindung, Pausen, Rollen, manuelle Choreografien, Audio-Provenienz, Zahlenbegrenzung und beide Avatar-Pipelines.
- `npm run check:syntax`, `npm run test:module-case`, `npm run test:v404` – Syntax, Dateinamen, Imports und kritische Regressionstests.
- `npm run verify` – vollständige Offline-Regression, Typecheck und Next.js-Build auf einem Rechner mit installierten Abhängigkeiten.

## Voraussetzungen und Grenzen

Für gemessene Kick-/Snare-Reaktionen muss die bestehende Mikrofonanalyse aktiv sein; der Editor ergänzt keine zusätzlichen Audiozugriffe. Der V404-/V407-Schutz für Pausen, Sängerrollen, fehlende Wort-Timings, reduzierte Bewegung und manuelle Bewegungen bleibt aktiv. Vollständiger TypeScript-/Next.js-Build und visuelle Tests mit echten GLB-Avataren sind erst nach `npm install` möglich.
