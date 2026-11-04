# V624 – Verification

**Version:** 0.1.0-v624

## Bestanden

- `npm run test:v624`: **27 Regressionstest-Gruppen**, einschließlich **12.320 simulierten Hardstyle-/Hardtekk-Song-Zeitpunkten**.
- `npm run test:v624:types`: PASS (fokussierter TypeScript-Kerntest).
- `npm run test:smoke:v624`: PASS. Enthält V623, V622, V621, V620, V619, V618, V617, V616, V610 sowie Syntax und Architektur.
- `npm run verify:v624`: PASS. Zusätzlich V609, V608, V611, V536, V542, V601 und V623 TypeScript.
- `npm run check:syntax`: PASS für **848** TS/TSX-Dateien.
- `npm run check:architecture`: PASS mit **502** überprüften Codeverweisen, zehn Architekturabschnitten.

## Validiert

- V624 steuert vorhandene V610-Automatikkanäle für Tanz, Kamera und Licht. Keine neue Szene, kein Licht oder zusätzliche Animation.
- Drop-Akzent nur bei verifiziertem V604-Songakt UND ausreichender tatsächlicher Energie/Kick; kein erfundener Beat, kein dauerhaftes Strobing.
- Wiederholte Hooks verwenden andere Betonungen; Build-Anstieg hängt von der Zeit im bestätigten Abschnitt ab.
- Schutz gegen manuelle Einstellungen, Szenen ohne verifizierte Daten, Pause, reduzierte Bewegung und Low-Tier.
- Existing V610/V623 regression checks remain green.

## Lokal noch erforderlich

Im bereitgestellten Quellprojekt sind keine `node_modules` vorhanden. Daher wurden **der vollständige TypeScript-Projektlauf** und **der Next.js-Produktionsbuild** hier nicht durchgeführt. Auch die visuelle Qualität mit echten GLB-Avataren auf mehreren vollständigen Songs ist noch zu kontrollieren.

```powershell
npm install
npm run test:smoke:v624
npm run verify:v624
npx tsc --noEmit
npm run build
```
