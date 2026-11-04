# Sonic Display V447 – Verifikation

## Erfolgreich

- `npm run test:v447`: konservativer Artist/Title-Match, Produktions-/Songwriting-Credits, Samples und Song-Story, HTTPS-Genius-Linkschutz, Fragmentabgleich mit synchronisierten Lyrics, ruhige Anzeigephasen, Pausen, Abschaltbarkeit, sichere Server-/UI-Verdrahtung.
- Strenge TypeScript-Kernprüfung: `tsc -p tests/tsconfig.v447-core.json --noEmit`.
- `npm run verify:v447`: enthält die Regressionssuite von V446 bis V429 und ältere V423–V426, V190, V242; ebenso Syntax-, Import- und Modulnamen-Prüfungen.
- Archivprüfung: ZIP-CRC, Paketversion, Pflichtdateien, vollständige Erhaltung der V446-Dateien.

## Grenzen

- Ohne `node_modules` und mit in dieser Umgebung nicht erreichbarer npm-Registry wurden **kein vollständiger `npm run typecheck` oder Next.js-Produktionsbuild** ausgeführt. Die isolierten TypeScript-Kernprüfungen sind kein vollständiger Next.js-Build.
- Keine Live-Genius-/Spotify-/Browser-End-to-End-Abfrage mit eigenem Token; externe API-Verfügbarkeit und realer Inhalt sind nicht garantiert.
- Keine Lyrics-Timestamps von Genius, kein Web-Scraping von Lyrics für Insights und keine automatischen Künstler-Stimmzuordnungen.
