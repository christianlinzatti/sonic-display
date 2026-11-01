# V704 – Music Discovery Dashboard

## Ziel und Einstieg

Unter **„Zuletzt gespielt → ✧ Entdeckungen“** können Nutzerinnen und Nutzer aus den zuvor ausdrücklich gesicherten Spotify-Wiedergaben im persönlichen V701-Archiv neue Perspektiven auf ihren vorhandenen Musikkatalog gewinnen. Dies ist **kein Empfehlungsdienst** für unbekannte Musiktitel und keine vollständige Spotify-Hörhistorie. „Neu“ bedeutet „erstmals in diesem Archiv“ und **nicht** „neu veröffentlicht“ oder „noch nie gehört“.

Die Ansicht ist eine eigene Registerkarte zusätzlich zu „Mein Archiv“, „Meine Statistik“, „Smart History“ und der bisherigen Chronik. Ein nicht existierendes Archiv wird nicht automatisch angelegt; die Oberfläche bietet „Mein Archiv öffnen“ an.

## Kategorien (ausschließlich echte gespeicherte Wiedergabeereignisse)

- **Comebacks:** Derselbe Spotify-Track wurde in den letzten 14 lokalen Kalendertagen erfasst; zwischen seinen beiden letzten Archiv-Ereignissen liegen mindestens 30 volle Tage. Eine fehlende Zwischenaufnahme kann einen längeren Abstand vortäuschen; deshalb bezeichnet die Ansicht ihn nur als archivierten Abstand.
- **Selten gehört:** Genau ein Wiedergabeereignis im gesamten vorhandenen Archiv, zuletzt vor 14 bis 365 lokalen Kalendertagen. „Selten“ sagt nichts über nicht erfasste Wiedergaben aus.
- **Neu im Archiv:** Der erste archivierte Eintrag eines Tracks liegt innerhalb der vergangenen 30 Kalendertage einschließlich heute; der Track kann bereits vor dem Archiv gehört worden sein.
- **Auf Repeat:** Mindestens drei gespeicherte Events eines Tracks innerhalb derselben letzten 30 Kalendertage.
- **Künstler im Wandel:** Vergleicht den *Anteil* eines Künstler-Credits an archivierten Wiedergaben im aktuellen 30-Tage-Fenster und im unmittelbar davorliegenden 30-Tage-Fenster. Sichtbar nur bei mindestens acht Events **je** Fenster sowie mindestens zwei aktuellen Events und einem Anstieg um mindestens zehn Prozentpunkte. Die Vergleichsperioden können unterschiedlich vollständig erfasst sein; keine Behauptung über echte Präferenzänderungen oder Solo-Credits bei Features.

Jede Songliste ist auf zwölf Treffer beschränkt, sortiert nach nachvollziehbaren Abständen, Häufigkeit oder Zeitpunkt. Spotify-Links entstehen aus validierten 22-stelligen Spotify-Track-IDs; Cover stammen ausschließlich aus einer zugelassenen Spotify-CDN-Domain. Titel, Künstler und Album werden nicht neu abgefragt.

## Technik, Datenschutz und Grenzen

Die pure Berechnung in `lib/listening-discovery-v704.ts` verarbeitet maximal die 5.000 Ereignisse des bestehenden V701-Archivs und dedupliziert nur identische Kombinationen aus Track-ID + Abspielzeitpunkt. Sie mutiert keine Eingaben und hat keine Browser- oder Netzwerkabhängigkeit. Ungültige Timestamps, Dubletten, zu zukünftige Events und problematische URLs werden verworfen bzw. nicht übernommen.

`components/ListeningDiscoveryDashboardV704.tsx` prüft beim Öffnen zunächst das verbundene Spotify-Konto über den **bereits bestehenden** `/api/spotify/history-identity`-Endpunkt und liest danach ausschließlich dessen V701-Archiv aus `localStorage`. Es gibt keinen zusätzlichen Recent-Play-Abruf, keine neuen Spotify-Berechtigungen, keine Synchronisierung zum Server, keine Persistenzänderung und keine automatische Archivaktivierung durch das neue Dashboard. Das Öffnen des übergeordneten „Zuletzt gespielt“-Dialogs lädt weiterhin wie zuvor die normale Spotify-Chronik.

Das Dashboard reagiert auf lokale Archivspeicheränderungen in anderen Browser-Tabs und auf das vorhandene V702-Ereignis nach einer automatischen Sicherung. Der Button „Archiv neu einlesen“ prüft die Spotify-Identität erneut. Bei beschädigtem oder blockiertem Speicher wird der Fehler angezeigt und der Bestand niemals still überschrieben.

## Qualitätssicherung

`npm run test:smoke:v704` prüft die reine Berechnung, Datenvalidierung, Rendering-Typen und die UI-Integration. `npm run test:quick` umfasst zusätzlich die Versionsregressionen; auf langsamen Systemen können die historischen Node-Tests direkt anhand der bestehenden `test:vNNN`-Scripts einzeln ausgeführt werden. Ein erfolgreiches isoliertes `tsc` ersetzt **nicht** den vollständigen Next.js-Produktionsbuild oder einen echten Browser-/Spotify-Live-Test.

Siehe `V704-VERIFICATION.md` für die in dieser Umgebung tatsächlich ausgeführten und blockierten Schritte.
