# V668 – Intelligente Systemdiagnose & Einrichtungshilfe

## Ziel
Die existierende V667-Statusübersicht wird um **priorisierte, nachvollziehbare Diagnosekarten** ergänzt,
unter **Einstellungen → Dashboard → Systemdiagnose & Einrichtungshilfe**.

## Umgesetzt
- **Wichtig**: Fehlende Spotify-OAuth-Konfiguration oder tatsächlich gemeldeter Spotify-Verbindungsfehler.
- **Prüfen**: Eingeschaltetes Mikrofon mit Aktivierungs-/Berechtigungsproblemen; eingeschaltete Tanzautomatik
  ohne verfügbare Motion-Einträge; eingeschaltete Genre-Automatik ohne bestimmtes Genre.
- **Hinweis**: Konfigurierte Spotify-Verbindung ohne aktuelle Bestätigung; bislang für einen aktuellen Song nicht
  bestätigte Lyrics; erst auf Wunsch unkonfigurierte optionale Integrationen.
- In-Browser-Aktionen öffnen nur bereits bestehende Audio-/Avatar-/Anzeige-/Performance-Einstellungen
  oder laden den bestehenden Status-Endpunkt erneut. Die nötigen Server-Variablen werden **nicht** im UI
  als Eingabefelder angeboten und es werden niemals Secret-Werte angezeigt.
- Die Diagnose unterscheidet **Nicht geprüft**, **Konfiguriert**, **Aktiv** und **gemeldeter Fehler**.
  Ein fehlender optionaler Provider wird nicht automatisch als Fehler eingestuft.
- Keine erfundenen Live-Healthchecks für externe Dienste; kein zusätzliches Polling, keine Speicheränderungen,
  keine automatischen Konfigurationskorrekturen und kein neues Backend.
- Die Regeln sind testbar als pure Funktion `diagnoseDashboardV668`.

## Abgrenzung
- „Prüfen“ ist eine **Empfehlung**, kein diagnostischer Nachweis einer bestimmten Ursache.
- Daten stammen weiterhin aus V667-Snapshots, Musik-/Audiozuständen und den Einstellungen.
- Keine selbstständige Wiederanmeldung bei Spotify und keine automatische Änderung von Credentials.
- Die bereits vorhandene V667-Statusanzeige bleibt vollständig erhalten; eine bewusste Deaktivierung
  ist nicht automatisch ein Problem.
