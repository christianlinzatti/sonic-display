# V855 · Spotify History Studio

Aufbauend auf V854: ein durchsuchbarer Verlauf der lokalen Spotify-History (V701) im Tab „Archiv“. Das bestehende Spotify-Connect-Panel, die Playlists, das Last.fm-Archiv und alle vorhandenen Exportdatenformate bleiben unangetastet.

## Bedienung

- Im Hörverlauf das **lokale Spotify-Archiv** aktivieren, wenn noch keines existiert. Spotify liefert keine vollständige rückwirkende Hörhistorie. Optional nur mit Einwilligung automatisch sichern.
- Im **History Studio** nach Titel, Künstler oder Album suchen (mehrere Begriffe, unabhängig von Groß-/Kleinschreibung und Akzenten).
- Optional den Zeitraum nach *lokalem Kalendertag* eingrenzen, nur mehrfach gehörte Songs anzeigen oder die Sortierung umkehren.
- Chronologischen Verlauf in Tagesgruppen anzeigen (35 Einträge pro Seite), direkt in Spotify öffnen oder die **gefilterten** Treffer als CSV (Excel-kompatibel, Semikolon, UTF-8-BOM) herunterladen.
- JSON-Export / JSON-Import / Löschbestätigung des bestehenden Archives bleiben wie bisher.

## Datenschutz & Grenzen

- Kein neuer API-Endpunkt und kein Tracking zusätzlich zur vorhandenen optionalen V702-Aufzeichnung.
- Die Filterung findet ausschließlich clientseitig statt. Die CSV wird nur auf expliziten Klick heruntergeladen.
- CSV-Felder erhalten Schutz gegen Formeleinschleusung. Es werden ausschließlich die erlaubten Track-Metadaten ausgegeben, keine Spotify-Zugangsdaten.
- Wiederholungen werden innerhalb des gewählten Zeitraums gezählt; Suchbegriffe ändern diese Bezugsmenge nicht.
- Die Statistiken spiegeln **erfasste** Ereignisse wider, weder alle Spotify-Hörereignisse noch volle Hörminuten.

## Verifikation

`npm run test:v855` und `npm run test:v855:types` sowie die bestehenden Syntax-, Architektur- und Versionsregressionstests. Vor Freigabe zusätzlich `npm ci`, `npm run typecheck`, `npm run build` mit vollständigen Abhängigkeiten und ein manueller Browser-/Touch-Test.

## Ausgeführte Prüfungen in der Erstellungsumgebung

- Erfolgreich: V855-Funktionstests, V855-Core- und UI-Typechecks, V849–V854-Regressionstests, relevante V701-Archivtests sowie Quellcode-Syntax und Architekturprüfung.
- Der vollständige `npm run typecheck` wurde ohne abschließendes Resultat durch das Zeitlimit beendet. Er ist **nicht freigegeben**.
- Der `npm run build` konnte den Next.js-Build nicht abschließen. Im Build-Lauf liefen zunächst alte Prebuild-Tests; das lokale `next`-Paket ist nicht installiert. Ein echter Produktionsbuild und die Touch-/Spotify-Prüfung bleiben **offen**.
