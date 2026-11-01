# V685 – Prüfprotokoll

## Erfolgreich (lokal / ohne installierte Projektpakete)

- `npm run test:v685`: **65 Prüfungen** inklusive 10.000 simulierten Bewegungszeitpunkten, deterministischer Song-/Performer-Variation, Rap-Strophen- und Hook-Gesten, timed Lyrics, Schutz der manuellen Rap-Live-Presets, unveränderter Gesicht-/Fuß-/Root-Felder, Grenzen und nichtfiniter Werte.
- `npm run test:v685:types`: **PASS**, isolierter strenger TypeScript-Check.
- `npm run test:quick`: **PASS**, V669–V685 sowie 946 TS/TSX-Syntaxquellen, 606 Architekturreferenzen, 1.597 case-sensitive Quelldateien und Spotify-Build-Umgebungschecks.
- Gezielt **PASS**: V486, V524, V545, V587, V596, V665, V666 sowie V405, V407, V412, V413, V414, V425, V663 und V581. V665/V666-Tests folgen der neuen letzten Pipeline-Stufe, nicht einer hartcodierten vorherigen.
- Isolierte `test:v684:types`, `test:v683:types`, `test:v666:types`, `test:v665:types`: **PASS**.

## Bestehende Grenzen / nicht als erfolgreich behauptet

- `npm run check:dependencies` und `npm run build` **BLOCKIERT**, weil 17 npm-Pakete und `package-lock.json` fehlen. Daher fehlen ein vollständiger App-TypeScript-Check und ein echter Next.js-Produktionsbuild.
- Zusätzlich einzeln aufgerufene Legacy-Tests V437, V523, V538 sind **nicht erfolgreich**: V437 sucht nach einem alten JSX-Integrationstext; V523/V538 erwarten noch die historische monolithische `build:preflight`-Kette aus der Zeit vor V680. Sie sind nicht Teil der erfolgreichen schnellen Suite und werden nicht als Regressionserfolg ausgegeben.
- Keine echten GLB-WebGL-Renderings, visuelle Browser-Abnahme, Vocal-Stem-Analyse oder FPS-Benchmarks in dieser Umgebung.
- Die V685-Bewegungen sind konservative additive Rig-Gesten, **keine** neuen Tanzclips, Lippenphonem-Erkennung, real gemessene Rap-Flow-Erkennung oder Sängerzuordnung.

## Windows-Verifikation

```powershell
npm install
npm run test:quick
npm run test:v685:types
npm run build
```

Visuell prüfen mit Deutschrap-Strophe, Hook, mindestens zwei unterschiedlichen Rap-Songs, drei-/vier-Avatar-Ensemble, manuellen Rap-Presets, fehlenden Lyrics, Pause, reduzierter Bewegung, niedrigem Qualitätsprofil und bestätigtem Fußkontakt.
