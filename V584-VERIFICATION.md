# V584 – Verifikationsstand, 26.10.2026

## Bestanden

- `npm run test:v584`: **18** gezielte Assertions-Gruppen mit Tausenden zeitbasierter Samples, Rollen-/Track-Schutz, 2–4 Avataren, Hooks, Hand-offs und Reproduzierbarkeit nach Seek.
- `npm run test:v584:types`: isolierte TypeScript-Typprüfung erfolgreich.
- `npm run test:smoke:v584`: **vollständig erfolgreich**, einschließlich V583 (55 Checks), V582 (64), V581 (63), V580 (79 + 12.000 Samples), V500, V504 (24.000 Samples), Syntax/Import (803 TS/TSX-Dateien) und Architektur (371 Pfadreferenzen).
- Isolierte `test:v582:types`, `test:v581:types` und `test:v580:types` beim ersten erweiterten Aufruf ausgeführt und erfolgreich; V563 GLB-Duett-Regression mit **43** Prüffällen bestanden.
- V500-Öffentlichkeitsvertrag bewahrt: historischer V580-Quellcode-Regressionsschutz bestätigt weiterhin `return refineDuetResponseV575`. V584 wird *innerhalb* von V575 als neue Verfeinerung ausgeführt.

## Einschränkungen

- Der historische umfangreiche Testpfad `test:v509` (36.000 Formations-/IK-Berechnungen) beendete den langen Gesamtlauf in dieser Umgebung nicht innerhalb des verfügbaren Ausführungslimits; er wird nicht als bestanden ausgewiesen.
- Ein zweiter erweiterter Lauf erreichte das Zeitlimit während der zusätzlichen TypeScript-Prüfungen; die bereits abgeschlossene kompakte Smoke-Kette ist davon unabhängig erfolgreich.
- Kein `node_modules` im Projektarchiv und in dieser Umgebung verfügbar. **Vollständiger** `npm run typecheck` und `npm run build` wurden nicht als erfolgreich ausgegeben; Build auf Entwicklungs-PC nach `npm install` ausführen.
- Keine echte Chromium-/3D-/GLB-Videoprüfung und **keine Raspberry-Pi-Hardware-FPS-Messung** in dieser Umgebung.

## Wiederholbare Befehle

```bash
npm run test:smoke:v584
npm run verify:v584
npm install --no-audit --no-fund
npm run typecheck
npm run build
# Bei Bedarf zusätzlich: npm run test:v509
```

Hardware-Benchmark und visuelle Prüfmatrix: `V584-NATURAL-DUET-STAGE-INTERACTION-3.md`.
