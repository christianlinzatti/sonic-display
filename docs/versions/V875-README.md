# Sonic Display – V875 Smart Festival Atmosphere 3.0

**Additives Upgrade für eine bestehende Sonic Display Installation** (setzt V874 voraus; V874 liegt diesem ZIP bei). V875 baut auf der vorhandenen V815-Crowd, V825-FPS-Begrenzung und V874-Reaktionssteuerung auf. Kein Austausch des gesamten Projekts und keine Abhängigkeiten/externen Dienste hinzugefügt. V873 liegt mir nicht als vollständige Archivversion vor; Integration wurde deshalb auf V868 + V874 geprüft, nicht auf der späteren Projektversion.

## Installation unter Windows (PowerShell)

1. **Vorher** einen Git-Commit oder eine Kopie des aktuellen Projekts anlegen.
2. ZIP im Hauptordner des vorhandenen Sonic-Display-Projekts entpacken (`package.json`, `components/`, `tests/` liegen dort).
3. Bei bereits installierter V874 nur den zweiten Installer ausführen. Sonst beide in dieser Reihenfolge:

```powershell
node .\apply-v874.cjs
node .\apply-v875.cjs
npm ci
npm run test:v874
npm run test:v875
npm run test:v875:types
npm run typecheck
npm run build
```

V874 wird nicht mit V875 ersetzt: die vorhandenen Armbewegungen werden durch V875 erweitert. Falls eine Integrationsstelle in einer späteren Version umgebaut wurde, meldet der Installer einen Fehler, statt den Dateitext blind zu ersetzen. Er ergänzt nur die bestehenden V810/V874-Settings, DynamicStage, FX-Studio-Panel und V874-Armkomponente sowie neue Dateien. V875 kann mehrfach ausgeführt werden, ohne Importe, Regler und Build-Skripts zu duplizieren. **Achtung:** Wenn V874 nach V875 erneut ausgeführt wird, anschließend auch `apply-v875.cjs` erneut ausführen, da V874 die eigene Armkomponente neu kopiert.

## Funktionen

- **Festival-Dramaturgie:** Intro/Verse = Warm-up, Build = Antizipation, Hook = Mitsingen, Drop = Peak, Finale = Ausklang, Break = ruhig.
- **La-Ola-Wellen:** Ergänzung der vorhandenen V874-Armbewegungen. Wellen reagieren auf den bestätigten V810-Musikabschnitt, Genre und die vorgegebene Song-Phase, ohne neue Beat-Detektion oder neue Timer.
- **Virtuelle LED-Armbänder:** Zwei instanzierte 3D-Meshes (max. je 72 Instanzen); Farben aus vorhandener Konzertpalette, keine zusätzlichen echten Light-Objekte oder Vollbildblitze.
- **Automatische Genre-Abstufung** für Hardtekk, Hardstyle, Rap, Rock/NDH, Pop und neutral.
- **FX-Studio-Einstellungen:** Hauptschalter, Crowd-Wellen, LED-Armbänder, Intensität 0–100 und Stil (dezent/ausgewogen/immersiv); Speicherung über die vorhandene Concert-FX-Konfiguration und deren Backup/Export.
- **Schutz:** Kein Effekt bei Pause, Blackout, manueller Lichtsteuerung, reduzierter Bewegung, unbestätigtem Cue oder ausgeschalteter Crowd. Niedrige Qualität unterdrückt den neuen Effekt; Lyrics- und Vocal-Fokus sowie V825-Budgets verringern ihn.

## Technische Qualitätsprüfung (V868 + V874 + V875)

- V875: 16/16 Regressionstest-Gruppen erfolgreich.
- V874: 11/11 Test-Gruppen erfolgreich.
- V815: 15/15 Test-Gruppen erfolgreich.
- V810: 30 Test-Gruppen, V825: 50 Test-Gruppen, V844: 98 Test-Gruppen erfolgreich.
- V868: 197 Song-Arc-Prüfungen erfolgreich, einschließlich der unveränderten Build-Preflight-Prüfreihenfolge.
- Isolierter TypeScript-Check V875 und V874 erfolgreich; Syntax-Transpile der sechs geänderten TS/TSX-Dateien erfolgreich.
- Der Installer ist wiederholbar, und der Einbau wurde auf einer frisch entpackten V868-Kopie mit V874 erneut getestet.
- **NICHT bestanden/ausführbar in dieser Umgebung:** Vollständiges `npm run typecheck` wegen fehlender `next`, React/Three und Node-Types; `npm run build` wegen fehlender `next`-Installation. Die vollständigen Release-Gates sind lokal oder in GitHub Actions nach `npm ci` durchzuführen. Das ist **keine** vollständig freigegebene Produktionsversion.

Die Version in `package.json` und `package-lock.json` bleibt bewusst unverändert: V875 ist ein inkrementelles Upgrade auf der bestehenden Installation, kein Ersatz für den lokalen Release-Branch. Eine spätere V875-Vollversion muss auf der tatsächlich aktuellsten Projektbasis gebaut und komplett validiert werden.
