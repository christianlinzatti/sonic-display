# Sonic Display V415 – Verification

## Geprüft (offline)

- `npm run test:v415`: **PASS** – B/P/M-Wortanfang, kurze Wortübergänge, separate Lippen-Zeitverschiebung ohne Änderungen am Körper-/Songtakt, unsynced/Instrumental/Zeilen-Fallback, Sängerrollen, Pause, Reduced Motion, Grenzwerte und Wiederholbarkeit.
- `tsc -p tests/tsconfig.v415-core.json`: **PASS** – isolierte TypeScript-Strict-Prüfung der neuen Mundlogik und der erweiterten Vocal-Engine. Eine kleine `three`-Typ-Stelle ist ausschließlich für diesen Offline-Test deklariert und wird nicht im produktiven TypeScript-Pfad benötigt.
- `npm run test:v414`, `test:v413`, `test:v412`, `test:v411`, `test:v410`, `test:v409`, `test:v408`, `test:v407`, `test:v404`, `test:camera-hold`: **PASS** nach Aktualisierung rein versionsbezogener historischer Assertions.
- `npm run verify:offline`: startete erfolgreich und lief bis V355 ohne Funktionsfehler; Umgebungslimit unterbrach den mehrminütigen Gesamtlauf. Die restlichen verfügbaren Versionstests **V356–V415: 59/59 PASS** separat ausgeführt.
- `npm run check:syntax`: **PASS**, 558 TS/TSX-Dateien.
- `npm run test:imports` und `npm run test:module-case`: **PASS**, 883 Projektquelldateien und 1.859 lokale Imports.
- `npm run doctor:quality`: statische Prüfungen **PASS**; 16 von 17 installierten npm-Modulen fehlen hier; `package-lock.json` nicht vorhanden.

## Nicht bestätigt

Der **vollständige** `npx tsc --noEmit`, ein echter Next.js-Produktions-Build, die Browser-Darstellung sowie die Animation an einem externen GLB-Modell wurden in dieser Umgebung **nicht** geprüft. Es handelt sich um eine Offline-Entwicklungsprüfung; realer Wort-Sync hängt vom Lyrics-Provider und der Qualität des Avatar-Rigs ab.

## Windows-Abnahme

```powershell
npm install
npx tsc --noEmit
npm run build
npm run dev
```

Danach im Vocal Sync Inspector einen Deutschrap-Track mit Wortzeitstempeln wählen. V415 aktivieren, Präzision 70 %, zunächst Versatz 0 ms testen und anschließend kleine Mundversatz-Schritte zwischen −150 und +150 ms vergleichen. Pausieren, in Instrumental-Lücken spulen und Zweit-Avatare prüfen. Bei deaktivierter V415-Funktion soll das bisherige V414-Mundverhalten bestehen bleiben.
