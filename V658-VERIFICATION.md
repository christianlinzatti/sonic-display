# V658 – Prüfbericht (28.10.2026)

Basis: exakt das ausgelieferte V657-Vollarchiv.

## Bestätigte Prüfungen

- `npm run test:v658`: bestanden. Optimistisches Editieren, 409 bei veralteter Revision, lokale Wiederherstellung, gleichzeitige Blob-Events, getrennte Avatar-Updates, beschädigter Snapshot, defektes Journal und >1000 Blob-Einträge simuliert.
- `npm run test:v658:types`: bestanden (isolierte V658-Logik, Testtyp-Shim nur unter `tests/stubs/`, vom Produktions-tsconfig ausgeschlossen).
- `npm run test:smoke:v658`: **Exit Code 0** beim vollständigen Lauf (V658 → V616 über V657, V656, V655, V654, V653, V652 usw.).
- `npm run test:v656`, `npm run test:module-case`, `npm run check:test-types`, `npm run test:env:spotify-build`, `npm run check:syntax` und `npm run check:architecture`: bestanden.
- V654 Blob-Parallelitätsregression: bestanden.
- ZIP-Integrität und Patch-Rekonstruktion gegenüber der ausgelieferten V657-Basis: bei Erstellung der Artefakte geprüft.

## Ausständig / Grenzen

- Vollständiger `npm run typecheck`: **versucht, nicht bestanden**. Der lokale Projektordner enthält keine installierten `node_modules` bzw. `@types/node`, React, Next.js, @vercel/blob usw. Der Checker meldet daher fehlende Module und Folgefehler, nicht einen nachgewiesenen vollständigen V658-Build. Nach Beseitigung fehlender Deklarationen keine weiteren eindeutig neuen V658-Fehler im betreffenden Kernmodul erkennbar; das ist **kein** Ersatz für den vollständigen Typecheck.
- `npm run build` (Next.js Produktionsbuild): **nicht ausgeführt / nicht bestätigt**, weil dieselben Abhängigkeiten fehlen. GitHub Actions ist auf Windows und Ubuntu eingerichtet; nach Push ist dessen Ergebnis abzuwarten.
- Kein echter Multi-Instance-Blob-Live-Test mit Eventual Consistency. Die deterministische Eventprojektion kann konkurrierende Schreibvorgänge nachträglich erkennen und verwerfen; ohne transaktionalen Speicher ist eine sofortige Konfliktantwort über alle Instanzen nicht garantiert.
- Der manuelle Recovery-Endpunkt setzt **nur lokale** `.bak`-Konfigurationen zurück, nicht die Blob-Historie. Bei unsicherem Blob-Journal sind Schreibvorgänge bis zur kontrollierten Reparatur gesperrt. Der V657-Geräteexport bleibt das zusätzliche externe Backup.
