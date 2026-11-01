# V677 – Prüfprotokoll (28.10.2026)

## Erfolgreich hier ausgeführt

- `npm run test:v677`: **31 Prüfungen bestanden** (Genre-Vertrauen, ID-Schutz, Genre-/Familien-/Universal-Priorität, stabile Variation, manueller Vorrang, Opt-in, 20-Sekunden-Schutz, Integration).
- `npm run test:v676`: **26 Prüfungen bestanden**.
- `npm run test:v675`: **21 Prüfungen bestanden**.
- `npm run test:v674`: **16 Prüfungen bestanden**.
- `npm run test:v673`: **12 Prüfungen bestanden**.
- `npm run test:v672`: **12 Prüfungen plus 7 API-Szenarien bestanden**.
- `npm run test:v671`: **40 Gruppen, 21.000 Frames bestanden**.
- `npm run test:v670`: **38 Gruppen, 10.000 Frames bestanden**.
- `npm run test:v669`: **71 Gruppen, 9.000 Szenen bestanden**.
- `npm run test:v671:types`, `npm run test:v670:types`, `npm run test:v669:types`: **alle erfolgreich**.
- `npm run check:syntax`: **938 Dateien erfolgreich** (vor abschließender Dokumentationsanpassung; nach finalem Code-Check zu verifizieren).
- `npm run check:architecture`: **602 Referenzen und 10 Kapitel erfolgreich**.
- `npm run test:module-case`: **1579 Dateien, keine case-insensitiven TS/TSX-Kollisionen**.
- `npm run check:test-types`: **Test-Typen korrekt isoliert**.
- `node tests/unified-backup-regression.cjs`: **27 Prüfungen bestanden**.

## Noch offen – keine Produktionsfreigabe behauptet

- `npm run typecheck`: **Fehlschlag**, da hier Projekt-Abhängigkeiten (`node_modules`) fehlen: u. a. `react`, `next`, React- und Node-Typen. Der Compiler zeigt deshalb zahlreiche Folgefehler. Diese Prüfung ist **nicht** als bestanden zu betrachten.
- `npm run build`: **Gestartet**, aber die sehr lange vorgeschaltete `prebuild`-/`check:release`-Kette erreichte das Zeitlimit (**Exit 124**), bevor Next.js selbst startete.
- Eine echte Laufzeit-/Touchscreen-Prüfung mit Spotify, Last.fm und dem realen 3D-Renderer konnte hier nicht stattfinden. Ein Raspberry Pi ist nicht verfügbar.

## Zur lokalen Abnahme

```bash
npm install
npm run typecheck
npm run build
```

Danach: In **Zuletzt gespielt → Konzert-Designer** mindestens einen validen Look speichern, **Automatische Look-Auswahl** aktivieren, verschiedene Genres abspielen und anschließend Licht-/Tanzregler manuell verändern: die Automatik muss sich dabei deaktivieren. Auch einen Song ohne erkanntes Genre und einen Genreabruf nach mehr als 20 Sekunden prüfen.
