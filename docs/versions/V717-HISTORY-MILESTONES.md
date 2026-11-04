# Sonic Display V717 – History Milestones & Rediscoveries

## Was neu ist

Im Bereich **Zuletzt gespielt → Last.fm-History → History Explorer** steht unter dem V716-Hörkalender eine neue Ansicht **Deine Hörrekorde**:

- **Rekordtag**: Anzahl archivierter Scrobbles am aktivsten Kalendertag, mit einem Klick zum Tagesfilter in der Chronik (alte Such-/Künstlerfilter werden dabei zurückgesetzt).
- **Rekordmonat**: Monat mit den meisten archivierten Scrobbles, mit einem Klick zum ganzen Monat in Kalender **und Chronik** (alte Such-/Künstlerfilter werden dabei zurückgesetzt).
- **Längste Hörserie**: längste Folge aufeinanderfolgender lokaler Kalendertage mit mindestens einem archivierten Scrobble. Gleichstände favorisieren die jüngste Serie.
- **Aktuelle Hörserie**: Nur dann als laufend angezeigt, wenn der letzte archivierte Scrobble von heute oder gestern (Browser-Ortszeit) stammt.
- **Monatsvergleich**: Der im Kalender ausgewählte Monat wird mit dem vorherigen Kalendermonat verglichen – Gesamtanzahl der Scrobbles, verschiedene Künstler, verschiedene Songs und aktive Tage. Wenn der Vormonat noch vor dem ersten Archivmonat liegt, bleibt der Vergleich bewusst leer; Lücken innerhalb eines bereits begonnenen Archivs werden als 0 Beobachtungen gezählt.
- **Wiederentdeckt**: bis zu acht zuletzt erneut gehörte Songs mit **mindestens 90 Kalendertagen** zwischen zwei aufeinanderfolgenden erfassten Wiedergaben dieses Songs. Durch einen Klick auf einen Eintrag werden Titel, Künstler und Tag in den History-Filtern übernommen und die Chronik geöffnet. Groß-/Kleinschreibung und Unicode-Normalisierung verändern die Songidentität nicht.

## Sicherheit und Interpretation

- Alle Auswertungen sind **rein lokal, lesend und aus bereits im V713-IndexedDB-Archiv befindlichen Last.fm-Scrobbles**; keine neuen API-Endpunkte, keine Scrobble-Übertragung.
- Der Monatsvergleich hängt vom im V716-Kalender gewählten Monat ab. Die globale Freitextsuche und Künstlerfilter beeinflussen diese persönlichen Lebenszeitrekorde **nicht**.
- Tage und Monate verwenden Browser-Ortszeit, nicht UTC. Unterschiede an Sommer- und Winterzeitgrenzen werden durch UTC-basierte *Kalendertag-Nummern* korrekt als aufeinanderfolgende lokale Daten behandelt.
- Die Statistiken umfassen **Scrobbles**, nicht Hörminuten oder garantiert vollständig abgespielte Songs. Vor allem fehlende Scrobbles und unvollständige Synchronisierungszeiträume können Höchstwerte und vermeintliche Pausen verfälschen.
- Der aktuelle Monat ist als **noch nicht abgeschlossen** gekennzeichnet. Für den ersten archivierten Monat wird kein möglicherweise fehlender Vormonat erfunden.
- Wiederentdeckung bedeutet eine **Lücke in den archivierten Wiedergaben**, kein sicherer Nachweis, dass der Song dazwischen tatsächlich nie gehört wurde.

## Projektänderungen

- `lib/lastfm-milestones-v717.ts`: unabhängiger, lesender Analyse-Kern mit Streak-, Monats- und Wiederentdeckungslogik
- `components/LastFmMilestonesPanelV717.tsx`: interaktiver, responsiver Panel
- `components/LastFmHistoryPanelV706.tsx`: Einbindung und Sprung zur Chronik
- `app/globals.css`: Desktop-/Touch-/Tastaturstile
- `tests/v717-lastfm-milestones-regression.cjs`, `tests/tsconfig.v717-core.json`, `tests/tsconfig.v717-ui.json`: neue Regressions- und isolierte Typprüfungen
- `package.json`: v717 und neue Tests vor bestehender Schnelltest-Kette

## Nach dem Entpacken prüfen

```powershell
npm install
npm run test:v717
npm run test:v717:types
npm run test:v717:ui-types
npm run test:quick
npm run typecheck
npm run build
```

Ein vollständiger Next.js-Produktionsbuild erfordert die npm-Abhängigkeiten. Diese sind in der gelieferten ZIP nicht enthalten; wenn sie hier nicht installierbar sind, ist dieser Teil noch nicht verifiziert. Ein Last.fm-Konto und reales Browser-Archiv sind für die manuelle Endabnahme nötig.
