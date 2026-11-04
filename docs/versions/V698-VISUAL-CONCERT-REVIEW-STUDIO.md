# Sonic Display V698 – Visual Concert Review Studio

## Nutzung auf der vorhandenen Abnahme-Seite

Das Studio ist **direkt in `/acceptance`** unter der importierten V592-Bildvorschau integriert. Ein separater Login oder neue API ist nicht nötig. Die bis V697 vorhandenen sechs Profile, die manuelle V696-Prüfliste und deren `review.json`-Export bleiben unverändert.

1. Für eines oder mehrere V696-Szenarien `report.json` aus `artifacts/v696/captures/<profil>/` und danach die korrespondierenden `live-XX.png`-Dateien **lokal** in der V697-Ansicht öffnen.
2. V698 bietet nur tatsächlich im Browser geöffnete Bilddateien an. Screenshot **A** und **B** auswählen; Zeitmarke, Szenario, Abschnitt und Kameraeinstellung werden angezeigt. Zwei verschiedene Bilder benötigen exakt dieselbe Track-ID, Bildschirmauflösung und denselben Chromium-Aufnahmemodus. Vergleichbare Metadaten **belegen nicht** identische Hardware, GLB-Komplexität, Temperatur, Künstlerbewegung oder echtes WebGL.
3. Kategorie (Tanz/GLB, Lip-Sync, Lyrics, Kamera, Licht, Performance), Priorität und zwei Freitexte ausfüllen: **Beobachtung** und **konkrete nächste Maßnahme** mit jeweils mindestens 12 Zeichen. Die beiden Zeitmarken stammen aus den ausgewählten Berichten und können nicht durch Eingabetricks als automatisch geprüft markiert werden.
4. Optional einen bereits in dieser Browser-Origin gespeicherten **V694-Archivbericht desselben Songs** verknüpfen. V698 liest ausschließlich die V694-Historie und speichert lediglich die ID des gewählten Eintrags in seiner **eigenen** Notiz. V694-Daten werden weder überschrieben noch ergänzt. Wird die Originalhistorie später gelöscht oder das Gerät gewechselt, ist die Referenz eventuell nicht mehr auflösbar; das wird sichtbar angezeigt.
5. **Prüfnotiz hinzufügen**, anschließend bewusst **V698 lokal speichern**. Jeder Eintrag besitzt die Status `offen`, `in-arbeit` und `manuell-geprueft`, eine Kategorie, Priorität, Version V698 und beide Songpositionen. Statuswechsel erfordern ebenfalls bewusstes Speichern. Maximal 80 Einträge; ältere Einträge werden beim Überschreiten des Limits aus dem aktuellen Dokument entfernt, daher regelmäßig JSON sichern.
6. **V698-JSON exportieren** zum Gerätewechsel; **V698-JSON importieren** ersetzt nach einer ausdrücklichen Bestätigung den Editor-Inhalt. Der Import verlangt die exakte V698-Struktur und lehnt fehlerhafte, übergroße oder doppelte Einträge ab. JSON-Export ist **separat** vom V696-`review.json` und vom V694-Qualitätsarchiv.

## Datenschutz und Nachweisgrenzen

- Kein neuer Server-Endpunkt, keine Netzwerk-Anfrage, kein Upload an Spotify, keine Verarbeitung von Musikdateien und kein zusätzlicher GPU-Renderpass.
- Die von V697 erzeugten `blob:`-URLs und **Screenshot-Pixel** leben ausschließlich in der aktuellen Browser-Ansicht; nach einem Neustart stehen die gespeicherten **Metadaten und Notizen** wieder zur Verfügung, aber **keine PNG-Bilddaten**. Für eine erneute Gegenüberstellung Report und Original-PNGs erneut lokal auswählen. Die Archivdaten enthält keine Bilder, Audio, Lyrics-Texte oder Bildbytes.
- `localStorage` ist Ursprungs- und browsergebunden. Private-Browsing, Speicherbereinigung und geänderte Origin können Einträge löschen. Fehlerhafte gespeicherte JSON-Daten bleiben zunächst unangetastet, statt still überschrieben zu werden.
- Benutzerimport ist nicht automatisch vertrauenswürdig. Formate, Größen, Datenbereiche, Referenzen und Status sind strikt begrenzt. `evidenceVerified:false` und `automaticallyApproved:false` dürfen nie durch Import oder Bearbeitung zu `true` werden.
- Screenshot-Gegenüberstellung ist eine **menschliche Sichtprüfung**, keine automatische GLB-, PNG-CRC-, Lip-Sync-, FPS-, Kamera- oder Lichtqualitätsmessung. Das unabhängige `npm run audit:v696:collect` und `npm run audit:v695:release` bleiben für die echte technische Abnahme verpflichtend. Eine produktive Konzertfreigabe ist mit V698 allein nicht möglich.

## Tests und Builds

- `npm run test:v698` – reiner Datenkern mit 42 Prüfgruppen und 12.000 deterministischen invaliden Eingaben.
- `npm run test:v698:types` – isolierter strenger TypeScript-Check des V698- und QA-Datenkerns.
- `npm run test:v698:ui-types` – isolierter React-/JSX-Typcheck unter **test-only** Stubs; kein echter Next.js-Produktionscheck.
- `npm run test:quick` – aktuelle Versionsregressionen und Strukturprüfungen.
- `npm run typecheck` und `npm run build` – vollständige App-Abnahme nur mit echten installierten npm-Abhängigkeiten und regeneriertem `package-lock.json` sinnvoll möglich.

Details über die tatsächlich ausgeführten Schritte unter `V698-VERIFICATION.md`.
