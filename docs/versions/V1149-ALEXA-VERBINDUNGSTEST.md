# V1149 · Geführter Alexa-Verbindungstest

Im Sonic-Display-Menü **Einstellungen → Alexa** erscheint der neue
**„Verbindungstest in drei Schritten“**. Der Test wird ausschließlich durch
den Schalter **„Alle drei Verbindungen prüfen“** ausgelöst.

## Prüfungen

1. **Spotify:** Abfrage der bestehenden authentifizierten
   `GET /api/alexa/status`-Route. Diese prüft die Spotify-Anmeldung ohne eine
   Wiedergabe zu starten oder zu ändern und meldet ggf. fehlende
   Künstlerberechtigungen.
2. **Alexa-Relay / Upstash:** Dieselbe Serverstatusroute prüft die vorhandene
   Relay-Konfiguration und Redis-Erreichbarkeit. Bei fehlender
   Spotify-Sitzung wird der Relaystatus ausdrücklich als **nicht geprüft**
   angezeigt. Ein funktionierendes Relay **beweist nicht**, dass die
   AWS-Lambda-Funktion und der Alexa-Skill bereits veröffentlicht sind.
3. **Govee LAN:** Im Browser zuerst die bestehende, token-geschützte
   `GET /health`-Abfrage der **lokalen** Bridge, danach – sofern nötig –
   `GET /devices`, um die zuletzt erreichbaren Geräte **nur anhand der
   bereits ausgewählten IDs** zu zählen. IP-Adressen und Token werden
   niemals im Bericht angezeigt; auch werden keine Geräte gescannt,
   hinzugefügt oder geschaltet.

Die Einzelprüfungen sind unabhängig und werden parallel gestartet. Es wird
kein zusätzliches Polling eingerichtet, und der Status wird nur während eines
manuell gestarteten Prüflaufs erfasst. Bei Verbindungsfehlern erhält der
Nutzer den konkreten nächsten Einrichtungsschritt. Die Auswertung
unterscheidet ausdrücklich **bestätigt**, **Einrichtung nötig**,
**Problem erkannt** und **nicht bestätigt**.

## Sicherheitsgarantien

Es werden keine `/command`, `/scan` oder `/devices/add`-Endpunkte aufgerufen,
keine Govee-Lampen betätigt und keine Spotify-Aktionen ausgeführt.
Ein positives Ergebnis für Govee zeigt nur den letzten LAN-Präsenzstatus,
nicht den bestätigten physischen Ein-/Aus-Zustand. Ein gültiges Relay ist
nicht mit einem erfolgreich veröffentlichten oder am Echo getesteten
Alexa-Skill gleichzusetzen.

## Tests

`node tests/v1149-alexa-connection-wizard-regression.cjs`
prüft Grenzfälle, Teilfehler, fehlende Berechtigungen, Redaction und die
Integration der Statusabfragen in das Einstellungsmenü.
