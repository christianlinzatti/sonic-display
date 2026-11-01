# V671 – Prüfprotokoll (28.10.2026)

## Bestätigte Tests

- `npm run test:v671`: **PASS**, 40 Gruppen, 21.000 deterministische Szenenpositionen, Grenzen, manuelle Priorität, Trackwechsel, verifizierte Kapitel und Übergangskontinuität.
- `npm run test:v671:types`: **PASS**, strenge isolierte TypeScript-Prüfung des Planers.
- `npm run test:v670` / `npm run test:v670:types`: **PASS** für den abschließenden Qualitätswächter, 38 Gruppen, 10.000 Zustände.
- `npm run test:v669` / `npm run test:v604`: **PASS** für die bestehende Konzertregie und Vollsong-Analyse (71/65 Gruppen).
- `npm run test:smoke:v671`: **PASS** einschließlich der vorherigen Smoke-Kette, Exit-Code 0.
- `npm run check:syntax`: **PASS** (926 TS-/TSX-Quelldateien).
- `npm run check:architecture`: **PASS** (583 Quellreferenzen / 10 Abschnitte).
- `npm run test:module-case`: **PASS** (1.560 Module).
- `npm run check:test-types` / `npm run test:env:spotify-build`: **PASS**.

## Nicht nachgewiesen

`npm run typecheck`: **EXIT 2**, weil lokale React-/Next.js-/Node-Module und Typdefinitionen in dieser Arbeitsumgebung fehlen (`node_modules` nicht installiert). Ein erfolgreicher `next build`, echte WebGL-Browser-Szenen, gemessene FPS, 3D-Lyrics-Verdeckungen und künstlerische Sichtabnahme sind daher **nicht bestätigt**.

## Integration und Grenzen

V671 ist ein deterministischer, sehr kleiner Intensitätsmodulator auf bereits vorhandenen Regie-Lanes, nicht ein neuer Performer- oder Cut-Generator. Ohne V600/V604-verifizierte Szenen gelten nur neutrale Konturen. Manuelle Befehle, Singer-Zuordnung, GLB-Motions, Lyrics-Timing und Foot-IK bleiben unverändert. Der V670-Qualitätswächter ist die **letzte** Stufe vor der bisherigen Kamera-/Licht-/Tanzsteuerung. Die Track-Analyse-Vorschau arbeitet auf lokalem Import; ohne Import kein behaupteter dramaturgischer Höhepunkt.

## Paket

V671-Basis ist **sonic-display-v670-automatic-show-quality-guard.zip**, nicht die alternative ältere V670-Songstruktur-Variante. Vollversion und Patch werden auf ZIP-CRC, Duplikate, Baseline-Vollständigkeit und bytegenaue Patch-Rekonstruktion geprüft. Cache/Build-Transientdateien werden ausgelassen.
