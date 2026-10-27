# Sonic Display V568 — Verifikation (25.10.2026)

## Durchgeführt

- **61 neue V568-Regressionsprüfungen**: Szenenwahl, belegte Sängerrollen und Zeitfenster, alle vier Ausgabe-Intensitäten, Schutz bei manuellen Kamera-/Tanz-/Licht-/Lyrics-Regeln, pausiert/Reduced Motion, Pi Low, evidenzabhängige Dämpfung, identische alte Ausgabe bei deaktiviertem Schalter.
- `npm run test:v568:types` – isolierte TypeScript-Prüfung erfolgreich.
- `npm run verify:v568` – vollständige gezielte Releasekette V554 bis V568 mit TypeScript-Teilmengen, Syntax- und Architekturchecks erfolgreich; Log bei der Erstellung geprüft.
- `npm run check:syntax` – **790 TS/TSX-Quelldateien** geprüft.
- `npm run check:architecture` – 340 aktuelle Querverweise, 10 Abschnitte, Dokumentationslinks erfolgreich.
- Ergänzende historische Tests: V528 (**3.600** Kamera/Lyrics-Cases), V502 (**18.000** Sample-Fälle), V451, V566, V551 (**12.150**), V552 (**43.200**), V553 (9 Benchmark-Fixtures) bestanden.
- Archiv mit CRC-Integritätsprüfung und ohne `node_modules` erzeugt.

## Nicht durchgeführt

- Vollständiger `npm run typecheck` und `npm run build`: `node_modules`/Projektabhängigkeiten stehen im Arbeitscontainer nicht zur Verfügung.
- Kein Browser-WebGL- oder Live-Spotify-Test; keine realen GLB-Sichtprüfungen und kein Raspberry-Pi-Hardwaretest.
- Die genannten Pi-/Benchmark-Zahlen sind deterministische Simulationen/Fixtures, keine gemessenen FPS auf Hardware.

## Erweiterte/angepasste Legacy-Checks

- V567: historisch harter exakter Versions-/Build-Präfix-/Dokumentationsvergleich für kommende Releases zukunftsfähig gemacht; Funktionsprüfungen unverändert.
- V502: historischer Quellcode-Link prüft alternativ den V568-Koordinator als dokumentierten, nachgelagerten Kanal; ursprüngliches Verhalten von V502 bleibt getestet.
