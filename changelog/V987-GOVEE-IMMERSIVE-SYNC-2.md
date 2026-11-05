# V987 – Govee Immersive Sync 2.0

## Neu

- Nach ausdrücklicher Freigabe aus dem V986 Atmosphere Designer kann die
  Palette der fünf kreativen Akte auf vorhandene V909-Govee-LAN-Looks wirken.
- Die aktuelle V604/V763-Szenentimeline muss **bestätigt**, songgebunden,
  aktuell und synchron zur Spotify-Wiedergabe sein. Die fünf visuellen Akte
  bleiben kreative Motive, keine behaupteten akustisch gemessenen Abschnitte.
- Reine RGB-Farbüberblendung (max. 24 % Gewicht), Helligkeit ausschließlich
  reduzierend (max. 10 %), RGB-Ratenbegrenzung 24 Kanalschritte je vorhandenem
  LAN-Sendedurchlauf. Bestehende Master-/Gerätegruppen-Limits werden nie erhöht.
- Gespeicherte V912-Shows, manuelle V354-Cues, Alexa-Govee-Befehle,
  Geräte-Recovery, reduzierte Bewegung, Pausen und versteckte Tabs haben Vorrang.
- Die Erlaubnis ist nur im aktuellen Tab für den aktuellen Titel im Speicher,
  wird bei einem Trackwechsel oder beim Verlassen des Studios widerrufen und
  verfällt nach spätestens einer Stunde. Ein Stop-Button widerruft sofort.
- Keine zusätzlichen Govee-Netzwerkaufrufe, keine neuen Timer, keine
  Hardware-On/Off-Befehle, keine Lichtblitze und keine KI-API-Aufrufe.

## Test-/Betriebsgrenzen

`npm run test:v987`, `npm run test:v987:types`,
`npm run check:syntax`, `npm run check:architecture` sowie der vollständige
TypeScript-/Next.js-Produktionsbuild sind vor Freigabe zu prüfen. Der isolierte
Typcheck und Produktionsbuild erfordern die vollständigen npm-Dependencies.
Der ZIP-Importer kann geschützte `.github/workflows`-Änderungen aus ZIPs
abweisen: Workflow separat direkt im Repository übernehmen.
