# V661 – Verifikation (28.10.2026)

## Erfolgreich ausgeführt

- `npm run test:v661` – künstliche isolierte Vocal-Stem-Datei mit Signalphrasen, Pausen und Einsatz-Kandidaten; nachgewiesene Track-/Slot-/Playing-Grenzen, Halb-offene Zeitbereiche, Opt-in, Session-Cleanup und gesperrter Lippenkontakt; UI-/Rig-Verkabelung.
- `npm run test:v661:types` – strikte isolierte TypeScript-Prüfung des V661/V643-Kernmoduls.
- `npm run test:v643`, `npm run test:v644`, `npm run test:v631`, `npm run test:v632`, `npm run test:v645` – vorhandene Offline-Audio-, manuelle Visem-, Mehrkünstler- und Gesichts-Regressionen.
- `npm run test:smoke:v661` – vollständig abgeschlossen, **Exit Code 0**. Enthält die V660-Zuordnung, V659-Motion, V658-Konfiguration, V657-Gerätebackup, V656-Release-Gate, V655-Kamera, V654-Ressourcen- und Integritätsprüfungen sowie viele ältere Tests bis V616.
- `npm run check:syntax` – 913 TypeScript-/TSX-Dateien.
- `npm run check:architecture` – Versionsnummer V661, 568 vorhandene Quellverweise und 10 Dokumentationskapitel.
- `npm run test:module-case` – 1.536 Sourcefiles ohne nur durch Groß-/Kleinschreibung unterschiedliche TypeScript-Modulpfade.
- `npm run check:test-types` – Test-Only Typ-Deklarationen vom Release-Gate getrennt.
- `npm run test:env:spotify-build` – Spotify-Konfiguration ohne Umgebungs-Client-ID beim Import.

## Ausdrücklich nicht nachgewiesen

- `npm run typecheck` versucht, **Exit Code 2**, da das aktuelle Arbeitsverzeichnis ohne `node_modules` keine React-, Next.js-, React Three Fiber-, Three.js- und Node-Typen hat. Es verbleiben Tausende daraus resultierende Diagnosemeldungen; folglich ist ein echter vollständiger Typcheck **nicht bestanden** und zusätzliche genuine TypeScript-Fehler können nicht ausgeschlossen werden.
- **Next.js-Produktionsbuild** sowie Windows-/Linux-GitHub-Actions-Läufe sind hier nicht durchgeführt/überprüft.
- **Echte Live-3D-/GPU-Browser-, Kopfhörer-/Audio- und Plugin-Integrationstests** sind nicht durchgeführt. Die Tests prüfen deterministische Signalmerkmale und Code-Invarianten, nicht die visuelle Qualität tatsächlicher Mundbewegungen.
- Es gibt weiterhin keine versionierte `package-lock.json`, womit das CI-Nachladen der Abhängigkeiten nicht reproduzierbar ist.

## Freigabe

Dies ist eine implementierte und umfassend regressionsgeprüfte **Build-Kandidaten-Version**, keine freigegebene Produktionsversion. Für finale Freigabe: installierte Abhängigkeiten, `npm run typecheck`, `npm run verify` mit vollständigem Next-Build und Bestätigung der Windows- und Ubuntu-CI-Ergebnisse.

Das Feature behauptet **keine** automatische Phonem-, Wort-, Sänger- oder Stimmentrennung von Spotify-Audio. Es erwartet vom Nutzer ausdrücklich bereitgestellte und schon isolierte Vocal-Stems; die V643-80-ms-Daten bieten nur grobe Dynamikhinweise. Die optionale Live-Kiefermodulation wahrt manuelle V644-Viseme und bestehende Mundprioritäten.
