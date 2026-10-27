# Sonic Display V506 – Prüfbericht (24.10.2026)

## Bestanden

- `npm run test:v506`: **28.000 deterministische Simulationsframes mit 83.999 Avatar-Samples**; vorhergesagte Mindestabstände, Kreuzungen zwischen auseinanderliegenden Start-/Zielpositionen, momentane Überlappung, 2–4 Avatare, wechselnde Qualitätsstufen und optionale Torso-Radien / Arm-Intensitäten.
- Schutzfälle: Pause, Reduced Motion, manuelle Priorität, ungültige Koordinaten, zu wenige/zu viele Avatare, Finite-Zahlen, deterministische Replays, unbeeinflusste dritte Avatarpositionen, gesperrte V494-Fußkontakte, Low-Tier ohne Root-Translation, Duo ohne Root-Translation.
- `npm run test:v506:types`: isolierter TypeScript-Check des neuen Kollisionsplaners erfolgreich.
- **56 Versions-Regressionen V451–V506** erfolgreich (einzelne npm-Testbefehle in Sequenz ausgeführt).
- V501–V505-Kern-Typechecks und V493–V500-Kern-Typechecks erfolgreich ausgeführt.
- `npm run test:gltf-hook-split` und `npm run test:three-avatar-split` erfolgreich ausgeführt.
- `npm run check:syntax`: **700 TS-/TSX-Dateien** syntaktisch und hinsichtlich Import-Bindings geprüft.
- `npm run check:architecture`: 167 Quellcode-Referenzen, alle zehn Architekturabschnitte und aktuelle V506-Version geprüft.
- ZIP-Inhalt wird vor der Ausgabe auf Vollständigkeit / CRC-Integrität geprüft.

## Tatsächliche Sicherheitsgrenzen

Der Schutz nutzt **approximierte Torso-/Armreichweiten und den minimalen Abstand prognostizierter Root-Bewegungen**, keine laufende animierte GLB-Mesh-/Skelettkollision. Eine geplante kurze Z-Bewegung kann bei fehlender Bodenfreigabe nicht ausgeführt werden. Keine vollständige Kollisionsgarantie, insbesondere nicht für fliegende Arme, stark skalierte Custom-GLBs, Handinteraktionen, große Sprünge oder plötzliche Richtungswechsel. Vorführtests auf echter GLB-Bühne sind noch notwendig.

## Nicht verifiziert

`node scripts/build-preflight.cjs` meldet **1 von 17 direkten npm-Abhängigkeiten vorhanden**; `package-lock.json` fehlt in der ursprünglichen Projektbasis. Next.js, React, Three.js und relevante Typen fehlen in dieser Ausführungsumgebung. Daher keine erfolgreichen Aussagen über kompletten `npm run build`, WebGL-Laufzeittest oder Raspberry-Pi-FPS möglich.

Auf dem Entwicklerrechner im ausgepackten Projekt: `npm install` (einmalig, erzeugt `package-lock.json`) und `npm run build`. Anschließend die Multi-Avatar-Bühne mit 2/3/4 echten GLB-Avataren und schnellen Formationstransitionen visuell überprüfen.
