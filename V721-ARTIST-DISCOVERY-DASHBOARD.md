# V721 – Artist Discovery Dashboard

## Bedienung

Im geöffneten **Zuletzt gespielt → Last.fm-Verlauf → History Explorer** steht das neue „Artist Discovery Dashboard“ oberhalb der V720 Discovery Timeline. Im Kopfbereich der Last.fm-History führt der Link „Artist Dashboard“ direkt dorthin. Die Register **Übersicht**, **Aufstrebend**, **Langjährige Favoriten** und **Comebacks** filtern drei berechnete Kategorien; die Suche wirkt auf alle drei. Bis zu acht Künstler je Kategorie sind standardmäßig sichtbar; ein Button erweitert auf 50. Ein Klick setzt den Datums-/Künstlerfilter der bereits vorhandenen V715-Chronik und springt tastatur- und Reduced-Motion-konform zum Verlauf. Eine andere zuvor verwendete Suchphrase wird beim Sprung entfernt.

## Datenvertrag und Kriterien

Die Eingabe sind nur die nach Last.fm-Konto gebundenen, bereits geladenen `archive.events` des V713-IndexedDB-Archivs. Die Berechnungsfunktion `buildLastFmArtistDashboardV721` (`lib/lastfm-artist-dashboard-v721.ts`) ist rein und ohne Netz-/Browserzugriffe. Sie validiert ISO-UTC-Zeitmarken, Artist/Title, Ausschluss zukünftiger Zeitpunkte und dedupliziert identische Archivdatensätze. Gültige Wiederholungen mit anderer Zeitmarke werden behalten. Unicode-Künstlernamen werden nach NFKC vereinheitlicht.

**Messfenster:** Zwei disjunkte Blöcke von jeweils 30 *lokalen Kalendertagen*, rückwärts vom Tag des **neueste archivierten Scrobbles**. Diese Zeitankerung ist für alte/offline Archive entscheidend. Der Fenstervergleich wird nur berechnet, wenn in jedem Fenster mindestens zehn archivierte Scrobbles vorhanden sind. „Aufstrebend“ heißt: Künstler im neueren Fenster mindestens drei Scrobbles, mindestens zwei Scrobbles mehr als im älteren Fenster und mindestens fünf **Prozentpunkte** höheren Anteil an allen Scrobbles des jeweiligen Fensters. Rangfolge: absteigender Anteilgewinn, dann jüngere Wiedergaben, dann Künstlername.

**Langjährige Favoriten:** Künstler in mindestens drei verschiedenen erfassten lokalen Kalenderjahren, mit mindestens 30 archivierten Scrobbles insgesamt und mit mindestens einem Scrobble innerhalb der letzten 365 *archiv-relativen* Kalendertage. Sortierung nach belegten aktiven Kalenderjahren, danach Gesamtzahl. Diese Schwellen sind Auswertungsregeln und keine subjektive Wertung.

**Comeback:** Mindestens zwei tatsächlich archivierte Wiedergaben desselben Künstlers liegen mindestens **90 lokale Kalendertage** auseinander, ohne dazwischen archivierte Wiedergabe desselben Künstlers. Die jüngere Wiedergabe muss in den 90 Kalendertagen vor dem jüngsten Archivtag liegen. Aus mehreren passenden Wiedereinstiegen wird der jüngste angezeigt. Die Angabe „x Scrobbles danach“ zählt Wiedergaben ab diesem Zeitpunkt. Es wird keine tatsächliche Hörpause behauptet: Sie ist lediglich im vorhandenen Archiv beobachtet.

**Unvollständige Daten:** Fehlende Monate, nachträgliche Imports, nur teilweise synchronisierte Last.fm-Geschichte oder laufende Zeitfenster verändern die Ranglisten. Leere Kategorien bedeuten ausschließlich „nach diesen Kriterien im vorhandenen Archiv nicht nachweisbar“. Genres, Hörzeiten, Künstleridentitäten und persönliche Absichten werden nicht geschätzt. Kategorien können sich überschneiden. Mit V706/708-Last.fm-Scrobbling wird **keine neue Übermittlung** eingerichtet: Spotify Scrobbling ist in Last.fm bereits separat aktiviert und bleibt unberührt.

## Dateien

- `lib/lastfm-artist-dashboard-v721.ts` – pure Auswertung, standardisierte Künstleridentität, gültige Fenster und Ranglisten.
- `components/LastFmArtistDashboardV721.tsx` – responsive Kategorieübersicht mit Suche, Tastaturbedienung und Chroniksprung.
- `components/LastFmHistoryPanelV706.tsx` – bestehenden Last.fm-Explorer ergänzt; nur neue, rein lesende Props.
- `app/globals.css` – touchfreundliche, responsive Oberfläche, Focus-Ring und Reduced-Motion.
- `tests/v721-artist-dashboard-regression.cjs`, `tests/tsconfig.v721-{core,ui}.json` – Funktional- und Typprüfung.

## Verifikation

Siehe `V721-VERIFICATION.md` und die `npm run test:v721*`-Skripte.
