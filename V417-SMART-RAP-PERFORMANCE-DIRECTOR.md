# Sonic Display V417 – Smart Rap Performance Director

## Neue Funktion

V417 erstellt **bearbeitbare visuelle Szenenvorschläge** aus **existierenden synchronisierten Lyrics-Zeitstempeln**. Die bestehenden Live-Pipelines für Rollen, Mund, Gesten und Kamera werden weiter über V416 angesteuert. Es gibt **keine automatische Erkennung von Künstlern, echten Sängern oder Stimmtrennung**; die Muster sind bewusst beschriftete Heuristiken, keine Audioanalyse.

- **Hook-Hinweis**: mindestens **zwei aufeinanderfolgende, längere Textzeilen** treten an **mindestens zwei hinreichend getrennten Stellen** erneut auf. Eine einzelne Textwiederholung reicht nicht aus.
- **Frage/Antwort-Hinweis**: innerhalb einer ausreichend langen Zeile steht ein Fragezeichen mit weiterem Text danach; optionaler *künstlerischer* Call-&-Response-Wechsel bei 62 % der Zeile, wie bereits in V416. Dies behauptet ausdrücklich **nicht**, den tatsächlichen Gesangswechsel zu erkennen.
- **Verse-Phrasen**: zeitlich benachbarte Textzeilen werden zu Gruppen mit höchstens vier Zeilen und 14 Sekunden Länge gebündelt. Die vorgeschlagenen Avatare wechseln über die Phrasen, nicht über eine vermeintlich erkannte Stimme.
- Ein Vorschlag enthält Szene (`Solo`, `Call & Response`, `Duett`, `Hook`), Lead-/Partner-Avatar, Gestenstärke und eine begründete *heuristische* Einstufung. Duette können explizit im Vorschlag ausgewählt werden; V417 erkennt keine echten Duettstellen automatisch.

## Bedienung

1. Spotify-Titel mit synchronisierten Lyrics öffnen und eine Bühne mit 2–4 Avataren auswählen.
2. **Einstellungen → Anzeige → V416 Multi-Avatar Rap Duet Studio → V417 Smart Rap Performance Director** öffnen.
3. Auf **Lyrics analysieren und Szenen vorschlagen** klicken.
4. Jeden Vorschlag durchsehen, bei Bedarf Szenentyp, Lead, Partner und Stärke bearbeiten, die Zeitposition prüfen oder Vorschlag verwerfen.
5. **Übernehmen** je Vorschlag oder **ausgewählte Szenen übernehmen** klicken. Erst dies schreibt Daten in den bestehenden `rapDuetAssignmentsV416[trackId]`-Store. Der Vorschlagsgenerator selbst speichert nichts.
6. Die **V416-Live-Option** separat und ausdrücklich aktivieren, um die bereits gespeicherten Rollen im Bühnenbetrieb zu verwenden.

### Prioritäten und Sicherheit

- Die Vorschlagsansicht ist zunächst eingeklappt. Es gibt keine stillschweigende automatische Übernahme oder Aktivierung.
- Vorhandene V416-Szenen werden **nicht überschrieben**; bereits belegte Lyrics-Bereiche werden nicht vorgeschlagen. Gleichzeitig kann man denselben Vorschlag nicht doppelt übernehmen.
- Vorhandene manuelle V385-Stimmenzuweisungen, manuelle Kamera-Keyframes und V412-/V414-Choreografien behalten ihre bisherigen Prioritäten.
- Pro Titel maximal 150 gespeicherte V416-Szenen, maximal 40 Vorschläge je Auswertung. Neue Daten werden gegen Zeilenindex und Avataranzahl validiert.
- Kein Vorschlag bei ungetimten Lyrics, unsortierten Zeitstempeln oder nur einem Avatar. Vorschläge sind titelgebunden und der Editor wird beim Titelwechsel zurückgesetzt.
- Der Zeitpositions-Vorschauregler verändert **nicht** die Spotify-Wiedergabe.
- Der in der UI angezeigte Prozentwert ist nur eine heuristische Klassifizierung, **keine statistisch kalibrierte Wahrscheinlichkeit**.

## Technische Struktur

- `components/visualizer/smartRapPerformanceDirectorV417.ts`: reine Vorschlags-, Editier- und sichere Übernahmefunktionen.
- `components/visualizer/RapSceneSuggestionsPanelV417.tsx`: nutzerkontrollierte Editor-Oberfläche mit Einzel- und Mehrfachübernahme.
- `components/visualizer/RapDuetStudioPanelV416.tsx`: Einbindung im vorhandenen V416-Editor; Track-Persistenz bleibt unverändert.
- `tests/v417-smart-rap-director-regression.cjs`: deterministische Heuristiken, Prioritäten, V416-Integration, Datenvalidierung und Bedienung.
- `tests/tsconfig.v417-core.json`: isolierte Strict-TypeScript-Prüfung des Kernmoduls.

## Prüfen unter Windows

```powershell
npm install
npm run test:v417
npx tsc --noEmit
npm run build
```

Eine vollständige Next.js-Produktionskompilierung wird nur mit den Projektabhängigkeiten auf dem Zielrechner verifiziert. Ohne npm-Abhängigkeiten werden die isolierten Qualitätsprüfungen durchgeführt.
