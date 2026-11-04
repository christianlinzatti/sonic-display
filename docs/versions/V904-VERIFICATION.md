# V904 – Prüfstatus (Entwicklungsfassung)

## Erfolgreiche Prüfungen

- [x] `npm run test:v904`: **959/959 Prüfungen bestanden**, darunter abgeschlossene V903-Review-Zustände, Deduplikation, Obergrenze von 24 Messungen, exaktes Gruppieren nach privatem Song/Szenenindex/Patch/FPS-Ziel/Qualitätsstufe, Median-/Streuungsanalyse, Warnungen bei Schwankungen, fehlendem Vorteil oder Verschlechterung, JSON-Export ohne Songkennung, ausschließlich manuell bestätigtes Löschen.
- [x] `npm run test:v904:types`, `npm run test:v904:ui-types`: beide isolierten TypeScript-Prüfungen erfolgreich.
- [x] **Alle 24 direkten Regressionstestgruppen V880–V903** separat mit Exit 0 bestanden. Bestehende Versionstest-Grenzen wurden nur bis V904 erweitert; die funktionalen Assertions wurden beibehalten.
- [x] `npm run check:syntax`: **1.318 TS/TSX-Dateien** erfolgreich.
- [x] `npm run test:module-case`: **2.256 TS/TSX-Module** ohne Groß-/Kleinschreibungskollision.
- [x] `npm run check:architecture`: **1.091 Codeverweise**, 10 Sektionen, gültige Dokumentationsverweise.
- [x] Isolierte TypeScript-Prüfungen V903 bis V898 erfolgreich innerhalb des gebündelten Laufs; V897 bis V891 (soweit vollständig ausgeführt) ebenfalls erfolgreich.
- [x] Windows-Prüfskript, CI, package.json und package-lock.json für V904 eingerichtet.

## Nicht vollständig abgeschlossene Prüfkette

- [ ] `npm run verify:v904:focused`: Die verschachtelte Kette durchlief V904 bis V898 einschließlich der neuen, isolierten Typprüfungen erfolgreich, wurde anschließend während `test:v898:ui-types` durch das Umgebungslimit unterbrochen. Der vollständige Exit 0 dieser Sammelkette liegt **nicht** vor. Die direkten Funktionstests V880–V903 wurden separat vollständig mit Exit 0 durchgeführt. Syntax, Architektur und Dateinamenprüfung wurden ebenfalls separat erfolgreich ausgeführt.

## Produktionsfreigabe offen

- [ ] `npm ci --offline --ignore-scripts --no-audit --no-fund`: **Exit 1, ENOTCACHED** für `zustand@5.0.16` (fehlender npm-Cache).
- [ ] `npm run typecheck`: **Exit 2**, fehlende Pakete, z.B. `next/server`, React-/Node-Typen. Dies ist kein erfolgreicher Gesamt-TypeScript-Check.
- [ ] `npm --ignore-scripts run build`: **Exit 127**, `next: not found`; kein Next.js-Produktionsbuild.
- [ ] Echte Browser-/WebGL-Performanceprüfung unter Windows/Linux mit realen Songs/Avataren und wiederholten V903-Messzyklen.

## Messgrenzen und Sicherheit

Nur **tatsächlich abgeschlossene V903-Fenstermessungen** werden archiviert. V904 verwendet die vorhandenen V826-Renderer-Frameabstände statt GPU-Zeitmessungen; die Gruppen bleiben in einer Sitzung und enthalten maximal 24 Reviews. Mindestens drei separate abgeschlossene V903-Vergleiche pro identischer Songszene und exaktem Patch sind für eine vorsichtige Tendenz notwendig. Die Klassifikation ist heuristisch und **kein statistischer Signifikanz- oder Kausalitätsnachweis**. Vergleiche verschiedener Songs, Szenen, FPS-Ziele oder Performance-Tiers werden nicht vermischt. Es gibt weder automatische Einstellungen noch automatisches Zurücksetzen, keine neue GPU-Last, keine weiteren Telemetrie-Listener und keine Speicherung auf Datenträger. Der JSON-Export enthält keine Songkennung, Rohframes oder Wiedergabepositionen. Archivlöschung benötigt zwei Klicks.

## Windows-Freigabeschritte

```powershell
npm ci
npm run verify:v904:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ `powershell -ExecutionPolicy Bypass -File scripts/verify-v904-windows.ps1`. Keine Produktionsfreigabe ohne bestandenen Gesamt-TypeScript-Check, Build und WebGL-Probelauf.
