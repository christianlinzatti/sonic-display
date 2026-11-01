# V703 – Listening Statistics Dashboard

## Bedienung

1. Unter „Zuletzt gespielt → Mein Archiv“ zunächst das lokale Spotify-Archiv bewusst aktivieren. Die automatische V702-Sicherung ist unabhängig davon optional und standardmäßig deaktiviert.
2. „Zuletzt gespielt → Meine Statistik“ öffnen. Die Ansicht identifiziert zuerst das aktuelle Spotify-Konto und öffnet nur dessen lokales Archiv. Es findet kein Spotify-Verlauf-Abruf statt.
3. Mit „Letzte 30 Tage“, „Letzte 90 Tage“, „Letzte 365 Tage“ oder „Gesamtes Archiv“ den Auswertungszeitraum wählen. „Archiv neu einlesen“ führt die Kontoprüfung erneut aus und liest den lokalen Stand.
4. Monatsbalken, erfasste Wiedergaben, einzigartige Songs, weitere Wiederholungen, Ranglisten, Tageszeiten und Wochentage vergleichen. Links zu Songs öffnen ausschließlich Spotify-Titeladressen.

## Statistikregeln

- Alle Werte beziehen sich auf das **tatsächlich gespeicherte**, aktuell kontogebundene Archiv (`V701Archive`), nach dessen vorhandener Import-/Lesevalidierung. Ein Song mit gleichem Spotify-Track-ID + Playback-Zeitpunkt zählt einmal; ein späteres Replay zählt erneut.
- Tages- und Monatsgrenzen folgen der **lokalen Browserzeit**. Rolling-Windows schließen die zurückliegenden 30/90/365 **Kalendertage inklusive heute** ein. Andere Filter beziehen sich auf das gesamte vorhandene Archiv.
- Die zwölf Monate laufen immer vom aktuellen Monat elf Monate zurück. Ein leerer Balken bedeutet nur **keine gespeicherten Ereignisse im Archiv**, niemals nachgewiesene Hörpause. Der aktuelle Monat ist unvollständig.
- Der Monatsvergleich nutzt unabhängig vom gewählten Rolling-Filter die **beiden letzten abgeschlossenen Kalendermonate**. Prozentangaben nur, wenn der frühere Monat mehr als null gespeicherte Ereignisse hat. Auch vollständige Kalendermonate können im Archiv unvollständig erfasst sein.
- Spotify-„artist“-Label wird als **Künstler-Credit** gezählt, Feature-/Duett-Credits werden nicht eigenmächtig aufgeteilt; keine erfundenen Solo-Statistiken.
- Keine geschätzten Stream-Minuten oder tatsächlich vollständig gehörten Songs. V701 lässt höchstens 5000 Ereignisse im Browserarchiv zu; alte Einträge können verdrängt sein.

## Datenschutz, Integrität und Laufzeit

Keine neuen Spotify-Scopes, keine neuen API-Endpunkte, keine neuen Hintergrundabfragen, keine Netzwerkübertragung gespeicherter Titel, kein Editieren des Archivs. Wenn der bestehende Archivspeicher beschädigt oder der Zugriff blockiert ist, werden keine Daten ersetzt. Abmelden/Kontowechsel führt beim Neuöffnen zu einer neuen Identitätsprüfung. Auf mehreren Geräten besteht weiterhin keine automatische Synchronisierung. Das JSON-Backup aus „Mein Archiv“ bleibt der Gerätewechselweg.

Der neue React-Tab und das reine Aggregationsmodul können isoliert typegeprüft werden. Die tatsächliche Browser-/Spotify-Abnahme sowie der vollständige Produktionsbuild sind in dieser Umgebung ohne externe Projektabhängigkeiten offen (siehe `V703-VERIFICATION.md`).
