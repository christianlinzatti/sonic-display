# V444 Verifikation (21. Oktober 2026)

## Erfolgreich in dieser Entwicklungsumgebung

- `npm run test:v444`: reine Interaktionsplanung, 4 Slots, Head/Eye-Cues, leichte Rap-Gesten, sichere Grenzen, manuell zugewiesene V385/V416-Übergaben, Hook, Pause, Reduced Motion, manuelle Bühne, `0 %`, Integration in Renderer und Preferences, strenge isolierte TypeScript-Kernprüfung.
- `npm run verify:v444`: erfolgreich, einschließlich V439/V440/V441/V442/V443, Syntax-, Import-, Modulnamen- und V190-Motion-Library-Prüfungen.
- `npm run test:v423` bis `npm run test:v426` sowie `npm run test:v429` bis `npm run test:v438`: alle erfolgreich einzeln ausgeführt.
- `npm run test:v242`: zehn Regressionstests bestanden.
- Syntaxprüfung: **607 TS-/TSX-Dateien**.
- Importprüfung: **961 Projektdateien / 2.115 Imports**.
- Modulnamenprüfung: **961 Quelldateien**, keine Fallunterschied-Kollision.
- Archiv mit `ZipFile.testzip()`/Paketversions- und Dateizählungsprüfung validiert.

## Offen – nicht als bestanden ausgeben

- `npm run typecheck` und `npm run build` mit vollständigem installiertem `node_modules`-Baum.
- Praktischer Next.js-/WebGL-/R3F-Test sowie Test mit realen importierten GLB-Rigs. In dieser Umgebung waren die Projekt-npm-Abhängigkeiten nicht installiert. Die isolierte Kern-Typprüfung ersetzt keinen vollständigen App-Build.

## Ausführung auf Windows

```powershell
npm install
npm run verify:v444
npm run typecheck
npm run build
```

## Funktionelle Einschränkungen

Keine tatsächliche Spracherkennung/Audio-Diarisierung, automatische Artist-Besetzung nur nach Spotify-Credits; manuelle V385/V416-Zuordnungen sind Bühnenregie, keine bestätigten Audio-Stimmen. V444 wirkt nur für die automatische V442-Gruppe (3–4 Figuren), unterstützt Rigs nach vorhandener Bone-Zuordnung und lässt alle manuell verfassten Animationen und Kamera-Keyframes unverändert.
