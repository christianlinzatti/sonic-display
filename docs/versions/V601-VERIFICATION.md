# V601 – Verifikation (26.10.2026)

## Umfang

Reale Integration der neuen FX-Planung in die V555-Bühne, kein eigener Demo-Canvas. Drei bestehende Shaderpässe plus bedingtes schattenfreies Spotlight. Verifizierte Offline-Grenzen und manueller Lichtschutz.

## Resultate

- `npm run test:v601`: PASS – **36** deterministische Testgruppen, **32.400** Budgetstichproben.
- `npm run test:v601:types`: PASS – isolierter TypeScript-Core.
- `npm run test:smoke:v601`: PASS – im abschließenden Durchlauf **36 V601-Testgruppen**, V600, V599, V598, V555, V556 und Architektur.
- `npm run test:v580`: PASS – ältere Konzert- und Shaderstrukturtests.
- `npm run verify:v601`: **PASS im abschließenden Durchlauf** – V597-Lip-Sync, V596-Fußarbeit, V595-Bildregression, V572-Deutschrap, V589-GLB-Regression und Quellcode-Syntaxscan inklusive.
- `npm run check:syntax`: PASS – 826 TypeScript-/TSX-Dateien auf Imports/Syntax geprüft.
- ZIP-Integrität separat geprüft; Größe/Dateianzahl stehen beim herunterladbaren Release.
- V556-Strukturtest wurde für die neue sanfte Überblendung erweitert; ursprünglicher V556-Lichtbudgettest bleibt vollständig erhalten.

## Grenzen

Ohne installierte Next.js-App-Abhängigkeiten kein vollständiger Produktionsbuild, ohne Spotify/GLB-Browser keinen echten visuellen Vergleich, ohne Raspberry Pi keine Hardware-FPS. Kein Nachweis eines visuellen Qualitätsgewinns oder einer Hardware-Beschleunigung.
