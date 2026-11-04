# V533 – Erweiterbare Motion-Bibliothek & Qualitätsprüfung

Basierend auf V532, ohne die bestehende GLB-/Motion-Verwaltung zu ersetzen.

## Weitere Animationen später importieren

In **Einstellungen → Character & Motion Library** können jederzeit zusätzliche Motion-GLBs importiert werden. Die bisherige Auswahl wird nicht auf 20 Clips begrenzt. Zum Schutz des Browsers sind maximal 64 Clips pro Quelldatei in einem Batch möglich; bei mehr Clips mehrere Dateien oder kleinere Batches verwenden. Bis zu 30 GLB-Dateien pro Auswahl sind möglich, wie bisher.

Für bestehende Avatare **„Motions nur zur Bibliothek hinzufügen“** auswählen. So bleibt die bisherige aktivierte Animation bzw. vorhandene Choreografie unangetastet. Optional **„Alle Clips einer Motion-GLB importieren“** auswählen: Die Animationen werden einzeln als GLB exportiert, hochgeladen und als Motion-Bibliothekseinträge vermerkt. Die lokale Bibliothek kann bis zu 250 Einträge in der bisherigen Store-Version behalten; zusätzliche Skalierung erfordert eine eigene serverseitige Bibliothek.

Die Dateien bleiben dem ausgewählten Avatar zugeordnet. Eine globale Cross-Avatar-Motion-Bibliothek und echtes Retargeting sind **noch nicht** implementiert. Bei anderen Skeletten ist der bestehende heuristische Rig-Abgleich Pflicht; „teilweise passend“ garantiert kein fehlerfreies Abspielen.

## Motion Quality Inspector

Nach „Clips und Rig prüfen“ im Motion-Import wird über **„Ausgewählten Clip auf Sprünge und Fußbewegungen prüfen“** die bereits bestehende `analyzeGLBMotionClip`-Diagnose für genau den aktuell ausgewählten Clip ausgeführt. Die Auswertung weist beispielsweise auf Sprünge, außergewöhnlich schnelle Translationskurven und mögliche Fußverschiebungen hin. Sie basiert auf begrenzten Stichproben aus Track-Keyframes, liest nichts aus Spotify und ist keine automatische optische Qualitätsbewertung.

Im 3D-Viewer müssen Ergebnisse weiterhin anhand der tatsächlichen Bewegung beurteilt werden. Die Importdatei bleibt unverändert und die Clips werden erst beim bestätigten Installationsklick gespeichert.

## Kompatibilität und Grenzen

- Alle V529–V532-Importwege und die freiwillige V531-Speicheroptimierung bleiben bestehen.
- Manuelle Motion-Aktivierung bleibt der Standard; neue Importoptionen sind opt-in.
- Bei aktivem Bibliotheksmodus ersetzt der Upload keine aktive Motion und löst keine Änderungen der Choreografie aus.
- Teilweise erfolgreiche Sammeluploads sind nicht atomar. Die bereits hochgeladenen Clips bleiben bestehen, wenn ein späterer Clip fehlschlägt.
- Der Browser-Store speichert maximal 250 Motion-Einträge; diese Grenze ist bewusst angegeben statt als „unbegrenzt“ versprochen.
- Ein visueller Test auf dem Raspberry Pi und der vollständige Next.js-Build bleiben gesondert notwendig.

## Validierung

`npm run test:v533`, `npm run test:v533:types`, `npm run test:v532`, `npm run test:v531`, `npm run test:v530`, `npm run test:v529`, `npm run check:syntax`, `npm run check:architecture`.
