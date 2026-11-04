# V891 – Prüf- und Freigabestatus

Stand: 2026-11-03. Basis: vollstaendiges V890 ZIP aus dieser Unterhaltung.

## Erfolgreich ausgeführt

- `npm run test:v891`: **98/98** neue fachliche Tests.
- `npm run test:v891:types` und `npm run test:v891:ui-types`: beide **PASS** mit isolierten Test-Typen.
- V880–V890: die jeweils gezielten Regressionstests **PASS** (u. a. V890 91/91, V889 108/108, V888 96/96).
- Zusätzliche FX-/Lichttests: V844, V845, V846, V847, V871 **PASS**.
- V888, V889, V890: isolierte Core- und UI-Typechecks **PASS**.
- `npm run check:syntax`: **PASS** bei 1300 TS/TSX-Dateien.
- `npm run test:module-case`: **PASS**.
- `npm run check:architecture`: **PASS**, 1049 referenzierte Codepfade, 10 Strukturkapitel.
- YAML-Struktur der V832 CI-Datei lokal geparst, V891 in CI ergänzt.

## Nicht bestanden / noch nicht freigegeben

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: **ENOTCACHED** wegen `zustand@5.0.16`; die Installation ist nicht vollständig.
- `npm run typecheck`: **FAIL** mit zahlreichen `Cannot find module react/next` und fehlenden `@types/node` nach unvollständiger Installation. Deshalb **kein bestätigter vollständiger Typecheck**.
- `npm run build`: **NICHT ABGESCHLOSSEN**; das bestehende, sehr lange `prebuild` lief in das lokale Zeitlimit. Der eigentliche Next.js-Produktionsbuild wurde nicht erreicht, außerdem fehlen Abhängigkeiten.
- Echtbrowser-/WebGL-Sichttest, FPS- und Langzeitmessung: **nicht ausgeführt**.
- Vollständige historische Prebuild-Prüfkette: **nicht abgeschlossen**; getestete Gruppen sind separat genannt.

## Release-Empfehlung

Dieses ZIP ist ein **funktional erweitertes Testpaket, kein produktionsfreigegebenes Build**. Auf Windows nach `npm ci`:

```powershell
npm run verify:v891:focused
npm run typecheck
npm run build
npm run dev
```

Bei erfolgreich installiertem Next.js/React/Three zusätzlich das Live-FX-Deck, die Bühnenansicht und die Opt-in/Blackout-/Reduced-Motion-Grenzen visuell prüfen. Kein Strobo und keine Hardware-Pyrotechnik.
