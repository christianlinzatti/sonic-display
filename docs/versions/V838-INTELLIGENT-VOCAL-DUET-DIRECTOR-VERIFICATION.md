# Sonic Display V838 – Intelligent Vocal & Duet Director 3.0

## Implementierung

- `components/visualizer/intelligentVocalDuetDirectorV838.ts` implementiert einen deterministischen, track-/zeitgebundenen Regieplan für verifizierte V528/V797-Sängerrollen. Möglich sind bestätigte `handoff`, `duet` und `ensemble`-Situationen; ohne nachgewiesene Besetzung bleibt V838 inaktiv.
- `ThreeAvatar.tsx`: ein gemeinsamer V838-Plan für die bestehende Kamera, Bühnenlicht und Gruppen-Avatare; keine zusätzliche Kamerainstanz oder Render-Schleife.
- `StageCameraDirectorV289.tsx`: kleiner, begrenzter Kameraschwenk nach V809, V540/V550-Vergleich auf Bildüberlauf, abschließender V351-Lyrics-Schutz. Ungünstige Kameraschwenks werden verworfen.
- `DynamicStage.tsx`: bestehende V797-Beleuchtung erhält nur eine eng begrenzte Modulation ihrer vorhandenen Multiplikatoren; manuelle Lichtvorgaben und abgeschaltete Lichtkanäle bleiben maßgeblich.
- `GroupDancersV326SceneV492.tsx`: nach V807 wird bei sichtbaren, ausreichend voneinander entfernten Performer-Rigs eine kurze gegenseitige Blickreaktion ergänzt. Die Quelle V632 muss einen tatsächlich zugewiesenen `backing`-Part belegen, bevor ein Adlib-Akzent verwendet wird.
- Kein automatisches Erkennen neuer Sänger, kein aus Feature-Credits abgeleiteter Gesang, keine Audio-Trennung, keine zusätzlichen Kopf-/Gesichts-Morphs, keine Änderung an IK, Root-Motion, Footwork oder manuell gesetzten Clips.

## Teststatus (in dieser Umgebung durchgeführt)

| Test | Status |
| --- | --- |
| `node tests/v838-intelligent-vocal-duet-director-regression.cjs` | PASS – 93 Testgruppen |
| `tsc -p tests/tsconfig.v838-core.json --noEmit` | PASS – isolierte strenge TypeScript-Prüfung |
| Regressionen V800–V837 | PASS – 38/38 Suiten |
| `npm run check:syntax` | PASS – 1.209 TS-/TSX-Quelldateien |
| `npm run check:architecture` | PASS |
| V831 Build Doctor | Paket/Lockfile, Modulnamen und Release-Skripte PASS; lokale TypeScript-/Next.js-Abhängigkeiten fehlen |
| Vollständiges `tsc --noEmit` | NICHT ABGESCHLOSSEN – Zeitlimit 14 Sekunden, kein Abschlussresultat |
| `next build` | NICHT AUSGEFÜHRT – lokale Next.js-Abhängigkeiten fehlen |
| Reale Browser- und GLB-/GPU-Konzertabnahme | NICHT AUSGEFÜHRT |

**V838 ist integriert und gezielt regressionstestet, aber NICHT produktiv freigegeben.** Eine isolierte TypeScript-Prüfung ersetzt weder die vollständige Projekt-Typprüfung noch eine visuelle Prüfung echter GLB-Sänger. Auch Kamera- und Blickqualität in mehreren Genre-Songs muss im Browser bestätigt werden.

## Freigabekette

Die bestehenden Windows-/Linux-Workflows unter `.github/workflows/v832-continuous-validation.yml` und der manuelle Workflow aus V831 bleiben enthalten. `test:v838` und `test:v838:types` laufen am Anfang von `build:preflight`, `check:fast` und `check:release`. GitHub-Prüfungen werden dadurch erst beim Einchecken des neuen Projektstands ausgelöst; für diesen lokalen ZIP-Stand wurde kein GitHub-Job ausgeführt.
