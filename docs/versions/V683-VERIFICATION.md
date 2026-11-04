# V683 – Prüfprotokoll / Quality Gate

## Erfolgreich in der Offline-Umgebung

- `npm run test:v683`: **PASS – 44 Prüfungen**, einschließlich 10.000 simulierter Zeitpunkte, 3-/4-Performer-Staging, erhaltener Fokuswerte, Abständen, manueller Vorränge, Übergängen und Abschnittsvalidierung.
- `npm run test:v683:types`: **PASS** – strenge isolierte TypeScript-Prüfung des neuen Ensemble-Moduls.
- `npm run test:quick`: **PASS** – Versionen V669–V683, Syntax/Importbindungen, Architektur, Dateinamen, Testtypen und Spotify-Build-Umgebung.
- Zusätzliche historische Ensemble-/Regietests: **PASS** für V325, V326, V442 (inkl. isolierter TypeScript-Prüfung), V446 (inkl. isolierter TypeScript-Prüfung), V600, V604 und V609. Drei historische Source-Integrationstests wurden auf die neue Endstufe `concertGroupV683` angepasst; die bestehenden Planner-Assertions blieben unverändert.
- Syntax: **944** TS/TSX-Dateien; Modul-Namen: **1592** Pfade ohne Konflikte; Architektur: **606** Quellcodeverweise.

## Produktionsfreigabe noch offen

- `npm run build` stoppt in `prebuild` bei der absichtlich vorgeschalteten V680-Abhängigkeitsprüfung: **0/17** benötigte npm-Pakete installiert; `package-lock.json` fehlt. **Kein** erfolgreicher Next.js-Produktionsbuild und **kein** vollständiger React-/Next.js-TS-Gesamtcheck in dieser Umgebung.
- Browser-/WebGL-Rendering, reale GLB-Modelle, Textüberlagerungen und Bildschirm-Performance wurden hier **nicht** visuell gegen die laufende Anwendung getestet. V326 prüft Bühnenabstand, nicht pixelgenaue Verdeckung.

## Lokale Freigabe auf Windows

Im entpackten Projektordner `npm install`, `npm run test:quick`, `npm run test:v683:types`, `npm run build` ausführen. Danach einen Track mit **bestätigten** Songabschnitten und 3–4 aktiven automatisch erzeugten Avataren testen: Verse, Hook-Wiederholungen, Build, Break, Drop, manuelle Gruppenregie, eigene Choreografie, Sänger-Feature und Lyrics-Seitenlayout. Das generierte `package-lock.json` für reproduzierbare Builds einchecken.
