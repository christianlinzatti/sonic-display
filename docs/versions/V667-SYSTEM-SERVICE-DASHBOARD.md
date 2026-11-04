# V667 – System- & Service-Dashboard

## Ziel
Zentraler Überblick über den **aktuellen** Zustand von Sonic Display, insbesondere welche Dienste aktiviert,
konfiguriert und nachweislich funktionsfähig sind. Aufruf: Einstellungen → Dashboard (Standard-Tab).

## Datensicherheit und Quellen
- `/api/system/status` (`Cache-Control: private, no-store`) liefert ausschließlich eine fest codierte Liste
  boolescher Konfigurationsmerkmale für Spotify, LRCLIB, Lyrics.ovh, Genius, Spotify Color Lyrics,
  Musixmatch, Last.fm, MusicBrainz, TheAudioDB, Flickr, Vercel Blob, Admin und Push.
  **Keine** Tokenwerte, IDs, Secret-Namen-Liste, Request-Header, Sessions oder Nutzerdaten.
- Das Dashboard nutzt die bereits vorhandenen `MusicContext`-/`AudioAnalysisContext`-/`UiPreferencesContext`-Zustände.
  Eine Spotify-Verbindung wird erst mit frischer Polling-Antwort als funktionierend angezeigt.
  Lyrics-Provider zeigen einen Erfolg nur, wenn sie tatsächlich die aktuellen Lyrics geliefert haben.
  Provider ohne Funktionsnachweis bleiben bei **Nicht geprüft**.
- Lokale `characterMotionLibrary` und `genreDancePerformanceV666` liefern Motion-Anzahl,
  Automatik- und Genre-Einstellungen. `getLiveVocalEnvelopeV661` liefert vorliegende Vocal-Slots.
- Kein globaler Provider-Ping und kein separates Spotify-Polling; Serverstatus-Refresh jede 60 s,
  ausschließlich bei offener Dashboard-Ansicht, plus bei Klick und lokale Change-Events.
- Die Navigation führt zu bestehenden Einstellungsbereichen. Alle Statuskarten sind read-only.

## Grenzen
- „Konfiguriert“ bedeutet, dass für die jeweilige Integration notwendige Env-Variablen vorhanden sind,
  nicht dass der Dienst erreichbar ist oder die Credentials gültig sind.
- Ohne frischen Positivbeleg: Status „Nicht geprüft“ oder „Eingeschränkt“.
- Die Anzeige misst derzeit weder GPU-Auslastung noch API-Verfügbarkeit der nicht genutzten Provider.
  Den letzten extern gespeicherten Backup-Zeitpunkt erfasst sie noch nicht.
- Spotify Color Lyrics nutzt eine optionale undokumentierte Schnittstelle und bleibt nur bei ausdrücklichem Opt-in an.
- Die Angabe „Vocal-Stems“ bezieht sich auf aktuell bereitgestellte Feature-Hüllkurven, nicht auf automatisch
  aus Spotify separierte Stimmen.
