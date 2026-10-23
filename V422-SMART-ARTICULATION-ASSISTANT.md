# Sonic Display V422 – Smart Articulation Assistant

## Neu in V422
Eine **optionale Bearbeitungshilfe im vorhandenen V420-Editor** analysiert die **berechnete V419-Mundform** für ein ausgewähltes, echt wortzeitgestempeltes Lyrics-Wort. Bei kurzen Wörtern und/oder stärkeren Wechseln von Kieferöffnung, Lippenbreite oder Rundung werden bis zu zwei Vorschläge angezeigt:

- **Weichere Übergänge:** fünf geglättete, editierbare Mundform-Keyframes aus dem bestehenden V419-Verlauf.
- **Zurückhaltendere Artikulation:** geringere Ausschläge als zusätzliche Variante für sehr kurze bzw. schnelle Wörter.

Die Vorschläge werden direkt in die bestehenden V420-Regler geladen, können vor dem Speichern geändert und mit der V421-A/B-Anzeige verglichen werden. Die GLB-Vorschau zeigt wie in V421 den Kieferkanal.

## Verwendung
1. Spotify-Titel mit echten *Wortzeitstempeln* abspielen.
2. Einstellungen → Anzeige → Rap Performance Editor → V420 Visual Syllable Articulation Editor.
3. Ein Wort auswählen. Im V422-Abschnitt erscheinen ggf. Beobachtungen und Vorschläge.
4. **Als ungespeicherten Entwurf im A/B-Vergleich testen** auswählen, bei Bedarf Keyframes anpassen.
5. Nur wenn das Ergebnis gefällt, ausdrücklich **Mundformen speichern** anklicken. V420-Live-Schalter und V419-Artikulation bleiben weiterhin unabhängig.

## Sicherheit und Grenzen
- Die Erkennung nutzt nur **vorhergesagte Mundbewegungen und vorhandene Wortzeitstempel**. Sie misst weder gesprochene Phoneme noch Audiosignale oder Bild-Latenz. Eine gefundene Auffälligkeit ist **keine nachgewiesene Qualitätsabweichung**; ein Vorschlag ist nicht automatisch besser.
- **Keine automatische Speicherung, keine Spotify-Seek-Operation und keine Änderung von Avatar-, Kamera- oder Tanzsteuerung.** Die V420-B/P/M-Verschlusssicherung greift unverändert bei der Live-Verarbeitung.
- Existiert für das Wort bereits eine **gespeicherte manuelle Korrektur**, liefert V422 keine Vorschläge. Besteht ein ungespeicherter eigener Entwurf, muss er vor dem Laden eines Vorschlags zuerst bewusst zurückgesetzt werden.
- Validierung der Wort- und Trackidentität, begrenzte Zeitdauer (bis 2,1 Sekunden), begrenzte Zahl von Keyframes und Wertebereich 0–1. Bei Lyrics nur mit Zeilenzeitstempeln wird keine erfundene Wortanalyse ausgegeben.
- Der Editor bleibt eine lokale UI-Funktion: V422 aktiviert **keine** Live-Artikulation automatisch. Gespeicherte Vorschläge sind normale V420-Edits und folgen deren bestehenden Schutz- und Aktivierungsregeln.

## Technische Integration
- `components/visualizer/rapArticulationAssistantV422.ts` – reine, deterministische Heuristik. Verwendet `compareRapArticulationWordV421` auf einem Dokument ohne Korrekturen. Unabhängige Vorschläge mit 5 V420-Keyframes; begrenzte Änderungen und Normalisierung.
- `components/visualizer/RapArticulationAssistantPanelV422.tsx` – klar gekennzeichnete Vorschlagsanzeige und Vorschau-Schaltflächen.
- `components/visualizer/RapSyllableTimelineEditorV420.tsx` – nur ungespeicherte Editorübernahme, bestehende Save/Reset-Bedienung und A/B-Vorschau bleiben erhalten.
- `tests/v422-smart-articulation-assistant-regression.cjs` – Identität, Determinismus, Grenzwerte, Schutz existierender Bearbeitungen und UI-Verkabelung.

## Windows
```powershell
npm install
npm run test:v422
npx tsc --noEmit
npm run build
```

Ein vollständiger Next.js-Produktions-Build ist in der Erstellungsumgebung mangels npm-Abhängigkeiten nicht nachgewiesen.
