# V1117 · Tests & Release

## Lokale Schritte

- `node tests/v1117-stage-transformation-regression.cjs`
- `npm run test:v1117:types`
- `node scripts/v959-source-preflight.cjs`
- `node tests/v1116-artist-interaction-regression.cjs`

## GitHub CI

Die volle Linux/Windows/Playwright-Pipeline muss nach dem Import durchlaufen.
Die Tests `tests/e2e/ai-stage-transformation-v1117.spec.cjs` prüfen Desktop und Touch.

## Grenzen

V1117 setzt **bestehende** V1040-Formation-Cues und virtuelle Bühnen-Module ein.
Die Showphasen sind vom Benutzer genehmigte Vorlagen, keine erkannten Songabschnitte.
Die Live-Bühne schaltet nur autorisierte, vorhandene visuelle Effekte ein.
Manuelle Bühne, GPU-Limits und reduzierte Bewegung haben Vorrang.
