# V1150 · Alexa & Govee Live-Diagnose

Ein neues Dashboard unter **Einstellungen → Alexa → V1150** zeigt in einer
Übersicht **Spotify**, das **Alexa-Relay / Redis**, die **lokale Govee LAN
Bridge** und vier einzeln dargestellte Lampenplätze.

## Bedienung und Status

- **Jetzt prüfen:** Manuell gestartete frische Statusabfragen.
- **Live-Diagnose starten:** Bewusst aktiviertes, auf **60 Sekunden**
  begrenztes Monitoring. Beim Verlassen des Alexa-Einstellungsbereichs wird
  das Monitoring beendet; im versteckten Browser-Tab und ohne Netzverbindung
  werden keine neuen Abfragen gestartet.
- **Live-Diagnose beenden:** Keine weiteren periodischen Abfragen.
- Die drei Verbindungen und bis zu vier Govee-Lampenplätze werden
  getrennt eingeordnet. Für jede fehlende Voraussetzung zeigt die
  bestehende V1149-Diagnoselogik einen nächsten Schritt.
- Für jedes ausgewählte Govee-Gerät gilt **„zuletzt erreichbar“** nur
  auf Basis der vorhandenen Bridge-Geräteliste. Es wird **niemals** behauptet,
  dass dadurch ein aktueller physischer **EIN/AUS**-Zustand bestätigt sei.
  Geräte ohne aktuelle Rückmeldung und nicht zugewiesene Plätze sind
  voneinander unterscheidbar.
- Die Spotify-Wiedergabeanzeige liest nur den bestehenden
  `useMusic`-Zustand. Sie startet keine weiteren Player-Abfragen.

## Datenschutz und sichere Zugriffe

Ausschließlich folgende, bereits existierende Endpunkte werden gelesen:

- `GET /api/alexa/status`: prüft Spotify-Sitzung und Redis-Relay. Bei
  fehlender Spotify-Sitzung wird der Relay-Zustand als nicht geprüft
  ausgewiesen.
- `GET /health` und `GET /devices` der lokalen Govee-Bridge, nach
  expliziter Freigabe durch den Browser. Die Antwort wird auf die
  ausgewählten Lampen eingeschränkt. **Keine** Abfrage sendet einen
  LAN-Schalt-, Scan- oder Add-Befehl.

Bridge-Tokens und IP-Adressen werden nicht im UI-State für die
Gerätekacheln oder in den sichtbaren Diagnosetext übernommen. Die
REST-Verbindung zur Bridge wird mit dem vom Benutzer lokal hinterlegten
Token aufgebaut.

Ein grüner Relay-Status bedeutet **nicht**, dass der private Alexa-Skill
bei Amazon bereits veröffentlicht wurde; dieser bleibt separat am Echo zu
testen.

## Regression und bekannte Probleme

`tests/v1150-alexa-live-diagnostics-regression.cjs` prüft
die Trennung der Lampenplätze, Offline- und Stale-Fälle, ausstehende
Rückmeldungen, Datenminimierung und die nur lesende, opt-in UI-Integration.

Zusätzlich wurde `tests/v1145-alexa-full-concert-regression.cjs` um
einen Mock der durch V1147 hinzugekommenen, rein virtuellen
Konzertszenen-Wiederherstellung erweitert. Das behebt den bekannten Vercel-
Produktionsgate-Blocker `Unexpected runtime dependency
./alexaConcertScenesV1147`.
