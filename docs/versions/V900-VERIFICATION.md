# V900 – Technischer Prüfbericht

Stand: 03.11.2026. **Entwicklungsfassung; noch keine Produktionsfreigabe.**

## Bestanden

- `node tests/v900-ultimate-concert-regression.cjs`: **1.165 / 1.165** Prüfungen erfolgreich. Umfasst Szenenplan, 4 Konzertakte, Motivwechsel, relative Peak-Hierarchie, echte Energiedaten, alle Sicherheitsprioritäten, 1.001 numerische Zeitpunkte, V882-Bridge, Integration in Kamera/Tanz/Bühne/LED und Export.
- Direkte Funktionstests **V880–V899**: alle 20 Regressionstest-Dateien einzeln ohne Fehler (2.602 frühere Einzelprüfungen laut V899-Verifikation; zusammen mit V900 **3.767**).
- V900 Core und isolierte UI-Typprüfung: `tsc -p tests/tsconfig.v900-core.json --noEmit`, `tsc -p tests/tsconfig.v900-ui.json --noEmit` erfolgreich.
- Der gebündelte Befehl `npm run verify:v900:focused` arbeitete **V900–V895** inklusive isolierter Core-/UI-Checks fehlerfrei ab, wurde aber **während der V895-UI-Prüfung vom Laufzeitlimit unterbrochen**. Er ist daher **nicht als vollständiger Pass** zu werten.
- Isolierte Core-/UI-Typchecks V894–V887 anschließend einzeln erfolgreich. Weitere ältere Isolationschecks wurden beim nächsten Zeitlimit unterbrochen.
- Ältere gezielte Szenen- und Show-Prüfungen: V604 (40.000 Song-Proben), V761 (77.264 Checks), V842 (95 Gruppen), V871 (138 Gruppen) bestanden.
- Syntax- und Importprüfung: **1.310 TS/TSX-Quelldateien** gültig.
- Windows-Dateinamenprüfung: **2.244 Quelldateien**, keine Modulnamenskollisionen.
- Architekturprüfung: **1.079 Codeverweise**, Dokumentationsstand V900.
- Paket-/Lockfile-Version: `0.1.0-v900`, Stand der Release-Archive wird separat mit CRC kontrolliert.

## Offen – nicht erfolgreich produktionsgeprüft

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: **ENOTCACHED** für `zustand@5.0.16`. Keine vollständige Installation der Abhängigkeiten.
- `npm run typecheck`: **Exit 2**, unter anderem wegen fehlender Next.js-/React-/Node-Typdefinitionen. Das ist **kein bestandener** Gesamt-Typecheck und erlaubt keine Behauptung, dass es sonst keine Fehler gibt.
- `npm run --ignore-scripts build`: **Exit 127**, `next: not found`. Kein bestätigter Next.js-Produktionsbuild.
- Echter Browser-/WebGL-Lauftest über ganze Songs mit mehreren GLB-Avataren, Kameras und Effekten: **nicht ausgeführt**.
- Vollständig abgeschlossene `verify:v900:focused`-Gesamtkette: **nicht bestätigt**, da Zeitlimit (siehe oben).

## Freigabeschritte auf dem Ziel-PC (Windows / Linux)

```powershell
npm ci
npm run verify:v900:focused
npm run typecheck
npm run build
npm run dev
```

Anschließend durchgängige Shows mit Deutschrap, Hardtekk und Deutschrock sowie
manuellem Licht-/Kamera-/Tanz-Override im Browser testen. Ebenso Szenenwechsel,
Lyrics-Schutz, 3-/4-Avatar-Performance und einen längeren Lauf auf Zielauflösung.

V900 verwendet ausschließlich bestätigte Szenen; eine „KI“-Bezeichnung wäre in diesem
Release lediglich eine regelbasierte Regie, **kein** eingebundenes generatives Modell.
