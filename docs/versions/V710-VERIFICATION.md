# V710 – Last.fm History Health & Auto Recovery: Prüfbericht

Stand: 29. Oktober 2026. Basis: vollständiges V709-Projekt (Last.fm-History und manuelle Recovery, Spotify-/Last.fm-Archivvergleich, bestehende Konzertmodules). Funktion und Grenzen: `V710-LASTFM-HISTORY-HEALTH.md`.

## Tatsächlich erfolgreich ausgeführte Tests

- `npm run test:v710`: **PASS**, **53 zielgerichtete Prüfgruppen plus 10.000 absichtlich ungültige Nachholseiten abgewiesen**. Darin enthalten: separater Opt-in-Vertrag, kontogebundene Einwilligung, V708-Abhängigkeit, beschädigtes Archiv und korrupter Fortschritt, vorhandener Vor-Lücken-Anker, eingefrorener Last.fm-Snapshot, eine Seite je Nachholschritt, Mindestabstand zwischen Schritten, vor dem Commit veränderte Einwilligung und Konten, verspätete andere Schreibvorgänge, echte Wiederholungen, Dubletten, Erreichen des Ankers/Seitenendes, JSON-Schreibfehler, Monatsstatistik, 30-/60-Tage-Vergleich, erfasste Tage, Tageszeitgruppen und Integrationskontrollen. HTTP-Live-Abfragen werden in diesen Tests nicht durchgeführt.
- `npm run test:v710:types`: **PASS**. Isolierter echter TypeScript-Check für V706–V710-Datenkern.
- `npm run test:v710:ui-types`: **PASS**. Isolierter React-/JSX-TypeScript-Check mit test-only Ambient-Deklarationen. Er **ersetzt keinen vollständigen Next.js-Typcheck**.
- `npm run test:quick`: **PASS mit Exit-Code 0**, siehe `/mnt/data/v710-quick-final.log` und `/mnt/data/v710-quick-final.exit`. Erfolgreiche historische Versionsprüfungen **V669 bis einschließlich V710** sowie die am Ende dieser Kette ausgeführten Struktur-/Spotify-Sicherheitstests. Bestehende Testfälle V706, V707, V708 und V709 bleiben erhalten; Versionsassertionen wurden auf die neue Paketversion aktualisiert. Der dokumentarische V690-Versionsstand wurde auf V710 gebracht, bevor der finale Gesamtlauf ausgeführt wurde.
- `npm run check:syntax`: **PASS**, 988 TS/TSX-Quellen.
- `npm run check:architecture`: **PASS**, 636 Quellcode-Referenzen, V710.
- `npm run test:module-case`: **PASS**, 1670 Quelldateien ohne reine Windows-/Linux-Groß-/Kleinschreibungskollisionen.
- `npm run check:test-types`: **PASS**, 8 test-only Deklarationen von produktiven Typen isoliert.
- `npm run test:env:spotify-build`: **PASS**, Spotify-OAuth-/Session- und Cookie-Sicherheitskontrollen.

## Produktions-Freigabegrenzen – explizit NICHT bestanden

- `npm run check:dependencies`: **Exit 1**. 0/17 direkte npm-Pakete installiert, `package-lock.json` fehlt.
- `npm run build`: **Exit 1 vor dem eigentlichen Next.js-Build**, weil dieselbe Abhängigkeitsvorprüfung stoppt. Keine erfolgreiche produktive Next.js-Übersetzung behaupten.
- `npm run typecheck`: **Exit 2**, insbesondere fehlende Next.js-, React-, Three.js- und Node-/TypeScript-Typdefinitionen. Ein vollständiger produktiver TypeScript-Check ist **nicht bestanden**; isolierte V710-Typchecks allein reichen für Freigabe nicht aus.
- Kein echter Last.fm-API-Schlüssel, kein Live-Scrobble-Verlauf und keine ausgeführte Chromium-/Touchscreen- oder Mehrgeräte-End-to-End-Abnahme. Web-Locks-Koordination konnte in diesem Testlauf nur strukturell, nicht in konkurrierenden realen Browser-Tabs getestet werden.

## Bekannte Beschränkungen

V709 kann eine **mögliche** Lücke erkennen, nicht garantieren, dass zwischen zwei Scrobbles etwas fehlt. Automatisches Nachladen funktioniert nur nach separater expliziter V710-Einwilligung zusätzlich zur V708-Automatik, nur im sichtbaren/fokussierten online-Tab und mit Browser-Web-Locks-Unterstützung. Höchstens eine Extra-Seite je fünf Minuten, bis maximal 100 Seiten pro Sitzung. Last.fm muss die Scrobbles zuvor tatsächlich gespeichert haben. Das Browserarchiv ist auf 8.000 Ereignisse pro Last.fm-Konto begrenzt. Monats- und Tageszeitauswertung verwendet UTC und zählt Wiedergabeereignisse, **keine Hörminuten**. Ein produktiver Dauertest bleibt notwendig.

## Lokale Abnahme unter Windows

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
npm run dev
```

Das erzeugte `package-lock.json` einchecken; `LASTFM_API_KEY=...` nur serverseitig in `.env.local` setzen. Test mit eigenem Last.fm-Konto und realer Lücke, separatem Opt-in, V708 deaktivieren/aktivieren, Kontowechsel, Seitenlimit, Web-Locks in mehreren Tabs, Browser-Neustart und Backup kontrollieren. Keine Produktivfreigabe vor erfolgreichem vollständigem Typecheck, Build und Browser-Abnahme.
