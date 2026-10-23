# Sonic Display V406 – Verification

Stand: 20. Oktober 2026

## Bestätigt in dieser Prüfungsumgebung

- `npm run test:v406`: bestanden (Rap-Pose/Mimik, Playback-Stopp, Instrumental, Sängerrollen, Choreografie-Priorität, Bounds, Seek-Stabilität, Rig-Integration und prozedurale Mimik).
- `npm run test:v405`: bestanden (deutsche Rap-Mundformen und Lyrics-Wortzeiten).
- `npm run test:v404`: bestanden (Kamera, Lyrics, Lip-Sync, Imports und Groß-/Kleinschreibung).
- `npm run test:v403`: bestanden.
- `npm run check:syntax`: bestanden, 545 TS/TSX-Dateien.
- `npm run doctor:quality`: bestanden, 856 Quelldateien / 1799 Imports ohne fehlende lokale Imports oder Namenskollisionen.
- Langer Offline-Testlauf: **147 einzelne Tests erfolgreich protokolliert**, darunter V403; danach Zeitlimit der Umgebung. Die am Ende der Kette stehenden V404/V405/V406-Tests sind gesondert erfolgreich ausgeführt worden. Die vollständige Suite wurde damit **nicht in einem einzigen Durchlauf bis zum Abschluss bestätigt**.

## Nicht in dieser Umgebung bestätigt

- Vollständiger `npm run build` / `npm run typecheck`: Es fehlen 16 von 17 externen npm-Abhängigkeiten (`node_modules` ist nicht installiert). Die Tests ersetzen keinen kompletten Next.js-Compilerlauf.
- Echte GLTF-Morph-Rig-Darstellung auf GPU / Browser sowie Spotify-Timing in Echtzeit.

## Lokale Windows-Verifikation

```powershell
npm install
npm run verify
```

V406 führt bei `npm run build` über das `prebuild`-Skript die V404/V405/V406-Kernregressionen aus, bevor Next.js startet. Im CI läuft `npm run verify` auf Windows und Ubuntu.
