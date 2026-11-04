# V901 – technische Prüfung und Release-Status

## Testumfang

- [x] `npm run test:v901`: **685/685**, einschließlich strenger zeitlicher Evidenz und 575+ songgebundener Szenenpositionen.
- [x] `npm run test:v901:types`: isolierter TS-Kern.
- [x] `npm run test:v901:ui-types`: isolierte TS-UI mit dedizierten Testdeklarationen.
- [x] V880–V900: 21 direkte Regressionstest-Kommandos mit Exit 0, nachdem ausschliesslich ältere Paketversions-Erwartungen bis V901 erweitert wurden; fachliche Assertions unverändert.
- [x] Ältere UI-Typstubs erlauben `useSyncExternalStore` ausschließlich in der Test-Umgebung; die gesamte fokussierte UI-Typkette ist nach Korrektur erfolgreich.
- [x] Zusätzliche Altprüfungen V825 (50), V826 (56), V827 (64), V834 (52), V604 (65 Gruppen und 40.000 simulierte Songpositionen). Bei V826 wurde lediglich die historische Cleanup-Stringprüfung aktualisiert, damit sie das vorhandene kombinierte Cleanup weiterhin überprüft.
- [x] `npm run check:syntax`: **1.312** TS/TSX-Dateien.
- [x] `npm run test:module-case`: **2.247** Quelldateien; keine Windows-relevanten Case-Kollisionen.
- [x] `npm run check:architecture`: 1.080 aktuelle Quellcode-Verweise, 10 Dokumentationsabschnitte.
- [x] Vollständige fokussierte Prüfkette `npm run verify:v901:focused`: **Exit 0**; alle V901–V880-Versionstests, isolierte Typprüfungen, Modul-Casing, Syntax und Architektur erfolgreich.
- [ ] Vollständiger TypeScript-Check und Next.js-Produktionsbuild: **nicht bestanden/nicht bestätigt**. `npm ci --offline --ignore-scripts` schlägt mit `ENOTCACHED` für `zustand@5.0.16` fehl. `npm run typecheck` endet Exit 2 mit fehlenden React-/Next.js-/Node-Typen. Der isolierte `npm --ignore-scripts run build`-Versuch endet Exit 127 mit `next: not found`. Kompilierung und Browser-Smoke bleiben für Produktionsfreigabe zwingend.
- [ ] Echtes Chromium-/WebGL-Szenario mit realen GLBs, Lyrics, Kamerafahrten und gemessener FPS/P95: **nicht durchgeführt**.

## Integrität und Nichtbehauptungen

V901-FPS stammen aus realen Browser-Frame-Abständen aus dem vorhandenen V826-Messfenster (falls dieses gestartet ist). Die Node-Tests verwenden **synthetische Fixtures**, die keine echten Renderer-Messwerte oder GPU-Benchmarks beweisen. V901 führt keine Bilderkennung, Audio-/Stimmen-Erkennung, Pose-/Fußkontakt-Messung, Lyrics-Lesbarkeitsmessung oder automatische Produktions-Freigabe durch. „Bereit“ bedeutet nur, dass ein Regiekanal durch eine bestätigte, aktive Szene konfiguriert wurde. Frühere manuelle Timelines, Blackouts, Bewegungsschutz und FX-Sperren werden nicht verändert.

## Prüfen auf Windows (mit vollständigem Netzwerkzugriff)

```powershell
npm ci
npm run verify:v901:focused
npm run typecheck
npm run build
npm run dev
```

Optional `powershell -ExecutionPolicy Bypass -File scripts/verify-v901-windows.ps1`. Achtung: Vor Freigabe einen realen Browser-/WebGL-Screenshot- und Langzeittest durchführen, auch wenn TypeScript und Build bestanden sind.
