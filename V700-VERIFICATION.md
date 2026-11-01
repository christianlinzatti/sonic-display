# V700 – Smart Listening History – Prüfstatus (29. Oktober 2026)

## Erfolgreiche Prüfungen

- `npm run test:v700`: **PASS** – 55 gezielte Prüfgruppen und **21.000 synthetische gemischte Eingaben** (Zeitgrenzen, Replay-Zählung, lokale Kalendertage, Künstler-Credits, eindeutige IDs, Datenbegrenzung, UI-/Privatsphären-Vertrag). Keine echten Spotify-Hörereignisse wurden in diesen Tests verwendet.
- `npm run test:v700:types`: **PASS** – echter TypeScript-Check des isolierten V672/V699/V700-Datenkerns.
- `npm run test:v700:ui-types`: **PASS** – isolierter TypeScript-/JSX-Check des neuen React-Panels. Die testseitigen React-Deklarationen sind nicht im produktiven Typset aktiviert; kein Ersatz für den vollständigen Next.js-Build.
- `npm run test:v699` **PASS** (44 Gruppen, 12.000 CSV-Sicherheitseingaben), `npm run test:v696` **PASS** (67 Gruppen). V672, V673, V674, V675, V677 und V685–V687 sowie V690 wurden ebenfalls gezielt erfolgreich ausgeführt.
- Die **Versionsregressionen V669 bis V700** und alle nachgeordneten Prüfungen `check:syntax`, `check:architecture`, `test:module-case`, `check:test-types` und `test:env:spotify-build` meldeten im vollständigen Log jeweils **PASS** (`/mnt/data/v700-quick.log`). Der aufrufende Gesamtprozess erreichte jedoch sein Tool-Zeitlimit, obwohl bereits das letzte Teilergebnis im Log steht; ein abschließender Exit-Code des **Gesamtaufrufs** ist nicht belegt. Daher nicht als abgeschlossenes `npm run test:quick` mit Exit 0 ausgewiesen.
- Die älteren Tests V685/V686/V687/V690/V696/V699 wurden hinsichtlich hart kodierter maximaler Versionsnummern für die V700-Nachfolge gelockert. Die fachlichen Assertions sind erhalten geblieben.

## Ausgeführte, aber blockierte Produktionsprüfungen

- `npm run check:dependencies`: Exit **1** – **0 von 17 npm-Paketen installiert**, `package-lock.json` fehlt.
- `npm run build`: Exit **1** beim bestehenden Prebuild-Abhängigkeits-Gate; der Next.js-Build konnte nicht beginnen.
- `npm run typecheck`: Exit **2**, u.a. `TS2307` wegen fehlender Next/React/Three-Module und Node-Typen; vollständiger produktiver TypeScript-Check **nicht bestanden**.
- Kein tatsächlicher Chromium-/Spotify-Live-Test, keine mobile Touch-Abnahme und keine echte Abnahme der UI auf einem produktiven Display. Keine GLB-/WebGL-Effekte wurden verändert.

## Manuelle Freigabe auf Windows

1. Projekt-ZIP entpacken, `npm install` ausführen und das erzeugte `package-lock.json` versionieren.
2. `npm run typecheck`, `npm run build` und `npm run test:quick` vollständig durchlaufen lassen.
3. Spotify verbinden, **Zuletzt gespielt → Smart History** öffnen, 14-Tage-Timeline und Tagesauswahl mit realen lokalen Daten abgleichen; Sonntage, Jahres- und Sommerzeitwechsel berücksichtigen.
4. Einen wiederholt gehörten Song und einen Feature-Track auswählen; prüfen, dass Künstler-Credits zusammenbleiben, der Wiederholungsschalter korrekt arbeitet und „Erstmals/zuletzt“ nur den geladenen Zeitraum beschreibt.
5. Weitere Spotify-Seiten ausdrücklich laden; Such-/Zeitraumfilter und die Aktualisierung der Song-/Künstler-Ranglisten kontrollieren. Schließen und erneut Öffnen verwirft die lokalen Verlaufsdaten.

**Status:** Implementierungs-/Quellcodeprüfungen bestanden; vollständige Produktions- und Live-Browser-Freigabe offen.
