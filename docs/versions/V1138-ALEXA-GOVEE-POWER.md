# V1138 – Govee LAN per Alexa ein-/ausschalten und Schnelleinstellungen

**Alexa:** „Alexa, sage Sonic Display, schalte die Govee-Lichter ein“ und „… schalte die Govee-Lichter aus“. Weitere Formulierungen stehen in der durchsuchbaren Alexa-Hilfe unter **Einstellungen → Alexa**.

**Schnelleinstellungen:** In der Touch-Steuerzentrale unter **Licht** stehen „Govee EIN“ und „Govee AUS“. Dieselben direkten Schalter stehen im Alexa-Einstellungsbereich. Sie verwenden die vorhandene lokale Govee-Bridge (POST /devices/add und POST /command power), keine Cloud oder neue API.

**Sicherheit:** Echte Hardware-Schaltbefehle per Alexa erfordern eine *zusätzliche*, standardmäßig ausgeschaltete Ein/Aus-Freigabe auf diesem Display. Die bestehende Govee-Farb-Freigabe ist davon unabhängig. Nur bereits ausgewählte LAN-Leuchten werden geschaltet. Die Bridge bleibt durch Token und erlaubte Browser-Origin geschützt. Der private Alexa-Skill bleibt auf die festgelegte Skill-ID und Benutzer-ID beschränkt. Stale Anfragen und widerrufene Einwilligungen werden abgewiesen; Befehle müssen auf einem sichtbaren, Spotify-verbundenen Display verarbeitet werden. Die Musik-Synchronisation wird vor manuellen und per Alexa ausgelösten Power-Befehlen ausgeschaltet, um ein automatisches Wiederüberschreiben zu vermeiden.

**Bestätigung:** Das offizielle Govee-LAN-Protokoll quittiert den tatsächlichen Ein/Aus-Zustand nicht. Sprach- und UI-Antworten melden daher nur den Versand an die lokale Bridge, nicht eine bestätigte Geräteänderung.

**Alexa-Skill aktualisieren:** Das geänderte `integrations/alexa/interaction-model.de-DE.json` in der Alexa Developer Console importieren und bauen. Das aktualisierte `integrations/alexa/voice-v1008.cjs` zusammen mit `handler.cjs` in AWS Lambda veröffentlichen. GitHub und Vercel deployen keine Lambda- oder Skill-Änderungen automatisch.

**Tests:** `node tests/v1138-alexa-govee-power-regression.cjs` und das bestehende Production-&-Playwright-Gate.
