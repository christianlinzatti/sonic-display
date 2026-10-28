# V615 – Verifikation (27.10.2026)

## Erfolgreich lokal ausgeführt

- `npm run test:v615`: **18 Gruppen** und **8.401 deterministische Full-Song-Samples**, 26 unterscheidbare kompatible Clips (synthetische Testkandidaten).
- `npm run test:v615:types`: isolierter TypeScript-Kerncheck erfolgreich.
- `npm run test:smoke:v615`: gesamte verschachtelte Smoke-Testkette inklusive V614, V613, V612, V588, V493, Syntax und Architektur bestanden.
- Angrenzende Regressionen zusätzlich einzeln: V536, V530, V535, V565, V588, V493 und V614 bestanden.
- `npm run check:syntax`: 839 TypeScript/TSX-Dateien ohne Syntax-/Importbindingfehler.
- `npm run check:architecture`: Dokumentationsstand V615, Referenzen und 10 Architekturbereiche korrekt.

## Grenzen der Aussage

- Die GLB-/motion-spezifischen Unit-Tests berichteten in dieser Umgebung **0 reale GLB-Testdateien**; die 26 Variationen sind nachvollziehbare **simulierte** Song-Samples, keine visuellen Aufnahmen.
- Ein kompletter `next build` und ein vollständiges `npx tsc --noEmit` waren hier **nicht** möglich, da `node_modules` nicht in dem ZIP enthalten ist und die notwendigen Installationspakete hier nicht vollständig verfügbar sind. Die isolierten TypeScript-Kerntests sind bestanden; bitte den vollen Produktionsbuild auf Windows ausführen.
- `npm run test:all` (sämtliche registrierten Tests) ist aus V613 übernommen, wurde hier nicht vollständig ausgeführt.
- Echte Browser-Abnahme: Tempo, Kontinuität, Lyrics, Fußkontakt, Mundbewegung und Performance mit mehreren GLB-Avataren prüfen.

## Windows-Befehle

```powershell
npm run test:smoke:v615
npx tsc --noEmit
npm run build
# optional die vollständige Testpalette:
npm run test:all
```
