# Sonic Display V874 – Intelligent Audience Experience 2.0

Diese Erweiterung ergänzt die vorhandene **V815-Publikumsdarstellung**, ohne die Änderungen aus V869–V873 zu ersetzen. Das ZIP ist ein **inkrementelles Upgrade**, kein vollständiger Ersatz deines V873-Projektarchivs. Voraussetzung: ein Sonic-Display-Projekt mit der bestehenden V810/V815/V825-Struktur (getestet auf V868); bei abweichenden Projektdateien bricht der Installer mit einer Meldung ab, statt blind andere Versionen zu überschreiben.

## Einbau auf Windows

1. Verwende dein aktuelles entpacktes V873-Projekt, möglichst mit Git-Commit oder Sicherheitskopie.
2. Entpacke **dieses ZIP in das Stammverzeichnis** des Sonic-Display-Projekts, sodass dort `apply-v874.cjs` und `v874/` stehen.
3. Im Stammverzeichnis ausführen:

```powershell
node .\apply-v874.cjs
npm ci
npm run test:v874
npm run test:v874:types
npm run typecheck
npm run build
```

Der Installer kann mehrfach gestartet werden; er fügt Importe, Einstellungen, Regie, Renderer und Build-Tests nicht doppelt ein. Er überschreibt keine vollständigen V873-Dateien. `prebuild` und `build:preflight` enthalten nach der Installation die V874-Checks. Ein bestehender Versionswert in `package.json` bleibt unverändert, damit die Release-Tests und die Lock-Datei weiterhin zusammenpassen.

## Neue Funktionen

- Genreabhängige Publikumsreaktionen: **Deutschrap** (Groove), **Hardtekk/Hardstyle** (Rave), **Deutschrock** (Clapping), **Pop** (Waves), neutral (ruhig).
- Intensivierung nur bei **bestehenden verifizierten** V810-Hook-/Drop-/Finale-Cues; Verse und Breaks bleiben deutlich ruhiger.
- Zwei sparsame Instanced-Meshes für die **Arme** der seitlichen Crowd (höchstens 72 Besucher, kein rigged Avatar, Schatten oder neues Licht).
- **Handylicht-Welle**, innerhalb der bisherigen Helligkeits- und Performance-Grenzen.
- Drei unabhängige Schalter im FX-Studio: Audience 2.0, Armwellen, Handylichtwellen; automatisch in vorhandener Einstellungsspeicherung und Backups enthalten.
- Beachtung von Pausen, manueller Lichtregie, Blackouts, niedriger Qualität, `reducedMotion`, Gesangs- und Lyrics-Fokus. Keine neuen künstlichen Beat-Detektoren oder Zufallssequenzen.

## Technischer Status

Getestet auf verfügbarer vollständiger **V868**-Projektbasis:
- V874: **11/11** neue Regressionstests bestanden.
- V815: **15/15** Crowd-Tests bestanden.
- V868: **197** Song-Arc-Prüfungen bestanden.
- V810: **30** FX-Tests bestanden.
- V825: **50** Testgruppen bestanden.
- Isolierte TypeScript-Checks für V810, V815, V825, V868, V874: bestanden.
- Syntaxprüfung für 1264 TS/TSX-Dateien und Architekturprüfung: bestanden.
- **Kein erfolgreicher vollständiger TypeScript-Check/Next.js-Produktionsbuild** in dieser Ausführungsumgebung: Projektabhängigkeiten (React, Three, Next) fehlen und das npm-Registry ist über das Netzwerk nicht erreichbar. Der vollständige Build muss nach `npm ci` lokal/über CI durchgeführt werden.
- Die **V873-Vollversion war nicht verfügbar**; das Einspielen auf V873 konnte daher hier nicht praktisch getestet werden.

V874 verändert keine Spotify-APIs und benötigt keinen neuen Dienst.
