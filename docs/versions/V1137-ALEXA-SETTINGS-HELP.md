# V1137 – Alexa Einstellungen & vollständige Hilfe

## Neu
- Eigene Kategorie **Einstellungen → Alexa** mit getrenntem Opt-in für Empfang, Spotify-Künstler, Anzeige und Govee-Lichtszenen.
- **Alexa-Hilfe** mit allen unterstützten Intent-Befehlen aus der deutschen `interaction-model.de-DE.json`, Suche, Gruppen und alternativen Formulierungen.
- Sprachbefehl „Alexa, sage Sonic Display, welche Befehle gibt es“ verweist auf die vollständige Hilfe; die integrierte Alexa-Hilfe nennt die verfügbaren Bereiche.
- Änderungen des zentralen Alexa-Empfangs werden zwischen der Einstellungsseite und dem Konzertstudio synchronisiert, ohne vorhandene Freigaben stillschweigend zu aktivieren.
- „Letztes Ergebnis“ verwendet das letzte **abgeschlossene** Sprachergebnis und wird nicht mehr durch eine neu eingereihte Anfrage verdeckt.

## Einrichtung
Der Einstellungsbereich wird mit dem normalen Vercel-Deployment ausgeliefert. Den **neuen Sprachbefehl** erhält ein Echo erst, wenn unter Amazon Alexa Developer Console das aktualisierte `integrations/alexa/interaction-model.de-DE.json` importiert und gebaut und in AWS Lambda das aktualisierte `integrations/alexa/handler.cjs` zusammen mit `voice-v1008.cjs` bereitgestellt wird. An `ALEXA_BRIDGE_SECRET` und den bestehenden Berechtigungen ändert sich nichts. Es erfolgt **kein** automatisches Deployment zu Amazon.

## Sicherheit
Alle Empfänger bleiben opt-in. Künstleraktionen nutzen weiterhin ausdrücklich erlaubte Spotify-Follow-Scopes; Govee nutzt ausschließlich die bestehende LAN-Musiksynchronisation. Keine zusätzlichen Hardware-Schaltbefehle, Playback-Steuerung oder ungeschützte Endpunkte.

## Qualität
`node tests/v1137-alexa-settings-regression.cjs`, `node tests/v1008-relay-regression.cjs`, Full TypeScript und Next.js Production Build im CI-Gate.
