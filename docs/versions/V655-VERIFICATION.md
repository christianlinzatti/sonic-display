# V655 – Verifikationsstand (28.10.2026)

Basis: V654 State Integrity Hotfix inklusive frueherer Ressourcen- und Metadaten-Fixes.

Erfolgreich durchgefuehrt:

- `npm run test:v655`: verifizierte Singer-Fokussierung, Shot-Mindestzeiten,
  3 Varianten, Seek/Trackwechsel, manuelle/lyric/quality gates sowie
  4.000+ simulierte R3F-Songpositionen (154s in 37ms-Schritten).
- `npm run test:v655:types`: TypeScript-Pure-Module ohne Fehler.
- `npm run test:v429`, `npm run test:v540`, `npm run test:v540:types`,
  `npm run test:v550`, `npm run test:v550:types`,
  `npm run test:v605`, `npm run test:v613`, `npm run test:v633`,
  `npm run test:v454`, `npm run test:v403` erfolgreich.
- `npm run test:v651`, `npm run test:module-case`,
  `npm run check:test-types`, `npm run check:syntax`,
  `npm run check:architecture` erfolgreich.
- `npm run test:smoke:v655` vor Erweiterung um vier historische Kamera-Checks:
  vollstaendig bestanden. Der anschliessende erweiterte Wiederholungslauf
  hat alle V655-/Kamera-/V654- bis V616-Tests bestanden, wurde aber beim
  abschliessenden `check:syntax` durch das Ausfuehrungslimit unterbrochen.
  `check:syntax` und `check:architecture` liefen danach separat erfolgreich.

Nicht abschliessend verifiziert:

- Vollstaendiger Projekt-TypeScript-Check und `next build` (keine lokalen
  node_modules / Next.js-/React-Abhaengigkeiten in der Testumgebung).
- Historische Gesamtsuite und Windows-/Ubuntu-GitHub-Actions-Lauf fuer V655.
- Echte Browser-Kamera-/GPU-Qualitaetsvalidierung mit 2–4 GLB-Avataren.

Freigabe erst nach `npm run verify` und erfolgreichen CI-Jobs.
