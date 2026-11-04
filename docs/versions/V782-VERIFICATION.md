# V782 – Verification

- `npm run test:v782`: Interpolations-Samples 2/3-Frame-Cadence, Quaternion shortest-path, Morph-Interpolation, Cycle Reset und Fail-Closed-Vergleich.
- `npm run test:v782:types`: isolierter TypeScript-Check der pure-TS-Module.
- `npm run verify:v782:static`: V781 und aeltere statische Regressionspruefungen.
- Echte 8 Chromium-Messungen und visuelle Freigabe brauchen installierte Projektpakete und eine laufende lokale Next.js-Instanz.
- V782 ist bewusst nur ein Opt-in im Test-Renderer. Keine Produktionsoptimierung ohne Testbelege.
