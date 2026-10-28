# V642 – Verifikationsprotokoll

## Automatisierte Prüfungen

- `npm run test:v642`: 66 Testgruppen, 12.000 deterministische Szenarien.
- `npm run test:v642:types`: eigene TypeScript-Kernprüfung.
- `npm run test:smoke:v642`: V642 plus vollständige bisherige Smoke-Kette.
- `npm run verify:v642`: aktuelle und ältere Regie-/Kamera-/Lyrics-/QA-Prüfungen.
- Syntax-/Architekturprüfung aus der bisherigen Testkette.

**Ergebnis (27.10.2026):**

- `npm run test:v642` – PASS: **66** Gruppen, **12.000** deterministische Szenarien.
- `npm run test:v642:types` – PASS.
- `npm run test:smoke:v642` – PASS, **Exitcode 0**; vollständiger verketteter Lauf inklusive Syntax und Architektur.
- `npm run verify:v642` – PASS, **Exitcode 0**; V641/V640/V639/V638/V637/V636/V635, V629/V628/V623/V620/V606/V603 sowie Syntax/Architektur.
- `npm --ignore-scripts run build` – **BLOCKIERT (Exitcode 127)**: `next: not found`,
  weil `node_modules` im bereitgestellten Quellverzeichnis fehlt. Die vorangehende
  Smoke-Kette wurde unabhängig davon erfolgreich getestet.
- Bestehende alte V628/V629-Quelltextregressionen wurden an V642 als letzte
  Regiestufe angepasst; die fachlichen Regressionen laufen weiter. V606 prüft
  den tatsächlichen aktuellen Pfad zur historischen Smoke-Kette.

Logdateien für die Arbeitskopie: `/mnt/data/v642-smoke.log`,
`/mnt/data/v642-verify.log`, `/mnt/data/v642-build.log`.


## Nicht durchgeführt

Realistische GLB-/Vocal-Sichtkontrolle, Browser-Framevergleich bei vollständigen
Songs, Hardware-Benchmarks für Raspberry Pi und Mini-PC.
Ein vollständiger `npm run build` wird nur bei verfügbaren Projektabhängigkeiten
als gültiger Test gewertet.
