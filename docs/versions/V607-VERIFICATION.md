# V607 – Verifikation

**Release:** `0.1.0-v607` · 26.10.2026 · aufbauend auf V606.

## Verfahren

- `npm run test:v607`: **38 Testgruppen**, darunter 10.000 deterministische Songzeit-Abtastungen der neuen V607-Sängerinteraktionen.
- `npm run test:v607:types`: isolierter TypeScript-Check, mit den erforderlichen V500-/V599-Typen.
- `npm run test:smoke:v607`: gemeinsame Offline-Regression von V607, V599, V585, V584, V500, V606 und der Architekturreferenzen.
- `npm run verify:v607`: zusätzlich V597-Lip-Sync, V596-Fußarbeit, V595-Bildregression, V572-Deutschrap-Gesichtssteuerung, V589-Langzeit-/GLB-Test und vollständiger Syntax-/Importscan.

## Bestätigte tatsächliche Resultate

- **PASS** `npm run test:v607`: 38 Gruppen, 10.000 Songzeitpunkte.
- **PASS** `npm run test:v607:types`: isolierter TypeScript-Check.
- **PASS** `npm run test:smoke:v607`: V607 + V599 + V585 + V584 + V500 + V606 + Architektur-Check.
- **PASS (einzeln)** `npm run test:v597`, `test:v596`, `test:v595`, `test:v572`, `test:v589`.
- **PASS** `npm run check:syntax`: 831 TS-/TSX-Dateien.
- **PASS** `npm run check:architecture`: 454 referenzierte Codepfade und zehn Architekturabschnitte.
- **Unvollständig:** Ein erster zusammenhängender `npm run verify:v607`-Lauf wurde durch die Laufzeitbegrenzung beendet, nachdem V500 abgeschlossen war. Die noch ausstehenden Teile wurden danach separat erfolgreich ausgeführt. Deshalb wird der *gemeinsame* `verify:v607`-Lauf nicht als durchgelaufen ausgewiesen.
- Der ältere Test `tests/v585-cinematic-duet-camera-face-regression.cjs` kontrolliert jetzt den seit V606 tatsächlich vorhandenen letzten `framedV606`-Kamerasicherheitscheck vor V351; die ältere Form `framedV605` war bereits vor V607 veraltet. Der V606-Releasetest akzeptiert Folgeversionen ab V606 und kontrolliert weiterhin die Einbindung von V606 in `build:preflight`.


## Notwendige echte Abnahme

Es wurden keine echten GLB-Bone-Targets, keine Instagram-/Spotify-Sängerrollen, keine Live-Renderings und keine Raspberry-Pi-FPS erhoben. Tests verifizieren die **rechnerische Steuerung**, nicht, ob die Künstler im Konzertfilm natürlich wirken. Ein gesonderter Browser-/GLB-/Spotify-Sichtcheck und ein Next.js-Produktionsbuild mit installierten Dependencies sind weiterhin nötig.
