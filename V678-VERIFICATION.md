# V678 – Prüfprotokoll (28.10.2026)

## Erfolgreich (im bereitgestellten Arbeitsverzeichnis)

- `npm run test:v678`: **40 Prüfungen**, einschließlich rein akustischer Signalmerkmale, Klassifikation, Silent-Signal-Schutz, Songwechsel, Hysterese, bounded Sampling, Opt-in, Manual-Priority, unverändertem Director-Verhalten bei OFF und UI/Backup-Anschluss.
- `npm run test:v677`: **31 Prüfungen**.
- `npm run test:v676`: **26 Prüfungen**.
- `npm run test:v675`: **21 Prüfungen**.
- `npm run test:v674`: **16 Prüfungen**.
- `npm run test:v673`: **12 Prüfungen**.
- `npm run test:v672`: **12 Prüfungen plus 7 API-Szenarien**.
- `npm run test:v671`, `npm run test:v670`, `npm run test:v669`: erfolgreich (Konzertereignisse, Guard, Dramaturgie; inklusive deterministischer Testframes).
- `npm run check:syntax`: **940 TS/TSX-Dateien** erfolgreich.
- `npm run check:architecture`: **605 Referenzen**, 10 Bereiche erfolgreich.
- `npm run test:module-case`: **1582 Dateien**, keine case-insensitiven Dateinamen-Kollisionen.
- `npm run check:test-types`: erfolgreich; Test-only-Deklarationen können produktive Typen nicht maskieren.
- `npm run test:env:spotify-build`: erfolgreich.
- `npm run test:v657`, `npm run test:v658`: Backup und Konfigurationswiederherstellung erfolgreich.
- Isolierter strikter TypeScript-Check: `tsc --noEmit --strict --target ES2022 --module commonjs --lib ES2022,DOM --skipLibCheck lib/live-mood-v678.ts` **bestanden**.

## Ausständig / fehlgeschlagen

- Vollständiger `npm run typecheck`: **fehlgeschlagen**, weil im Arbeitsverzeichnis `node_modules` einschließlich `react`, `next`, `@types/node` fehlt. Fehler betreffen zahlreiche Altdateien sowie React-Imports der neuen Providerkomponente. Dies ist **kein bestandener Gesamtcheck**.
- `npm run build`: gestartet, aber nach längerem Lauf während des historischen `prebuild`-Testbaums abgebrochen (Zeitlimit), **bevor** `next build` aufgerufen wurde. Also **kein abgeschlossener Produktionsbuild**.
- Keine echte Hardware-/Mikrofon-/Browsertest-Sitzung mit Spotify-Audio; Mikrofonfreigabe und ausgewertete Umgebungsgeräusche müssen auf dem Zielgerät überprüft werden.

## Zur vollständigen Freigabe (mit installierten Abhängigkeiten)

```bash
npm install
npm run test:v678
npm run typecheck
npm run build
```

## Wichtige Grenzen

V678 nutzt **ausschließlich aktive Mikrofonmessungen** und liefert **akustische, heuristische Zustände** – keine zuverlässige Analyse persönlicher Emotionen. Es ruft keine Spotify-Audioanalyse ab und speichert keine Audiodaten. Mikrofonfreigabe, Nutzer-Opt-in und aktiver Song sind erforderlich. V678 ist standardmäßig ausgeschaltet. Alle Akzente sind begrenzt, flüchtig und greifen nur ganz am Ende der bestehenden Licht-/Tanz-Regiekette ein.
