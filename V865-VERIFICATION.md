# V865 – Verifikationsbericht (01.11.2026)

> **Nachtrag V865.1 (01.11.2026):** V844–V848-Hotfix geprüft. Alle Einzeltests V844–V850, V865, Syntax, Architektur, Lockfile und Dateinamencheck bestanden. Die vollständige TypeScript-Prüfung und Next.js-Produktion bleiben **offen/blockiert**. Details in `V865.1-REGRESSION-HOTFIX.md`.

## Getestet / bestanden

- `npm run test:v865`: bestanden. 30/90/365-Tage-Zeiträume, UTC/DST-Grenzen, Tagesaggregation, vermeintliche Paare, exklusive Ereignisse, Archivgrenzen, leere Archive, Unveränderlichkeit und Integration.
- `npm run test:v865:types`, `npm run test:v865:ui-types`: bestanden.
- `npm run test:v707`, `npm run test:v713`, `npm run test:v707:ui-types`: bestanden (bestehender Quellenabgleich, IndexedDB und Quellendialog).
- Funktionstests **V849 bis einschließlich V864**: alle bestanden. Dazu gehören Konzert-, Spotify- und neuere History-Regressionen.
- `npm run check:syntax`: bestanden, 1261 TS/TSX-Dateien.
- `npm run check:architecture`: bestanden, 1001 Quellverweise.
- `npm run test:module-case`: bestanden, 2133 geprüfte Dateien, keine Windows/Linux-Modulnamenkollisionen.
- `npm run check:lockfile:v752`: bestanden. Lockfile, CI und TypeScript-Isolation.
- `npm run test:v864:ui-types`: bestanden.

## Nicht bestanden / nicht durchgeführt (Freigabe blockiert)

- `npm run typecheck`: **FEHLGESCHLAGEN**, weil in dieser Umgebung wesentliche Projektpakete fehlen, unter anderem `next/server`, React und `@types/node`. Deshalb lässt der Lauf keinen Schluss über den Gesamtprojekt-Typstatus bei vollständig installierten Abhängigkeiten zu.
- `npm run build --ignore-scripts`: **FEHLGESCHLAGEN** mit `next: not found`. Der isolierte Versuch übersprang nur die lange Prebuild-Testkette, um die fehlende Next.js-Build-Laufzeit eindeutig festzustellen; er ist **kein erfolgreicher regulärer Produktionsbuild**.
- Echter Spotify-/Last.fm-Livetest, Browser-/Touchscreen-QA und vollständige Next.js-Produktion: **nicht durchgeführt**.

## Lokale vollständige Freigabe

```bash
npm ci
npm run doctor:v858
npm run typecheck
npm run build
```

Vor dem Einsatz bitte die Ergebnisse prüfen. V865 ist ein Quellcode-/Testpaket, **keine bestätigte Produktionsfreigabe**.

## Risiko- und Datenhinweise

V707 verknüpft Spotify-/Last.fm-Wiedergaben nur heuristisch (normalisierter Künstler und Song, ±90 Sekunden, 1:1). Das V865-Panel arbeitet lesend und schreibt die Originalarchive nicht zusammen. UTC-Tagessummen sind von bestehenden Statistiken in Gerätezeit zu unterscheiden. Leere Tage belegen keine verpassten Scrobbles. Die bestehende V713-Migration beim Laden kann IndexedDB synchronisieren.
