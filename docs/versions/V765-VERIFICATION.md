# V765 – Testprotokoll und Release-Status

## Erfolgreich geprüft

- `npm run test:v765`: **72.081 Assertions** für Suche, Sortierung, Rename-Race-Guard, vollständige und einzelne V764-JSON-Exporte, Importvorschau, Konflikte, Skip/Replace, explizite Übernahme, Kapazitätsüberschreitung, beschädigte Bibliothek, Quota- und unvollständige Schreibvorgänge, Songwechsel-Automatik und unveränderte Live-V354-Show.
- `npm run test:v765:types`: isolierter strenger TypeScript-Check für neue Kernlogik.
- `npm run test:v765:ui-types`: isolierter strenger TypeScript-Check für die neue UI und die V764-Einbindung.
- `npm run verify:v765:static`: **erfolgreich**; einschließlich der vorherigen statischen Release-Prüfkette V764 bis V752, Syntax-, Architektur-, Lockfile- und Windows-/Linux-Dateinamenprüfungen.
- Einzelne Versionstests **V735–V764: 30/30 bestanden**; insbesondere V763 120.086 und V764 36.113 Assertions.
- Zusätzliche Regressionen `test:v354`, `test:v657`, `test:v658`, `test:module-case`: bestanden.
- Portable Backups behalten den vorhandenen Schlüssel `sonic-concert-song-library-v764`. Es gibt keine Migration, die ältere Bibliotheken unlesbar macht.

## Nicht als bestanden behauptet

- `npm run check:dependencies` meldet **0/18 benötigte direkte npm-Abhängigkeiten**. Diese Umgebung besitzt kein installiertes `node_modules`. Lokale Installation mit Netzwerkzugang erforderlich.
- `npm run typecheck` wurde versucht und schlug an fehlenden Next.js-, React-, Node- und anderen npm-Typen fehl. Isolierte Tests ersetzen keine vollständige Typprüfung.
- `npm run build` lief durch die frühe V765-/V764- und Regressionstestkette, wurde bei `check:dependencies` **vor** der Next.js-Kompilierung blockiert.
- Kein echter Chrome-/Edge-/Firefox-Browser-Test mit mehreren GLB-Avataren oder realer Musikleistung. Kein produktionsverifiziertes V765.

## Lokal unter Windows prüfen

```powershell
npm ci
npm run verify:v765:static
npm run typecheck
npm run build
```

Vor einem Import mit **Ersetzen** die vollständige V764-Songbibliothek exportieren. Die V765-Bibliotheksvorschau ersetzt niemals eine aktuell geöffnete V354-Timeline.
