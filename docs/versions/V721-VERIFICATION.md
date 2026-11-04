# V721 – Prüfbericht / Artist Discovery Dashboard

## Neu implementiert und separat geprüft

- `npm run test:v721`: **PASS** – 105 neue Prüfungen zu lokalen 30-Tage-Fenstern, Künstleranteilen, minimaler Datengrundlage, alten/unvollständigen Archiven, 3-Jahres-Treue, 90-Tage-Comebacks, DST-Kalendertagen, Jahreswechsel, Unicode/NFKC, Duplikaten, ungültigen Ereignissen, mehr als 12.000 Scrobbles, echter UI-Integration und rein lesenden Datenpfaden.
- `npm run test:v721:types`: **PASS** – isolierter TypeScript-Kerntypcheck.
- `npm run test:v721:ui-types`: **PASS** – isolierter TypeScript-Check für Dashboard und Last.fm-Integration.
- `npm run test:v720`, `npm run test:v719`, `npm run test:v714`: **PASS**, Versionsprüfungen auf V721 erweitert und vorhandene Feature-Checks weiter aktiv.
- `npm run check:syntax`: **PASS** – 1.007 TypeScript-/TSX-Dateien.
- `npm run check:architecture`: **PASS** – 677 reale Referenzen; Architektur-Dokumentationsstand V721.
- `npm run test:module-case`: **PASS** – 1.700 Dateiidentitäten ohne Groß-/Kleinschreibungskollisionen.
- `npm run check:test-types`: **PASS** – Testtypen vom produktiven Typraum isoliert.

## Projektweite Prüfungen

- `npm run test:quick`: **PASS (Exit 0)** – vollständige V721- bis V669-Prüfsequenz und historische Projekt-Regressionen einschließlich Spotify-Session-Build-Umgebung, Syntax, Architektur, Modul-Casing und Testtypen.
- `npm run check:dependencies`: **BLOCKIERT** – 0 von 17 geforderten npm-Paketen im Arbeitscontainer verfügbar; `package-lock.json` nicht in der Ausgangsquelle vorhanden.
- `npm run typecheck`: **NICHT BESTANDEN (Exit 2)** – fehlende React-, Next.js-, Node- und weitere Paket-Typen, deshalb keine belastbare Gesamtrepo-Typfreigabe. Die neuen isolierten Kern- und UI-Prüfungen sind unabhängig davon bestanden.
- `npm run build`: **BLOCKIERT (Exit 1)** – die vorgeschaltete V680-Dependency-Gate verweigert den Build bei fehlenden 17 Paketen und Lockfile. Es wurde **kein** Next.js-Produktionsbuild durchgeführt oder behauptet.

## Nachprüfung im Windows-Projektordner

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
```

Anschließend das erzeugte `package-lock.json` prüfen und versionieren; für reproduzierbare CI-Builds bevorzugt `npm ci`.

## Interpretation

„Aufstrebend“ bezeichnet nur messbare Zuwächse des Scrobble-Anteils unter Mindestschwellen; „langjähriger Favorit“ ist eine definierte Häufigkeit über mindestens drei archivierte Jahre und „Comeback“ eine nachgewiesene Pause **zwischen archivierten Wiedergaben**. Datenlücken, Offlinemonate oder nachträglich importierte Scrobbles können die Ergebnisse verändern. Die V721-Auswertung ruft weder Last.fm noch Spotify auf, übermittelt keine Scrobbles und erzeugt keine neuen Tokens oder Berechtigungen.
