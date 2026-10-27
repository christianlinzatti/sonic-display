# V559 – Geprüfter Stand (25.10.2026)

## Durchgeführt und bestanden

- `npm run verify:v559`: **20 neue V559-Regressionstests**, isolierte V559-Typprüfung, sämtliche gezielten V558–V554-Regressionen und -Typprüfungen, Syntaxprüfung von **778 TS/TSX-Dateien** sowie Architektur-/Dateireferenzprüfung (**321 Referenzen**, zehn Hauptabschnitte).
- `npm run test:v551`: **12.150** deterministische Stage-/Lichtfälle bestanden.
- `npm run test:v552`: **43.200** deterministische Raspberry-Pi-Alpha-/Draw-Budget-Fälle bestanden (keine tatsächliche Messung auf Pi-Hardware).
- `npm run test:v553`: neun Benchmark-/Freigabe-Test-Fixtures bestanden (nicht gleichzusetzen mit echter Produktfreigabe).
- Visuelle Vorschau korrigiert: Solo- und Hook-Demos benutzen einen einzelnen eindeutig verfolgbaren Avatar; nur die explizite Duett-Demo zeigt zwei mit simulierten, bestätigten Rollen. Beide verwenden dieselbe `DynamicStage` wie die Live-Bühne.

## Nicht durchgeführt / verbleibende Grenzen

- Kein vollständiger `npm install`, `npm run typecheck` (Gesamtprojekt) oder `npm run build`, weil im Arbeitscontainer keine Projekt-`node_modules` vorhanden sind. Stattdessen gezielte TypeScript-Prüfungen und reine Quelltests.
- Keine realen Spotify-Beat-/Stimmisolierungsdaten, kein authentisches Sänger-Timestamp-Mapping in der Demo; Mittenspektrum und Lautstärke sind musikalische Aktivitätsindikatoren, keine Stimmtrennung.
- Keine echte WebGL-GLB-Lichtmessung, Prüfung an diversen echten Avatar-Materialien oder Raspberry-Pi-/10-Zoll-/Thermal-/Langzeittest. Diese Punkte benötigen die Anwendung und Zielhardware.
