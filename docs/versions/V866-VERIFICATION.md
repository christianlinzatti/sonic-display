# V866 – Teststand (02.11.2026)

| Prüfung | Status |
|---|---|
| `npm run test:v866` – 219 Genre- und Safety-Gruppen | PASS |
| `npm run test:v866:types` – isolierte V866-Core-Typen | PASS |
| `npm run test:v850` – 135 bestehende Show-Director-Gruppen | PASS |
| `npm run test:v850:types` – isolierte V850-Core-Typen | PASS |
| `npm run test:v849` – 109 Übergangsprüfungen | PASS |
| `npm run test:v865` – History-Fusion | PASS |
| `npm run test:smoke:v665:flat` – alle 102 Schritte | PASS (Exitcode 0) |
| `npm run check:syntax` – 1261 TS/TSX-Dateien | PASS |
| `npm run check:architecture` – 1003 Codeverweise | PASS |
| `npm run test:module-case` – 2143 Quelldateien | PASS |
| `npm run check:test-types` – React/R3F-Testtypisolierung | PASS |
| `npm run test:v86512:flat` – Flat Runner | PASS |
| `npm run test:v86513:windows-eol` – zehn CRLF-Simulationen | PASS |
| Vollständiger `npm run typecheck` | NICHT AUSGEFÜHRT |
| `npm run check:release:flat` (424 Prüfungen) | NICHT AUSGEFÜHRT |
| `npm run build:flat` / echter Next.js-Build | NICHT AUSGEFÜHRT |
| Windows-GitHub-Actions und Browser/WebGL-Akzeptanz | NICHT AUSGEFÜHRT |

Die npm-Abhängigkeiten sind in dieser Bearbeitungsumgebung nicht installiert;
`registry.npmjs.org` war per DNS nicht erreichbar (`EAI_AGAIN`).
Weder Node-Einzeltests noch TS-Stubs ersetzen den echten TypeScript-/Next.js-Build.

Unter Windows nach `npm ci`:

```powershell
npm run test:v866
npm run test:v866:types
npm run typecheck
npm run test:smoke:v665:flat
npm run check:release:flat
npm run build:flat
```

V866 verwendet vorhandene V810-Musik- und V850-Bühnen-Entscheidungen;
die neue Genre-Rotation kann ausschließlich automatische Effektanteile begrenzen.
Manuelle Spuren, reduzierte Bewegung, Blackouts und unverifizierte Acts bleiben geschützt.
