# Sonic Display V421 – Articulation Comparison Studio

## Zweck
Direkter A/B-Vergleich der **automatisch geschätzten Mundbewegung aus V419** mit den **aktuellen (auch noch ungespeicherten) Keyframes aus V420** für genau ein zeitgestempeltes Lyrics-Wort. Bestehende V420-Änderungen und Live-Schalter bleiben erhalten.

## Bedienung
1. Einen Spotify-Titel mit **wortgenau synchronisierten** Lyrics abspielen.
2. Unter **Einstellungen → Anzeige → Rap Performance Editor → V420 Visual Syllable Articulation Editor** die V420-Timeline öffnen und ein Wort auswählen.
3. Im neuen Abschnitt **V421 · Automatisch / Korrigiert vergleichen** auf A oder B umschalten.
4. Den Vergleichszeitpunkt auf der Zeitachse verschieben. Die drei übereinandergelegten Kanäle zeigen Kieferöffnung, Lippenbreite und Rundung. **Gestrichelt = A (V419)**, **durchgezogen = B (V420)**.
5. Zwei schematische Mundformen und eine Tabelle geben für den ausgewählten Zeitpunkt konkrete A/B-Werte an. Mittlere und maximale absolute Formdifferenz beziehen sich auf alle gültigen Stichproben über das Wort.
6. Die vorhandene 3D-Avatar-Vorschau zeigt beim A/B-Wechsel den **jeweiligen Kieferkanal**. Die anderen zwei Kanäle sind bewusst nur in Grafik und Schema sichtbar; deren Darstellung auf dem echten GLB hängt von verfügbaren Morph-Targets ab.
7. Die ursprünglichen V420-Keyframes können weiterhin bearbeitet, gespeichert und gelöscht werden. Der A/B-Schalter selbst speichert nichts und schaltet die Live-Show nicht um.

## Architektur
- `components/visualizer/rapArticulationComparisonV421.ts` erstellt durch den bestehenden `resolveVocalPerformanceQualityV374` zwei **identisch getaktete** Vorhersagen pro Zeitstempel, einmal ohne und einmal mit V420-Keyframes. Keine zweite Live-Mund-Engine.
- `components/visualizer/RapArticulationComparisonPanelV421.tsx` visualisiert einen begrenzten Satz von 21 Stichproben, eine A/B-Tabelle und die schematische Mundgeometrie.
- `components/visualizer/RapSyllableTimelineEditorV420.tsx` integriert die neue Anzeige und bindet den A/B-Schalter ausschließlich an die lokale Kiefer-Vorschau.
- Zeitbasis und Schutzlogik übernehmen die vorhandenen V415-/V419-/V420-Regeln (einschließlich Mundoffsetbegrenzung, Pausen, Bilabialverschlüssen, Singer-Rollen und Track-/Wortidentität).

## Aussagekraft und Grenzen
- **Keine gemessene Lip-Sync-Qualität:** Die Formdifferenz misst nur, wie sehr zwei berechnete Animationen voneinander abweichen. Eine größere Differenz bedeutet ausdrücklich **nicht** automatisch eine Verbesserung.
- **Keine automatische Phonem- oder Sprechererkennung** und kein tatsächliches Audio-Latenzmessen.
- Die A/B-Auswertung verlangt echte Wortzeitstempel. Bei Zeilen-Lyrics oder unbekannter Wortidentität wird kein vorgetäuschter Vergleich berechnet.
- Es gibt keinen Einfluss auf Spotify-Position, reale Lyrics-Zeitstempel, Tanzclips, Rollen oder Bühnenkamera.

## Lokale Prüfung unter Windows
```powershell
npm install
npm run test:v421
npx tsc --noEmit
npm run build
```

Die npm-Abhängigkeiten sind nicht im ZIP enthalten. Der komplette Next.js-Produktionsbuild wurde in der Erstellungsumgebung mangels dieser Abhängigkeiten nicht ausgeführt.
