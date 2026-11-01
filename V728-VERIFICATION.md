# Sonic Display V728 — Verification

## Funktion und integrative Tests

- `NODE_PATH="$(npm root -g)" npm run test:v728`: **PASS**, 126 On-This-Day-Checks, einschließlich lokaler Datumsauswertung (Sommer-/Winterzeit), Schaltjahr/29. Februar, 100-Jahres-Fenster, Jahresreihenfolge, wiederkehrende Songs nur über verschiedene Jahre, Unicode-NFKC, Zeitgrenzen, fehlende/falsche/future Scrobbles, unveränderter Eingabe, große Archive, UI-Anbindung, Chronik-Links und Quelltext-Sicherheitsprüfungen.
- `npm run test:v728:types`: **PASS** (isolierter TypeScript-Check für reines Aggregationsmodul).
- `npm run test:v728:ui-types`: **PASS** (isolierter TypeScript-Check für neue UI, Hauptintegration und Dashboard-Shortcut).
- `NODE_PATH="$(npm root -g)" npm run test:quick`: **PASS, Exit 0**, 126 durch `&&` verknüpfte Prüfschritte; alte Konzert-, Avatar-, Audio-, Spotify- und Last.fm-Regressionen weiterhin grün.
- `npm run check:syntax`: **PASS**, 1.021 TS/TSX-Dateien.
- `npm run check:architecture`: **PASS**, 697 geprüfte Quelldateiverweise, zehn Hauptabschnitte, Dokumentationsstand V728.
- `npm run test:module-case`: **PASS**, 1.721 Quelldateien, keine problematischen Windows-Case-Collisions.
- `npm run check:test-types`: **PASS**, acht isolierte Test-Ambient-Deklarationen.
- `npm run test:env:spotify-build`: **PASS**, OAuth-/Session-/Build-Umgebungsprüfungen.

## Ausdrücklich NICHT als Produktionsbuild freigegeben

- `npm run check:dependencies`: **BLOCKIERT**, 0/17 erforderliche npm-Pakete vorhanden, `package-lock.json` fehlt.
- `npm run build`: **EXIT 1**, bereits im Prebuild-Dependency-Check gestoppt; keine Next.js-Produktionskompilierung durchgeführt.
- `npm run typecheck`: **EXIT 2**, unter anderem fehlende Next.js-/Node-/React-/Three-Typen in der unvollständig installierten Projektkopie; kein sauberer Gesamt-Typecheck.

Für die endgültige Freigabe auf einer installierten Entwicklungsumgebung: `npm install`, das erzeugte `package-lock.json` ins Repository aufnehmen, dann `npm run test:quick`, `npm run typecheck`, `npm run build` erneut durchführen. Eine erfolgreiche Produktionskompilierung wurde **hier nicht behauptet**.

Alle V728-Berechnungen lesen ausschließlich das vorhandene Browser-IndexedDB-Hörarchiv; keine neuen externen Last.fm-Aufrufe, kein neues Scrobbling, keine Änderung bestehender Opt-in-Einstellungen.
