# V695 – Tatsächliches Prüfprotokoll (29.10.2026)

## Erfolgreich ausgeführt

- `npm run test:v695`: **PASS** – 56 gezielte Tests und 10.000 deterministische Negativszenarien für ein fehlertolerantes, nicht selbst freigebendes Release-Gate. Getestet wurden u.a. ungültige/zu alte V592-Berichte, fehlende PNG-Originale, falsche Screenshot-Pfade, nicht gemessene GLB-/Browserdaten, verdächtige externe URLs, fehlende Lockfiles, fehlende Abhängigkeiten und der Unterschied zwischen `needs-human-review` und `approved`.
- `npm run test:v695:types`: **PASS** – isolierter strenger V694-Vorgänger-TypeScript-Check; **kein** produktiver Gesamt-TypeScript-Nachweis.
- `npm run test:smoke:v695`: **PASS** – V695, V694, V693, Syntax/Architektur/Modul-Dateinamen.
- `npm run test:quick`: **PASS** – Versions-Regressionen **V669–V695**, Syntax/Import-Analyse **959 TS/TSX-Dateien**, Architektur **610 Referenzen**, Modul-Groß-/Kleinschreibung **1622 Quelldateien**, Isolierung **8 Test-only-Typdeklarationen**, Spotify-Session-/Build-Sicherheitsprüfungen.
- `npm run test:v466`, `npm run test:v467`, `npm run test:v641`, `npm run test:v642`: jeweils **PASS**; ältere Live-Geometrie-, Quality-Advisor- und Vollsong-QA-Verträge bleiben erhalten.
- Neues Gate `node scripts/v695-release-quality-gate.cjs`: **korrekt als BLOCKIERT zurückgegeben**; die tatsächliche lokale, datierte JSON-Ausgabe befindet sich in `V695-RELEASE-EVIDENCE.json` und kann auf dem Entwicklerrechner neu erzeugt werden.
- Beide neuen Node-Skripte wurden mit `node --check` auf Syntax geprüft; das neue Chromium-Script wurde tatsächlich ausgeführt (Ergebnis unten).

## Tatsächlich versucht, nicht bestanden / blockiert

- `npm run typecheck`: **nicht erfolgreich** – erwartete tausende `TS2307`/`TS2580`-Folgefehler aus nicht installierten Next.js-, React-, Three.js- und Node-Typen; ohne die Pakete keine Aussage zu sonstigen Produktions-Typfehlern.
- `npm run build`: **blockiert** in `prebuild -> check:fast -> check:dependencies`: **0 von 17 npm-Paketen vorhanden**; `package-lock.json` fehlt; `next build` selbst startete nicht. Kein erfolgreicher Next.js-Produktionsbuild belegt.
- `node scripts/v695-browser-qa-smoke.cjs --self-test`: **blockiert**. Das installierte Chromium kann den eigens gestarteten Loopback-Server in dieser administrativ verwalteten Laufzeitumgebung nicht ansteuern: `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Dies ist ausdrücklich **kein** Browser-/QA-/WebGL-Nachweis. Kein Screenshot der echten App entstanden.
- Echte App-Browserprüfung mit QA-Historie nach Browser-Neustart, WebGL-Bühne, GLB-Avataren und echter Spotify-Wiedergabe: **nicht durchgeführt** (Build/App und Loopback fehlen).
- Echte visuelle Abnahme zu Deutschrap-Lip-Sync, Ensemble, Lyrics, Kamera, Moving Heads, Gobos, LED-Wand, Nebel und 1/2/4 GLB-Darstellern: **nicht durchgeführt**. Kein Raspberry-Pi-Test (Zielgerät noch nicht vorhanden).
- Im Projektpaket befinden sich keine Benutzer-GLB-/GLTF-Modelle (die gespeicherten benutzereigenen Assets liegen außerhalb des Quellarchivs).

## Freigabekriterium / lokale Nachprüfung

1. In Windows auf dem vollständigen Projekt `npm install` (Lockfile danach erhalten), `npm run typecheck` und `npm run build` durchführen.
2. Unter `http://127.0.0.1:3000` reale App starten; QA-Schaltfläche, gespeicherte Aufgabe, zweimaliger Reload und manuelle Statusänderung durch den echten Browser-Test prüfen.
3. Eigene GLB-Modelle importieren, Spotify-Song abspielen und den vorhandenen V592-Live-Benchmark erzeugen (mit echten Bilddateien); für verschiedene Ensembles und Genres Sichtkontrolle durchführen.
4. `npm run audit:v695:release -- --url=http://127.0.0.1:3000/ --live-report=artifacts/v592/live/report.json` starten. Das erzeugt **nur technische Nachweise**; auch mit allen sieben Nachweisen darf keine künstlerische Freigabe automatisch behauptet werden.
5. V694-Historie, JSON-Export und -Import in anderem Browserprofil testen. Bei Vergleichsversionen keine Song-/Avatar-Konfigurationsabweichungen als gleichwertig werten.

**Gesamtstatus dieser Umgebung: BLOCKIERT, keine Produktionsfreigabe, keine echte optische Abnahme.**
