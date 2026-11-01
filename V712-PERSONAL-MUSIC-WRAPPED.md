# V712 – Personal Music Wrapped

## Zweck

Jahresrückblick aus lokal gespeicherten Last.fm-Scrobbles. Der Spotify-Account überträgt bereits mit der separat auf last.fm aktivierten **Spotify Scrobbling**-Verbindung. Sonic Display darf keine zweite, doppelte Übertragung vornehmen.

## Aufruf

**Zuletzt gespielt → Last.fm-History → Dein Musikjahr**. Vorher Last.fm-Benutzername wählen und Scrobbles importieren bzw. automatische Last.fm-Synchronisierung aktivieren. Der Rückblick erscheint auch dann mit einer Leermeldung, wenn keine archivierten Scrobbles vorhanden sind.

## Auswertung

- Auswahl aller im aktuellen lokalen Archiv vertretenen Kalenderjahre plus laufendes Jahr; Kalendergrenzen nach `Europe/Vienna` (inklusive Sommerzeit) oder `UTC`.
- Tatsächlich archivierte Scrobbles, einzigartige Künstler/Songs/Alben, aktive Kalendertage.
- Top 10 Künstler und Titel, Top 8 Alben (mit bekannten Albumnamen), Repeat-Favoriten und aktivster Monat.
- Exakt zwölf Monatsbalken für das gewählte Kalenderjahr, inklusive Nullmonaten; vorheriges Jahr nur als unvollständige Vergleichsreferenz.
- Unicode-Normalisierung, Sortierung nach Scrobbles, getrennte Künstler bei identischen Titeln.
- Bei aktuellen Jahren und bei einem lokalen Archiv mit 8.000 Einträgen werden Abdeckungsgrenzen erläutert; auch bei kleineren Archiven ist Vollständigkeit nicht belegt.

## Sicherheit und Architektur

`lib/lastfm-wrapped-v712.ts` ist eine reine Funktion, auf höchstens 8.000 Eingaben begrenzt, filtert ungültige Zeichen und unplausible oder zukünftige Zeitstempel. Keine `fetch`-Aufrufe, kein Browser-Speicherzugriff und keine API-Schreibzugriffe. Die UI `components/LastFmWrappedPanelV712.tsx` liest nur das bereits bestehende, validierte Archiv über die übergeordnete `LastFmHistoryPanelV706.tsx`. Das Spotify-V701-Archiv, Last.fm-V706-Archiv, V708-Synchronisierung und V710-Recovery bleiben unverändert. Keine zusätzlichen Spotify-Scopes oder Last.fm-Schlüssel.

## Bekannte Grenzen

Lokales Last.fm-Archiv mit maximal 8.000 Scrobbles; für vollständige mehrjährige Rückblicke ist zuerst das für V713 geplante größere IndexedDB-Archiv sinnvoll. Scrobble-Anzahlen sind keine gemessenen Hörminuten, keine Spotify-Gesamthistorie und keine komplette Last.fm-Gesamthistorie. Identische Events mit gleicher Uhrzeit sind bereits durch das V706-Archiv zusammengeführt; V712 verändert diese Behandlung nicht. Es findet kein Live-Browser- oder Last.fm-Kontotest in der Release-Umgebung statt.
