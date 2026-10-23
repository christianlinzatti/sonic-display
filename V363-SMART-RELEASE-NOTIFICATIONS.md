# Sonic Display V363 – Smart Release Notifications

V363 erweitert den **manuellen** Personal Release Radar V362 um eine **automatische Prüfung beim Öffnen der verbundenen App** und eine lokale Benachrichtigungszentrale. V362 und alle vorherigen Funktionen bleiben enthalten.

## Verhalten

- **Beim Öffnen:** Sobald Spotify verbunden ist und das Musikdisplay erscheint, prüft der V363-Client automatisch, ob eine erneute Abfrage fällig ist. Standardmäßig ist das aktiviert; es lässt sich jederzeit deaktivieren.
- **Abfragebegrenzung:** Zwischen erfolgreichen automatischen Prüfungen liegen mindestens sechs Stunden. Ein Scan prüft höchstens **zwei Spotify-Follow-Seiten mit jeweils bis zu vier Künstlern** und je Künstler höchstens **zehn** Album-/Single-Einträge. Das nutzt die vorhandene V362-Serverroute `/api/spotify/release-radar` mit Spotify-Session, `user-follow-read`, Token-Erneuerung und `no-store`.
- **Rotation:** Der zuletzt gelieferte `after`-Cursor wird lokal gespeichert. Bei einer späteren Prüfung setzt V363 auf der nächsten Seite gefolgter Künstler fort; am Ende der Liste beginnt der nächste Scan vorne. Die Prüfung ist damit absichtlich **nicht vollständig** und kann Releases verpassen (z. B. bei sehr vielen gefolgten Künstlern, Spotify-Limits oder mehreren Releases pro Künstler).
- **Neu-Meldungen:** Nur Spotify-Veröffentlichungen mit gültigem, tagesgenauem Datum innerhalb der vergangenen **14 Tage** werden gemeldet. Der Scan selbst filtert Album- und Single-Einträge auf **30 Tage**. Am **ersten** erfolgreichen Scan können daher bereits veröffentlichte, bisher unbekannte Titel der letzten 14 Tage als „neu in Sonic Display“ auftauchen. Das ist kein Beleg dafür, dass Spotify die Veröffentlichung gerade erst angekündigt hat.
- **Keine Wiederholungen:** Die IDs bereits geprüfter Veröffentlichungen werden behalten (höchstens 500). Benachrichtigungen (höchstens 40) erscheinen für diese IDs nicht erneut. Pro Scan werden höchstens zwölf neue Karten aufgenommen. Im V362-Radar als „angesehen“ markierte Album-IDs werden nicht neu gemeldet. Bei V363 als „gelesen“ markierte Alben erscheinen auch im V362-Radar als angesehen.
- **Anzeige:** Der neue Button `🔔 Neuheiten` sitzt im Spotify-Musikdisplay unter dem Release-Radar-Button. Ungelesene Meldungen erscheinen als Badge, neue Funde zusätzlich kurz als unaufdringlicher In-App-Hinweis. Die Dialogkarten zeigen Cover, Release-Typ, Künstlername, Veröffentlichungsdatum, Spotify-Link und Lesezustand. In der Zentrale gibt es „Jetzt prüfen“, „Alle gelesen“, „Verlauf löschen“, einen Opt-out-Schalter und einen Link zum vollständigen Release Radar.
- **Fehler:** 401/403/429/5xx und unterbrochene Requests zeigen einen erklärenden Status an. Temporäre Spotify-Fehler aktivieren einen Cooldown; es wird kein erfolgreicher Scan oder „keine Neuheiten“ behauptet, wenn ein Request fehlschlägt. Gleichzeitige Browser-Tabs koordinieren sich bestmöglich über eine lokale, befristete Sperre. Laufende Scans werden beim Unmount abgebrochen.

## Datenschutz und Grenzen

- **Kein Web-Push / Android-Push / Service Worker / Server-Cron**. Checks finden ausschließlich statt, solange die Web-App geöffnet und der Spotify-Nutzer angemeldet ist. Es gibt keine Hintergrundprüfung, wenn das Display geschlossen ist.
- Browserseitige Daten: `sonic.release-notifications.v363` speichert die begrenzten bekannten Spotify-Album-IDs, Cursor, Zeitpunkte, die aktivierte Einstellung sowie Metadaten der maximal 40 Benachrichtigungskarten (Titel, Künstler, Cover-URL, Datum, Spotify-Link). Es werden **keine** OAuth-Tokens und keine Lyrics gespeichert. Die Daten sind **browserlokal, nicht nach Spotify-Konto getrennt**. Bei gemeinsam genutzten Browsern können die Karten anderer Sitzungen sichtbar bleiben, bis „Verlauf löschen“ betätigt oder der Browserspeicher gelöscht wird.
- Die begrenzten Requests sind keine Garantie auf eine lückenlose Veröffentlichungsliste. Die Existenz eines neuen Releases wird ausschließlich aus Spotifys übergebenen Albumdaten und Datumsangaben abgeleitet. Feature-/Gastauftritte und Veröffentlichungen mit unpräzisem Datum können fehlen.
- Es wird keine Berechtigung über `user-follow-read` hinaus eingeführt (seit V359 vorhanden); Spotify bei älteren Autorisierungen erneut verbinden.

## Geänderte Komponenten

- `lib/release-notifications-v363.ts` – reine, strenge Datenmodell- und Dedup-/Cooldown-Funktionen; begrenzte Speicherung und URL-Sanitization.
- `components/ReleaseNotificationsV363.tsx` – On-Mount-Scan, rotierende Spotify-Cursor, Lock, Fehler-Cooldown, dialogbasierte Anzeige, Lesezustand und Radar-Synchronisierung.
- `components/ReleaseRadarV362.tsx` – zwei Custom Events zur Öffnung des Radars aus V363 und zur bidirektionalen Markierungs-Synchronisierung.
- `components/SonicDisplay.tsx` – lazy-loaded Einbindung in beide angemeldeten Ansichten, kein zweiter WebGL-Canvas.
- `app/globals.css` – Touch-Layout, Toast, Meldungskarten, reduzierte Einblendung.
- `tests/v363-smart-release-notifications-regression.cjs` – Logik, Berechtigungsgrenzen, Datumsfenster, manuelle/automatische Priorität, URL-Safety, UI-Integration, lokale Deduplizierung.

## Installation und Tests

`npm install` und danach `npm run verify`, anschließend `npm run dev` oder Deployment auf Vercel. Spotify nach Bedarf neu verbinden.

- `npm run test:v363`: erfolgreich.
- `npm run verify:offline`: vollständig erfolgreich, siehe `V363-VALIDATION.txt`.
- `npm run check:syntax`: 476 TS-/TSX-Dateien syntaktisch geprüft.
- Strenge isolierte Typprüfung der Datenmodelle V360–V363: erfolgreich.
- Vollständiger Next.js-Produktionsbuild **hier nicht verfügbar**, da `node_modules` und `package-lock.json` fehlen; ebenso wurde kein Live-Spotify-Konto-Test vorgenommen.
