# V908 – Technische Verifikation (Entwicklungsversion)

## Erfolgreich

- V908 eigene Tests: **966/966 erfolgreich**.
- Direkte Funktions-Regressionen **V880–V908: 29/29 Testgruppen erfolgreich**.
- Historische Szenen- und Qualitätsregressionen **V830, V832, V825, V826, V827, V834, V604, V540, V550, V841, V842, V871** erfolgreich.
- Isolierte TypeScript-Prüfungen V908 (core & UI): **bestanden**.
- Weitere isolierte Core-/UI-Typprüfungen V907–V891 vollständig erfolgreich; V890-Core erfolgreich. Der separate weitere Typprüfungsdurchlauf wurde durch das Laufzeitlimit beendet.
- Syntax/Import-Prüfung: **1.326 TS/TSX-Dateien** bestanden.
- Architekturprüfung: **1.103 Verweise**, alle dokumentierten Abschnitte vorhanden.
- Windows-/Linux-Dateinamenprüfung: **2.268 Module**, keine Groß-/Kleinschreibungskollisionen.
- Paket- und Lockfile-Version: `0.1.0-v908`, CI und PowerShell-Gate aktualisiert.
- ZIP-Einträge, Namen und Inhaltsintegrität geprüft.

## Nicht vollständig abgeschlossen / kein Produktionsfreigabe-Nachweis

- `npm run verify:v908:focused`: durch Ausführungszeitlimit **nach erfolgreichen V908–V900-Teilschritten unterbrochen**, **kein Exit-0-Nachweis** der gesamten verketteten Kette. Deshalb die 29 direkten Tests separat ausgeführt.
- `npm ci --offline --no-audit --no-fund`: **Exit 1 / ENOTCACHED** (`zustand@5.0.16` fehlt im Offline-Cache).
- `npm run typecheck`: **Exit 2**, fehlende Next.js-/React-/Node-Dependencies (u.a. `next/server`).
- `npm run build --ignore-scripts`: **Exit 127**, `next: not found` (Next.js nicht installiert).
- Kein Browser-/WebGL-Benchmark und kein Test auf Raspberry-Pi-/Mini-PC-Hardware.

## Grenzen des Nachweises

- V830 zählt SkinnedMesh-Geometrien in benannten, sichtbaren Darsteller-Slots; kein GLB-Datei-Herkunftsnachweis, kein Beweis über unbekannte zusätzliche SkinnedMeshes außerhalb dieser Bühnen-Slots.
- Die zusätzliche V908-Gegenprüfung scannt alle vier erwarteten Darsteller-Slots, damit keine zusätzlich sichtbare Figur in diesen Slots die Besetzungszählung verfälscht.
- V826-Lane-Zähler zeigen nur bestimmte aktive Effektmengen (Publikum, Partikel, Schaum, Kinetik, Spektral). Laser, LEDs, Lichtkegel, Shader-Wirkung, optische Qualität und ausgewählte FX-Intensitätsstufe sind dadurch **nicht vollständig verifiziert**.
- Nur genau zuordenbare echte V826-Publikationen für tatsächlich angenommene V905-Messfenster zählen. Fehlende Fenster oder fehlender Rig-Nachweis ergeben **keinen bestätigten Lauf**.
- Belege nur in der lokalen Sitzung, maximal 18 Läufe, beim Löschen mit entfernt; JSON ohne private Song-ID oder Rohdaten.
- FPS stammen aus Frame-Abständen, nicht aus GPU-Timern; PC-Ergebnisse erlauben keine Raspberry-Pi-Prognose.

**Status: geprüfte Entwicklungsversion, keine bestätigte Produktionsfreigabe.**
