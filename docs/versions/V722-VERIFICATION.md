# V722 – Verifikation / Personal Music Insights Dashboard

## Ausgeführte Prüfungen

- `npm run test:v722`: **PASS**, 109 eigenständige Tests für Rekorde, Zeiträume, Trend-/Comeback-/Treue-Übernahmen, Datenlücken, DST, ungültige Daten, UI-Montage, alle Navigationen und rein lesende API-Pfade.
- `npm run test:v722:types`: **PASS**, isolierte TypeScript-Kernprüfung.
- `npm run test:v722:ui-types`: **PASS**, isolierte TypeScript-UI-Prüfung einschließlich Hauptkomponente.
- `npm run test:quick`: **PASS (Exit 0)**, vollständige ältere Release-Regressionen einschließlich Musik-History, Spotify, Konzert/3D, Syntax, Architektur, Modulnamen und Isolation der Testtypen.
- `npm run check:syntax`: **PASS** – 1.009 TS/TSX-Dateien.
- `npm run check:architecture`: **PASS** – Version V722, 679 Referenzen und 10 Dokumentationsabschnitte.
- `npm run test:module-case`: **PASS** – 1.703 Dateinamen ohne case-insensitive Modul-Kollisionen.
- `npm run check:test-types`: **PASS** – acht test-only Deklarationen getrennt vom Produktions-Typraum.

## Nicht bestandene bzw. blockierte Produktionsprüfungen

- `npm run check:dependencies`: **BLOCKIERT (Exit 1)** – keine der 17 verpflichtenden npm-Pakete vorhanden; `package-lock.json` fehlt in der bereitgestellten V721-Ausgangsbasis.
- `npm run typecheck`: **NICHT BESTANDEN (Exit 2)** – zahlreiche externe React-, Next.js- und Node-Module/Typen lassen sich mangels Abhängigkeiten nicht auflösen. Dies ist kein bestätigter Fehler im V722-Kern- oder UI-Typcheck, jedoch auch keine erfolgreiche vollständige TypeScript-Freigabe.
- `npm run build`: **BLOCKIERT (Exit 1)** – die bestehende V680-Abhängigkeitskontrolle verhindert einen Next.js-Produktionsbuild. **Kein Produktionsbuild wurde erfolgreich ausgeführt.**

## Nachprüfung auf Windows

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
```

Das bei `npm install` erzeugte `package-lock.json` kontrollieren und für reproduzierbare Builds ins Projekt aufnehmen.

## Daten- und Produktgrenzen

Scrobbles sind keine Hörminuten. „Erstmals entdeckt“ meint erste Beobachtung im vorhandenen Archiv. Monate vor dem ersten archivierten Ereignis sind als ohne Beobachtungsgrundlage gekennzeichnet; Monate mit null Scrobbles belegen keine tatsächliche Hörpause. Alle Kernzahlen beziehen sich auf das schon lokal gespeicherte Last.fm-Archiv und bestehende V717–V721-Regeln. Kein zusätzlicher Spotify→Last.fm-Scrobbler.
