# V863 – Listening Session Analyzer

## Bedienung

- Last.fm-History öffnen und unter der Genre-Zeitreise das Session Studio wählen.
- Session-Abstand (20/30/60 Minuten), Berichtszeitraum (30/90/365 Tage oder gesamtes Archiv) und Zeitzone (Wien/UTC) auswählen.
- Die 24 Stunden und die Wochentage zeigen die **Anzahl archivierter Scrobbles**, nicht die summierte Wiedergabedauer.
- Die vier Tageszeiten zeigen Scrobbles, Anteile und häufigste Künstler innerhalb der jeweiligen Tageszeit.
- Eine Session erfordert mindestens **zwei** Scrobbles mit einem zeitlichen Abstand von höchstens dem gewählten Schwellenwert zwischen aufeinanderfolgenden Scrobbles. Bei Pausen über der Schwelle beginnt eine neue Gruppe.
- Gruppen-Zeitspanne: erster bis letzter erfasster Scrobble. Kein tatsächlicher Beginn / Ende einer Musiksession, keine Musikdauer, keine Offline-Wiedergabe.
- Künstler/Songs führen in den bestehenden History Explorer; Search und 8er-Paginierung verhindern überlange Listen.

## Datenschutz, Zuverlässigkeit und Grenzen

Bestehendes kontogebundenes IndexedDB-/Last.fm-Archiv wird nur gelesen; keine zusätzlichen API-Requests, keine persistierten neuen Daten, keine Spotify-Steuerung. Zeitzone via `Intl.DateTimeFormat`, inklusive Sommerzeitwechsel. Doppelte identische Scrobbles werden nur einmal gezählt; ungültige, zukünftige und vor 2000 datierte Ereignisse werden ignoriert. Archivlücken und nicht gescrobblete Geräte können die angezeigten Muster verfälschen. Zeitfilter können Sessions am Rand abschneiden.

## Prüfungen

`npm run test:v863`, `npm run test:v863:types`, `npm run test:v863:ui-types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run typecheck`, `npm run build`.
