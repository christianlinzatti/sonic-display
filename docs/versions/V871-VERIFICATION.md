# V871 – Prüfprotokoll (02.11.2026)

**Basis:** V870; Projektversion `0.1.0-v871`. Die neue Koordination wurde als reiner V871-Planer und als letzter V817/V843-FX-Sichtschutzschritt in `DynamicStage.tsx` eingebaut.

## Hier erfolgreich ausgeführt

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v871` | PASS – **138** neue Testgruppen inklusive Integration mit echten V817/V844–V847-Planern |
| `npm run test:v871:types` | PASS – isolierter TypeScript-Core |
| `npm run test:v870` / `npm run test:v870:types` | PASS – 143 / PASS |
| `npm run test:v869` / `npm run test:v869:types` | PASS – 129 / PASS |
| `npm run test:v868` / `npm run test:v868:types` | PASS – 197 / PASS |
| `npm run test:v867` | PASS – 61 Testgruppen |
| `npm run test:v866` / `npm run test:v866:types` | PASS – 219 / PASS |
| `npm run test:v850` / `npm run test:v850:types` | PASS – 135 / PASS |
| `npm run test:v847` / `npm run test:v847:types` | PASS – 125 / PASS |
| `npm run test:v846` / `npm run test:v846:types` | PASS – 54 / PASS |
| `npm run test:v845` | PASS – 111 Testgruppen |
| `npm run test:v844` / `npm run test:v844:types` | PASS – 98 / PASS |
| `npm run test:v843` / `npm run test:v843:types` | PASS – 71 / PASS |
| `npm run test:v817` / `npm run test:v817:types` | PASS – 16 / PASS |
| `npm run test:v831` / `npm run test:v832` | PASS – 48 / 53 Testgruppen |
| `npm run check:syntax` | PASS – 1.265 TS/TSX-Dateien |
| `npm run check:architecture` | PASS – V871, 1.009 Referenzen, 10 Architekturabschnitte |
| `npm run test:module-case` | PASS – 2.154 Dateien, keine case-insensitiven TS/TSX-Kollisionen |
| `npm run check:test-types` | PASS – React/R3F Ambient-Typisolierung |
| `npm run test:v86513:windows-eol` | PASS – 10 Windows-CRLF-Simulationen |
| `npm run test:v86512:flat` | PASS – 15 Flat-NPM-Tests |
| `npm run test:smoke:v665:flat` | **PASS – alle 102 Schritte, Exit-Code 0** |

Die Regressionen bestätigen: kein FX wird neu aktiviert; alle Counts/Gains/Alpha-Werte sind gegenüber autorisierten Eingabecues monoton nicht zunehmend. Verifizierte Genres/Abschnitte, Drop-Schwerpunkte, verschiedene Performer-Sichtschutzsituationen, manuell gesperrte V823-Spuren, explizite Flash-Konfiguration, stabile Seek-Ergebnisse sowie Integrationsstellen werden geprüft.

## Noch offen / keine Produktionsfreigabe

- **Vollständiger Next.js-/React-Typecheck und Produktionsbuild:** `node_modules` existiert hier nicht. Die Laufzeitpakete `react`, `next` und `@react-three/fiber` fehlen, deshalb ist ein vollständiger Projekt-Typecheck bzw. Next-Produktionsbuild **nicht erfolgreich durchgeführt**. Der erfolgreiche isolierte Core-Test ist dafür kein Ersatz.
- **Echter Windows-CI-Lauf:** Hier nur Linux-Tests und Windows-CRLF-/Pfad-Simulation. Die vorhandene V832-GitHub-Actions-Matrix prüft neue V871-Tests künftig auf Ubuntu und Windows, sofern der Workflow tatsächlich gestartet wird.
- **Echte visuelle WebGL-Abnahme:** GLB-Avatare, Nahaufnahmen, Lyrics, reale Audiosignale und Performance auf Zielhardware noch nicht geprüft. Der normierte Coverage-Wert ist eine Heuristik, keine Messung der realen Bildüberdeckung.

## Vollständige Freigabeprüfung auf Windows

```powershell
npm ci
npm run test:v871
npm run test:v871:types
npm run test:smoke:v665:flat
npm run verify:production:v867
```

Der Produktionscheck enthält die vollständige `typecheck`- und Next.js-Buildprüfung. Den generierten lokalen Releasebericht anschließend im `v867-release-dashboard.html` öffnen und die GitHub-Actions-Matrix Windows/Ubuntu prüfen.

**Status:** V871 implementiert, Regressionen grün, **keine Produktionsfreigabe ohne echten Full-Typecheck/Build/visuellen Test**.
