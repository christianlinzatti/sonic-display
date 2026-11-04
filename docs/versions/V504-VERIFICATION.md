# Sonic Display V504 – Prüfbericht (24.10.2026)

## Bestanden

- `npm run test:v504`: 24.000 deterministische Wiedergabeschritte und getrennte Tests für Solo, Duett, Reply und Hook mit 2–4 Avataren. Track-Sicherheit, Zeitgrenzen, manuelle Priorität, Pausen, Reduced Motion, Qualitätsstufen, Eingabe-Immutabilität und Additiv-Grenzen getestet.
- `npm run test:v504:types`: isolierte TypeScript-Überprüfung des neuen Kerns.
- `npm run test:v503`/`:types`, `test:v502`/`:types`, `test:v501`/`:types`, `test:v500`/`:types` bestanden.
- `npm run check:syntax`: 698 TS-/TSX-Dateien und doppelte Importnamen überprüft.
- `npm run check:architecture`: 161 referenzierte Dateien und zehn Dokumentationsabschnitte geprüft.
- Alle **54 Versions-Regressionstests von V451 bis V504** bestanden: Der serielle Lauf bis V500 (50/54) erreichte das Umgebungs-Zeitlimit, danach wurden die verbleibenden V501–V504-Tests einzeln erfolgreich ausgeführt. Die TypeScript-Teiltests wurden für V500–V504 separat geprüft.
- Dokumentation und Projektpaket sind für V504 aktualisiert; im ZIP-Archiv ist eine Integritätsprüfung vorgesehen.

## Kompatibilitätsanpassung

`tests/v503-intelligent-concert-performance-regression.cjs` erwartete bislang, dass **V503** als erster Preflight-Check steht. Die angepasste Assertion prüft das weiterhin zusammenhängende V503/502-Testpaar innerhalb der V504-Kette; die eigentlichen V503-Funktions-, Lippen-, Morph- und Posenprüfungen sind unverändert.

## Noch offen

`node scripts/build-preflight.cjs` zeigt **1/17 direkte npm-Abhängigkeiten** verfügbar. Insbesondere Next.js, React, Three.js und deren Typdeklarationen fehlen, daher ist `npm run build` mit vollständigem Projekt-Typecheck **nicht verifiziert**. Echte visuelle GLB-/FBX-Kontrolle und FPS auf Raspberry Pi erfordern Zielhardware und reale Animationsdateien.

Lokal im ausgepackten Projekt:

```powershell
npm install
npm run build
```
