# V424 – Avatar Facial Calibration Studio

V424 erweitert das **vorhandene V370/V383 Gesichtsanimations-Studio**. Statt bereits vorhandene Namenserkennung und die manuelle Zuordnung zu duplizieren, schätzt V424 die geometrische Verformungsstärke kompatibler GLB-Morph-Targets ab und schlägt vorsichtige Intensitäten vor. Das ist **keine** echte anatomische Messung, keine visuelle Bewertung des Avatars und keine Phonem- oder Sprachlauterkennung.

## Bedienung

1. **Einstellungen → Anzeige → Advanced Facial Animation Studio** öffnen.
2. Einen installierten GLB-Avatar auswählen. V370 scannt Morph-Targets und erzeugt eine **eigene Vorschau-Kopie** des GLB, die das eigentliche Asset nicht verändert.
3. Im Abschnitt **V424 · Geometry-aware Facial Calibration** die gemessenen Morph-Verformungen, Zuordnungen und vorgeschlagenen Verstärkungen lesen. In den Vorschlägen werden standardmäßig nur Morph-Targets mit hochsicherer *Namenszuordnung* berücksichtigt, oder ein vorhandenes explizit zugewiesenes Morph Target.
4. Gewünschte Kanäle auswählen und auf **Ausgewählte V424-Kalibrierung übernehmen** klicken. Die bestehenden V370-Profile speichern die Kanalintensitäten dauerhaft unter der jeweiligen Avatar-ID; dieselben Werte werden von der Live-GLB-Gesichtsanimation verwendet.
5. Die Probeformen **A/AH, E/I, O/U, M/B/P** und die GLB-Einzel-Morph-Vorschau testen und bei Bedarf die vorhandenen Schieberegler korrigieren. Der vorhandene V383-Profil-Export ermöglicht Sicherung/Wiederherstellung.

## Algorithmen und Schutzmaßnahmen

- Positionale Vertex-Deltas, absolut oder relativ je nach `geometry.morphTargetsRelative`, werden auf maximal 1.024 gleichmäßig verteilten Mesh-Vertices pro Morph bewertet.
- Die mittlere quadratische Vertex-Verschiebung (RMS) wird durch die Mesh-Diagonale geteilt. Bei ungültigen oder fehlenden Positionsdaten entfällt ein Vorschlag.
- Für die Kanäle **jaw, wide, round und lipsClosed** wird ein vorsichtiger Richtwert mit **0,70–1,30x Gain** vorgeschlagen. Links-/Rechts-Morphs werden als gemeinsam angetriebene Gruppe betrachtet.
- V424 *erkennt keine neuen anatomischen Kanäle aus der Geometrie*. Eine Namenszuordnung oder bestehende explizite manuelle Morph-Zuordnung muss vorhanden sein.
- Bereits kalibrierte Gains und deaktivierte Kanäle werden standardmäßig übersprungen. Nur durch die Option **Bestehende manuelle Intensitäten ausdrücklich zur Neukalibrierung freigeben** können vorhandene Gains nach Auswahl geändert werden.
- Es wird **keine GLB-Datei geändert**, keine Netzwerkanfrage gesendet, kein Spotify-Audio gelesen und keine globale Lipsync-Einstellung überschrieben.
- Prozedurale Avatare haben keine GLB-Morph-Daten und können deshalb keine V424-Geometriekalibrierung nutzen.

## Dateien

- `components/visualizer/facialCalibrationV424.ts`: Vertex-Messung, vorsichtige Vorschläge, explizite Übernahme
- `components/visualizer/FacialAnimationStudioV370.tsx`: V424-Oberfläche und bestehende GLB-Vorschau
- `tests/v424-facial-calibration-regression.cjs`: echte Geometrie-Fälle, relative/absolute Morphs, fehlende Daten, manuelle Priorität
- `tests/tsconfig.v424-core.json`: isolierte TypeScript-Strict-Prüfung

## Lokal prüfen

```powershell
npm install
npm run test:v424
npx tsc --noEmit
npm run build
```

V424 funktioniert ohne neue npm-Abhängigkeiten. Ein vollständiger Next.js-Produktions-Build erfordert weiterhin die Pakete des Projekts.
