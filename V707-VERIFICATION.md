# V707 – Last.fm/Spotify Quellenvergleich: Testbericht

Stand: 29.10.2026. Grundlage: Sonic Display V706. Produktiv unveränderte Spotify- und Last.fm-Speicherverträge; die Darstellung liest nur lokale Archive.

## Erfolgreich ausgeführt

- `npm run test:v707`: **PASS**, 53 gezielte Testgruppen und 12.000 verworfene ungültige Quellereignisse. Abgedeckt: getrennte Quellen, exakter/normalisierter Abgleich, ±90-Sekunden-Grenze, one-to-one-Matching, echte Wiederholungen, fehlende Übereinstimmungen, Datenzählung, Link-Sicherheit, lokale Kalenderfenster, Rankings, Comebacks, selten gehörte Titel, Anzeige-Integration, Kontoprüfung und Write-Freiheit.
- `npm run test:v707:types`: **PASS**, isolierter V707-TypeScript-Datenkern.
- `npm run test:v707:ui-types`: **PASS**, isolierter React-/JSX-Typecheck mit Test-only-Deklarationen.
- `npm run test:v706`: **PASS**, 81 Last.fm-Regressionsgruppen und 12.000 abgewiesene ungültige Scrobbles.
- `npm run test:v705`, `v704`, `v703`, `v702`, `v701`, `v700`, `v699`, `v696`: **PASS** in zusätzlichen gezielten Rückwärtskompatibilitätsprüfungen.
- `npm run test:quick`: **PASS, Exit-Code 0**, gesamte Versionsregression **V669–V707**, einschließlich der abschließenden Strukturprüfungen.
- `npm run check:syntax`: **PASS**.
- `npm run check:architecture`: **PASS**, V707 dokumentiert, 631 Quellreferenzen.
- `npm run test:module-case`: **PASS**, 1.662 Quell-Dateinamen ohne Case-Kollisionen.
- `npm run check:test-types`: **PASS**, acht Test-only-Typdeklarationen bleiben aus den produktiven Typen ausgeschlossen.
- `npm run test:env:spotify-build`: **PASS**, bestehende Spotify-OAuth-/Cookie-Sicherheitsprüfungen.

## Nicht bestanden / noch offen

- `npm run typecheck`: **FAIL** in dieser Umgebung. Die produktiven Abhängigkeiten einschließlich `next`, `react`, `@types/node` sind nicht installiert; deshalb scheitert der projektweite TypeScript-Check an nicht auflösbaren Modulen/Typen. Der isolierte V707-Typecheck ersetzt diesen Nachweis nicht.
- `npm run build`: **BLOCKIERT** durch `check:dependencies`, bevor Next.js kompiliert: **0/17 installierte Pakete**, `package-lock.json` fehlt. Es wurde kein vollständiger Produktionsbuild erstellt.
- **Keine echte Browser-/Spotify-/Last.fm-Kontoabnahme** und keine realen Scrobbles beider Dienste für eine visuelle Verifikation der Erkennung verfügbar. Die zusammengeführten Testereignisse sind ausschließlich kontrollierte Fixture-Daten.
- Im gemeinsamen Modus bleibt das Matching nur **heuristisch**; Dienste können Wiedergabezeitpunkte abweichend vergeben. Die 90-Sekunden-Grenze kann Doppelungen übersehen oder unabhängige nahe Wiedergaben zu einem Paar zusammenführen. Die UI benennt diese Einschränkung. Unterschiedliche Albumversionen können im Titel-/Künstler-Credit-Zähler zusammenfallen. Die Originalarchivdaten werden nie modifiziert.

## Windows-Freigabe

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
npm run dev
```

Danach Spotify verbinden und Spotify-Archiv aktivieren, in Last.fm-History denselben Hörkontext durch Scrobble-Import erschließen, **Meine Statistik** und **Entdeckungen** durch die drei Datenquellen schalten und im gemischten Modus zwei reale, knapp zeitgleiche Wiedergaben sowie absichtlich deutlich versetzte Wiederholungen vergleichen. Beim Abgleich auch Kontowechsel und beschädigte lokale Archive kontrollieren.
