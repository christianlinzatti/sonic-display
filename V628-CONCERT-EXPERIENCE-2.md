# V628 – Concert Experience 2.0

## Ziel

Eine aus einem Guss wirkende automatische 3D-Show über den **gesamten, nachgewiesen unterteilten** Song. Die Ergänzung ist bewusst ein Finishing-Pass und kein neues, konkurrierendes Show-System.

## Was ist tatsächlich eingebaut?

- **Eine gemeinsame V628-Regie**: `components/visualizer/concertExperienceV628.ts` kombiniert den vollständigen verifizierten V604-Songbogen mit dem aktuellen V623-Konzert-Cue. Der bestehende `VisualizerStage.tsx` übergibt das Ergebnis weiterhin als `concertDramaturgyV623` an alle vorhandenen Verbraucher (Tanz, Kamera, Lyrics, Licht/Stage).
- **Sechs Bühnenmotive**: Die verifizierten Motive `portrait`, `dialogue`, `ensemble`, `wide`, `breath` und `crescendo` erhalten kleine, unterschiedliche, musikalisch begrenzte Gewichtungen. „Close-up“ ist dabei ein Prioritätslabel, **kein** neuer Kameraschnitt und **kein** erfundener Sänger.
- **Variierende wiederholte Hooks**: Die Wiederholungsnummer moduliert den Fokus in einem engen Rahmen (Gruppenenergie gegen Performer-/Lyrics-Fokus). Keine zufälligen Schritte, keine frei geschätzten Zeitpunkte und keine zusätzlichen Animationen.
- **Sanfte Übergänge**: Der V604-Übergangsfaktor und ein kontinuierliches Songakt-Fenster blenden die **zusätzliche** Modulation zu den Abschnittsgrenzen aus; das bestehende Haupt-Framing bleibt maßgeblich.
- **Starke Vorrangregeln**: Aktive Lyrics, Sängerfokus, manuelle Tanz-, Kamera- und Lichtvorgaben sowie Low-Tier, Pause und reduzierte Bewegung werden respektiert. Nicht gemessene Drops können dadurch keine zusätzliche Tanzenergie erhalten.
- **Diagnostik**: Die bestehende Bühnen-Root zeichnet das aktuelle `data-v628-moment`, `data-v628-motif` und `data-v628-repetition` auf. Diese Metadaten repräsentieren nur verifizierte Songabschnitte.

## Grenzen

Kein neuer LED-Shader, Lichtstrahl, GPU-Renderer, Stage-Modell, GLB-Animationsclip, Lip-Sync-/Phonemdetektor oder automatisches Audio-Stem-Separieren. Die Qualität einer echten Aufführung kann nicht aus synthetischen Unit-Tests bewiesen werden. V627 misst Qualitäts-/FPS-Indikatoren nur in wirklich getesteten Szenen. Echte GLB-/Lyrics-/Spotify-Browserabnahme und der vollständige Next.js-Build sind außerhalb dieser Quellcode-Prüfumgebung weiterhin erforderlich.

## Tests

`npm run test:v628`, `npm run test:v628:types`, `npm run test:smoke:v628` und `npm run verify:v628`.

Nach `npm install` zusätzlich `npx tsc --noEmit` und `npm run build` auf dem Windows-Rechner.
