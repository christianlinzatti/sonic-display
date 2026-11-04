# V859 – Prüfbericht · Interactive Music Timeline

## Erfolgreiche Prüfungen in der Arbeitsumgebung

- `npm run test:v859`: Mehrjahresübersicht inkl. Archivlücken; Jahres- und Monatswechsel; Künstler-Normalisierung inklusive Unicode; Gesamt-/Monats-/Jahresstatistik; erster/letzter archivierter Scrobble, stärkster Monat, 90-Tage-Wiederentdeckungen; Auswahlfallbacks; Wiener Lokalzeit gegen UTC mit Monatswechsel; ungültige/zukünftige Zeitstempel; unmodifizierte Eingabedaten; keine neuen Hintergrundabrufe, Schreibzugriffe oder API-Endpunkte; UI- und Release-Gates.
- `npm run test:v859:types`: Strenger isolierter TypeScript-Check des reinen Timeline-Datenkerns.
- `npm run test:v859:ui-types`: Isolierter TypeScript-Check des Timeline-Panels mit ausschließlich testseitigen React-/JSX-Stubs (die produktive TS-Konfiguration wird nicht verändert).
- `npm run test:v858` bis `test:v849` einschließlich V849/V850 Konzert-Regressionsgruppen; V851–V854 Spotify-/Lautsprecherregressionen; V855–V858 History-/Musik-Radar-Regressionen.
- Zugehörige isolierte TypeScript-/UI-Typprüfungen V849–V858 sowie der ältere `test:v714`.
- `npm run check:syntax`: 1249 TS/TSX-Quellcodedateien, Importbindungen.
- `npm run check:architecture`: 979 überprüfte Codepfade; Dokumentationsstand V859.
- `node tests/module-case-regression.cjs`: 2115 überprüfte Source-Dateien ohne Windows-/Linux-Kollisionsrisiken bei Groß-/Kleinschreibung oder TS-/TSX-Varianten.
- `npm run check:lockfile:v752`: Release-Version, Lockfile, CI- und Release-Prüfschritte.
- ZIP-Archiv geprüft (Integrität und enthaltene neue Komponenten/Tests/Release-Metadaten).

## Nicht bestanden / nicht abgeschlossen

- **Vollständiger produktiver TypeScript-Check:** `npm run typecheck` endet mit Exit 2 und u.a. `Cannot find module 'next/server'`, fehlendem `process` bzw. weiteren `react`-, `next`- und `@types/node`-Deklarationen. Projektabhängigkeiten sind in dieser Umgebung nicht installiert. Damit können produktive Typfehler nicht abschließend ausgeschlossen werden.
- **Next.js-Produktionsbuild:** `npm --ignore-scripts run build` endet mit Exit 127, `next: not found`. Ein erfolgreiches Next.js-Produktionsartefakt liegt nicht vor. Eine vollständige produktive Freigabe ist damit ausdrücklich noch **nicht** nachgewiesen.
- **Realer Betrieb:** Keine Live-Anmeldung bei Last.fm, kein echter Playlist-/Lautsprechertest, kein Browser-/Touch-Test am geplanten 10-Zoll-Display. Renderqualität und große reale Archive bleiben als Integrationschecks offen.

## Nachprüfung auf einem Rechner mit installierbaren Abhängigkeiten

```bash
npm ci
npm run test:v859
npm run test:v859:types
npm run test:v859:ui-types
npm run typecheck
npm run build
```

Der Build startet die projektweite Prüfkette; die isolierten Tests sind nur Zusatzprüfungen und dürfen den Gesamt-Typecheck bzw. Next.js-Produktionsbuild nicht ersetzen. Bei erneuter Freigabe muss das reale Browser-/Kiosk-Verhalten verifiziert werden.
