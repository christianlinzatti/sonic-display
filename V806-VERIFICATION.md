# V806 – Prüfbericht (31. Oktober 2026)

## Erfolgreich

- `npm run test:v806`: **62 Testgruppen, 2.500 deterministische Ensemble-Framing-Proben**. Szenarien: echtes bestätigtes Duett, mehrere Sänger, Hand-off, aktuelle Bühnenanker, fehlende Sänger/duplizierte Slots, alte Track-ID, Pause, Seek, fehlerhafte/unsichtbare Anchors, Bildschirmränder, Kopfschutz/Fußposition, kein manuelles Überschreiben, keine neue Render-Schleife.
- `npm run test:v806:types`: strenger isolierter TypeScript-Check des V806-Moduls und der importierten V528/V540/V550/V797-Typen bestanden.
- **34/34** gezielte Befehle `test:v790` bis `test:v806` einschließlich der 17 isolierten `:types`-Checks bestanden.
- Bestandsprüfung `test:v747`, `test:v655` und `test:v354` nach Aktualisierung der Quelltext-Strukturprüfung auf das zusätzliche V806-Finish bestanden. Der echte finale V351-Lyrics-Guard bleibt an seiner bisherigen Position.
- `npm run check:syntax`: **1.157 TS/TSX-Dateien**, einschließlich Importbindungen, bestanden.
- `npm run check:architecture`: **849 Referenzen**, Dokumentationsstand V806, bestanden.
- `npm run test:module-case`: **1.965 Quelldateien**, keine case-insensitiven Windows-/Linux-TS/TSX-Kollisionen.
- `npm run check:lockfile:v752`: Lockfile, 18 Direktpakete, Release-Gates und Windows-/Linux-CI-Struktur bestanden.
- Original-ZIP-Dateierhaltung und ZIP-CRC werden beim Export geprüft.

## Nicht erfolgreich / nicht nachgewiesen

- **Gesamt-TypeScript-Check (`npm run typecheck`) nicht abgeschlossen**: nach 28 Sekunden Zeitlimit abgebrochen. Daraus folgt weder ein grüner Projekt-Typcheck noch ein nachgewiesener neuer Projekt-Typfehler.
- **`npm run check:dependencies` meldet 0/18 direkte npm-Pakete installiert.** Es fehlen unter anderem Next.js, React, React Three Fiber, Three.js und die React-/Node-Typen.
- **Next.js-Produktionsbuild nicht ausgeführt / nicht verifiziert** (`node_modules/.bin/next` nicht vorhanden). Keine Produktionsfreigabe.
- **Keine echten WebGL-/Browser-/GPU- oder Nutzer-GLB-Tests**, insbesondere keine nachgewiesene reale Occlusion-/Gesicht-/Lyrics-Bildpixel-Analyse.
- **Nicht ausgeführt:** die gesamte mehrere hundert Versionen umfassende historische Release-Suite. Getestet wurde die komplette aktuelle V790–V806-Serie plus gezielte alte Kameraregressionen.

## Integrationsgrenzen

V806 korrigiert nur autorisierte automatische Kameraansichten bei bestätigten V528/V797-Sänger-Slots; ohne vollständige Positionsbelege bleibt die Kamera unverändert. Tatsächliche GLB-Silhouetten und visuelle Qualität werden nicht gemessen. V805 dient weiterhin als unabhängiges statisches 3D-Vergleichsstudio. V806 führt keine neue WebGL-Kamera, keinen Render-Loop, keine Sängererkennung, keine API und keine neuen persistenten Einstellungen ein.

## Lokale Freigabe

`npm ci --no-audit --no-fund`, dann `npm run typecheck` und `npm run build` erfolgreich durchlaufen lassen. Danach mit echten GLB-Avataren und bestätigten Duett-Timestamps in einem realen Browser die Bühnenkomposition, Lyrics-Lesbarkeit und FPS kontrollieren.
