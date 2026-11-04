# Sonic Display V837 – Advanced Deutschrap Lip-Sync 7.0

## Änderungen

- Neues deterministisches Modul `components/visualizer/advancedDeutschrapLipSyncV837.ts`: auf **synchronisierten Wort-Zeitmarken** basierte, eng begrenzte Attack-/Release-Anpassungen der vorhandenen Morph-Interpolation.
- Direkte Integration in `VocalRigV368.tsx` – keine zweite Gesichtsanimation, kein zusätzlicher Render-Loop, keine neu angelegten GLB-Assets oder WebGL-Materialien.
- Für bereits autorisierte Lead-/Feature-Performer: natürlicheres Nachziehen schneller Wörter und sanftere Phrasenenden bei expliziten End-Zeitmarken; mögliche B/P/M-Lippenverschlüsse werden nur beschleunigt, wenn das bestehende Ziel sie bereits verlangt.
- V385/V496-Sängerzuordnung bleibt erforderlich; manuelle Silben-/Phonem-Viseme, Audio-Mund-Overrides, Vocal-Stems, Face-Previews und authored GLB-Animationen behalten Priorität.
- Keine Erkennung von tatsächlichen Phonemen, Silbengrenzen oder Stimmen aus Audiodaten. Die Zeitmarke ist ein Wortintervall und kein nachgewiesener Phonem-Onset.

## Automatisierte Prüfung (lokal)

| Prüfung | Ergebnis |
| --- | --- |
| `node tests/v837-advanced-deutschrap-lip-sync-regression.cjs` | PASS, 71 Testgruppen |
| `tsc -p tests/tsconfig.v837-core.json --noEmit` | PASS, isolierte strenge Typprüfung |
| Tests V800 bis V836 (jeweilige Regression-Datei) | PASS, 37/37 Suiten |
| `node tests/check-source-syntax.cjs` | PASS, 1208 TS/TSX-Dateien |
| `node tests/check-architecture.cjs` | PASS |
| Build Doctor V831 | Paket/Lockfile, Node, Modulnamen und Skripte bestanden; lokale TypeScript-/Next-Abhängigkeiten fehlen |
| V831 Production Gate (Audit) | BLOCKIERT (korrekt bei fehlenden Abhängigkeiten) |
| Vollständiges `tsc --noEmit` | NICHT ABGESCHLOSSEN (14-s-Limit) |
| `next build` | NICHT AUSGEFÜHRT (lokales Next.js fehlt) |
| Browser, tatsächliche GLB-Gesichtsbewegung, GPU und audiovisuelle Deutschrap-Abnahme | NICHT AUSGEFÜHRT |

## Freigabeentscheidung

**Integration und regressionsgetestet, KEINE Produktionsfreigabe.** Isolierte Typchecks
ersetzen nicht den vollständigen Projekt-Typecheck. Wortzeit-Stabilität ersetzt
keine echte Prüfung von Lippensynchronität, Gesichtsmorph-Zuordnungen,
Sänger-/Adlib-Timing und visuellen Übergängen im Browser.

## Automatische Freigabe auf GitHub

Der bestehende Workflow `.github/workflows/v832-continuous-validation.yml`
führt nach `npm ci` `npm run verify:production:v831` auf Linux und Windows aus.
Die V837-Tests sind in `check:release`, `check:fast` und `build:preflight`
vorgeschaltet. Das Einchecken der V837-Projektdateien aktiviert die neuen
Prüfungen – das Vorhandensein des Workflows bedeutet nicht, dass er schon lief.
