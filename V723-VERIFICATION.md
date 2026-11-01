# V723 – Prüfung / Personal Dashboard Studio

Prüfumgebung: Linux, Node v22.16.0, npm v10.9.2, globaler `tsc` 5.8.x; Ausgangsbasis V722 mit vollständigem Quelltext, jedoch ohne installierte npm-Abhängigkeiten und ohne `package-lock.json`.

## Erfolgreich nachweisbar

- `npm run test:v723`: **PASS**, 112 Prüfungen für sechs Widgets, Größen, Sichtbarkeit, Mindestanzahl, Reihenfolge inkl. versteckter Einträge, Drag-&-Drop-/Touch-UI-Verdrahtung, Kontotrennung, saubere Migration, Browser-Speicherfehler, Manipulationsabwehr und keine zusätzlichen Scrobble-Schreiboperationen.
- `npm run test:v723:types`: **PASS**, isolierter TypeScript-Check des neuen V723-Datenkerns.
- `npm run test:v723:ui-types`: **PASS**, isolierter TypeScript-Check einschließlich Dashboard Studio, V722-Migration und `LastFmHistoryPanelV706`.
- `npm run test:v722`: **PASS**, 109 bestehende V722-Prüfungen; Navigation, Kennzahlen, Archivdatenlogik und UI beibehalten. Die Assertions wurden an die durch V723 notwendige Account-Prop und Versionsfortschreibung angepasst.
- `npm run test:quick`: **PASS (Exit 0)**, vollständige projektübergreifende Schnelltest-Kette mit älteren Konzert-/3D-/Avatar-/Lyrics-/Audio-/Spotify-/History-Regressionen und den Qualitätsprüfungen.
- `npm run check:syntax`: **PASS**, 1.011 TS/TSX-Dateien.
- `npm run check:architecture`: **PASS**, 682 aktuelle Code-Referenzen, 10 Dokumentationsabschnitte.
- `npm run test:module-case`: **PASS**, 1.706 Dateien, keine case-insensitiven Modulnamenskollisionen.
- `npm run check:test-types`: **PASS**, acht test-only Typdeklarationen vom Produktionscode isoliert.

## Nicht freigegeben / Einschränkungen

- `npm run check:dependencies`: **Exit 1**, 0/17 benötigte Pakete vorhanden; `package-lock.json` fehlt.
- `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund`: **ENOTCACHED**, `@react-three/drei` ist nicht im lokalen npm-Cache. Ein anschließender Online-Lockfile-Versuch konnte innerhalb des verfügbaren Netzwerkzeitfensters nicht abgeschlossen werden. **Kein Lockfile erfunden.**
- `npm run typecheck`: **Exit 2**, insgesamt 24.155 TypeScript-Diagnosen, wesentlich durch fehlende React-/Next.js-/Node-/Three-Typen und daraus folgende JSX-/Implicit-any-Folgefehler. Die gezielten V723-Typprüfungen bestehen, aber ein umfassender TypeScript-Gesamtcheck ist nicht gelungen.
- `npm run build`: **Exit 1**, durch die vorhandene `prebuild`-Abhängigkeitskontrolle blockiert. **Kein erfolgreicher Next.js-Produktionsbuild.**
- Keine manuelle Ausführung auf einem realen 10-Zoll-Touchscreen oder einem Raspberry Pi.

## Endgültige Freigabe auf Windows

Im vollständigen V723-Projektverzeichnis:

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
```

Das durch `npm install` erzeugte `package-lock.json` in der Versionsverwaltung behalten und danach für CI `npm ci` benutzen. Erst mit erfolgreichem Gesamt-Typecheck und Produktionsbuild als produktionsreif markieren.

## Datenschutz und Kompatibilität

Layoutdaten liegen ausschließlich im Browser und sind vom kanonischen Last.fm-Nutzernamen isoliert. Kein Spotify-/Last.fm-API-Zugriff durch das Layout Studio und kein zusätzlicher Scrobbler. Alte IndexedDB-Scrobbles, V722-Statistiken und andere Konten bleiben unangetastet. Fehlerhaftes Layout führt zu sauberem Standardzustand statt zum Löschen des Archivs.
