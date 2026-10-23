# Sonic Display V430 – Prüfnachweis

Stand: 21. Oktober 2026

## Bestätigt

- `node tests/v430-rap-camera-shot-studio-regression.cjs`: **PASS**. Behandelt automatische/feste/ausgesetzte Kameraeinstellungen, Track- und Lyrics-Zeilenisolation, Stärkebegrenzungen, ungültige lokale Persistenzdaten, manuelle Prioritäten, explizites Speichern/Zurücksetzen sowie Integration in V429 und das bisherige UI.
- `tsc -p tests/tsconfig.v430-core.json`: **PASS** – strenge Typprüfung der isolierten V425/V429/V430-Kernlogik.
- `node tests/v429-cinematic-rap-camera-regression.cjs`: **PASS**.
- Regressionen `test:v407` bis `test:v411`, `test:v418` bis `test:v426`: **PASS** in direkten Einzeltestläufen.
- Regressionen `test:v400` bis `test:v403`, `test:v405`, `test:v406`: **PASS** in früherem Durchlauf.
- `node tests/check-source-syntax.cjs`: **PASS** (581 TS/TSX-Dateien).
- `npm run test:imports`: **PASS** vor dem abschließenden V430-Optimierungspatch (920 Projektdateien / 1972 Importe). Der V430-Kern wurde danach erneut typgeprüft; eine weitere vollständige Import-Suite ist nicht abschließend bestätigt.
- `npm run test:module-case`: **PASS** vor dem letzten V430-Optimierungspatch (920 Quelldateien ohne Namenskollisionen).
- Ältere Versionslisten in 14 bestehenden Tests (V400–V422) wurden auf Mindestversionen umgestellt. Die funktionalen Tests blieben erhalten.

## Offen / nicht bestätigt

- Der komplette npm-Offline-Gesamtlauf (`test:v404`, `verify:offline:fast`) wurde in dieser Umgebung wegen Zeitlimit **nicht vollständig abgeschlossen**.
- `node scripts/build-preflight.cjs` meldet **BLOCKED**: `package-lock.json` fehlt im Ausgangsarchiv und 16/17 npm-Abhängigkeiten stehen hier nicht zur Verfügung (inkl. `next`, `react`, `three`, R3F).
- `npx tsc --noEmit` und `npm run build` können ohne Abhängigkeiten hier **nicht als erfolgreich bestätigt** werden.
- Kein Browser-/GPU-/GLB-Sichttest für Live-Kamerabewegungen. Die mathematische Kameraplanung und die Source-Integration wurden getestet.

## Empfohlene Abschlussprüfung unter Windows

```powershell
npm install
npm run test:v430
npm run test:v429
npx tsc -p tests/tsconfig.v430-core.json
npm run check:syntax
npm run test:imports
npm run test:module-case
npx tsc --noEmit
npm run build
```

Ein grüner isolierter Kern-Test ist **nicht** gleichbedeutend mit einem vollständigen produktionsverifizierten Build.
