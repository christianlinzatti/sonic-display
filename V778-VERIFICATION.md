# V778 – Verifikationsbericht

**Version:** `0.1.0-v778`

Die V778-Analyse verarbeitet nur vorhandene V777-Messungen. Es wurden keine realen FPS-Werte in dieser Umgebung erhoben und keine konkrete Hardware als ausreichend zertifiziert.

- `npm run test:v778`: neue Kernlogik, Eingabevalidierung, 30/45/60-FPS-Ziele, 2-/4-GLB-Szenen, Profile, GPU/Referenz-Modi, Vergleich, UI-Integration, CLI-Bericht und blockierte Läufe.
- `npm run test:v778:types`: isolierter Typcheck.
- `npm run verify:v778:static`: enthält V777-/V776-Rückwärtstests, komplette Syntax, Architektur, Lockfile und Modul-Dateinamen.
- `npm run typecheck` und `npm run build`: ohne die vollständige npm-Installation nicht verifizierbar.
- Browser-/GPU-Vergleich: nicht ausgeführt, da kein produktiver Next.js-Server mit installierten Abhängigkeiten zur Verfügung steht.

Technische Grenzen und Anweisungen in `V778-CONCERT-QUALITY-ADVISOR.md`.

## Tatsächlich ausgeführt

- `npm run verify:v778:static`: **PASS** (V778, V777, V776, Syntax: 1.104 TS-/TSX-Quelltexte, Architektur: 797 Referenzen, Lockfile: 18 direkte Dependencies, Module Case: 1.871 Quelldateien).
- `npm run test:v760` bis `npm run test:v775` (alle 16 expliziten Regressionstests): **PASS**.
- `npm run test:v552`, `npm run test:v569`: **PASS**.
- `npm run test:v778`, `npm run test:v778:types`, `npm run test:v777`: nach der letzten Änderung erneut **PASS**.
- `npm run check:dependencies`: **BLOCKIERT**, 0 von 18 Paketen lokal installiert; deshalb vollständiger Projekt-Typecheck und Next.js-Produktionsbuild **nicht verifiziert**.
- V777 Chromium/GPU-Tests: **nicht ausgeführt** (kein laufender Next.js-Produktionsserver).

**Interpretation:** Alle statischen Regressionen und die isolierte TypeScript-Kernlogik bestehen; eine echte End-to-End-Abnahme mit installierten npm-Paketen ist erforderlich.
