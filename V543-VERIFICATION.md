# V543 – Verifikation am 25.10.2026

## Erfolgreich in dieser Umgebung

- `npm run test:v543`: **405 integrierte Konzert-Szenarien** (Deutschrap/Hardstyle/Hardtekk × Songabschnitt × 2–4 Avatare × 3 Leistungsklassen × alle fünf Modellreihen); **270** aktive Crew-/Kamera-Fälle. Tatsächliche GLB-Metadaten aller fünf Originaldateien wurden eingelesen.
- `SONIC_V543_SAMPLES=/tmp/no-glbs npm run test:v543`: auch **ohne externe GLB-Originale** erfolgreich, mit ausdrücklich synthetischen Testclips. Das Release-ZIP kann daher ohne die Test-GLBs gebaut werden.
- Je **3 vollständige simulierte Messdatenfolgen** für die vorhandenen V522-Messprotokolle, plus fehlende/fehlerhafte Wiederholungen, Geräte-/Einstellungswechsel und manuelle Sichtprüfungen. Das sind reine Tests der Status- und Messlogik; die eingesetzten Messwerte sind **keine echten FPS**.
- `npm run test:v543:types`, `npm run test:v542:types`: bestanden.
- V522–V542: **21 Regressionstests** und **21 gezielte TypeScript-Kerntests** (die Tests V522–V541 erneut einzeln und V542 separat): alle bestanden.
- `npm run check:syntax`: **758 TS/TSX-Quelldateien**, bestanden.
- `npm run check:architecture`: **282 Referenzpfade**, bestanden.

## Einschränkungen – nicht bestanden oder nicht überprüft

- `npm run --ignore-scripts build`: **nicht ausführbar**, `next: not found`; in dieser Umgebung gibt es kein `node_modules` und keinen npm-Cache für Next.js. Ein erfolgreiches `next build` wurde nicht behauptet.
- Browser-WebGL, tatsächliche Raspberry-Pi-FPS und GPU-Temperatur sowie optische/akustische Synchronität: **nicht live überprüft**. V543 stellt dafür einen interaktiven Benchmark und manuelle Checklisten bereit.
- Die echten fünf externen Avatar-Dateien werden nicht mit dem ZIP ausgeliefert; sie wurden vor Ort geprüft.

## Nach Installation lokal / auf Raspberry Pi

`npm install` (mit verfügbaren Projektabhängigkeiten) und danach `npm run build`.
Für die Validierung auf dem Gerät `npm run dev -- --hostname 127.0.0.1` (bei Aufruf auf dem Gerät), Konzert-Benchmark öffnen, die drei Szenarien je dreimal mit gleicher Konfiguration messen, vier Sicht-/Hörfelder **für jedes** Szenario gesondert prüfen, anschließend den V543-JSON-Bericht exportieren. Für längere Hardwaredauerläufe wird zusätzlich eigene Beobachtung empfohlen.
