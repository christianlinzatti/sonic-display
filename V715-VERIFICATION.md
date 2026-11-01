# Sonic Display V715 – Prüfbericht

**Release:** `0.1.0-v715`, History Explorer 2.0. **Stand:** 29. Oktober 2026.

## Erfolgreiche lokale Prüfungen

- `npm run test:v715` – **PASS**, 59 Regressionen: Datumsintervalle, Unicode-/Künstlersuche, Sortierung, Pagination, CSV-Escaping (inkl. Injection), 8.501 Archivdatensätze, DST in `Europe/Vienna`, unveränderte V711/V712/V714-Integration.
- `npm run test:v715:types` – **PASS**, reiner V715-Datenkern.
- `npm run test:v715:ui-types` – **PASS**, isolierte V715-UI-Prüfung mit *ausschließlich im Test* zugelassener React/JSX-Typstub.
- Die Versionsregressionen `test:v706` bis `test:v714` – **PASS**.
- `npm run check:syntax` – **PASS**, 996 TS-/TSX-Dateien.
- `npm run check:architecture` – **PASS**, Dokumentationsstand V715 und 652 Quellcode-Referenzen.
- `npm run test:module-case` – **PASS**, keine kollidierenden TS-/TSX-Dateinamen.
- `npm run check:test-types` – **PASS**, Test-Typen sind von der Produktionskonfiguration isoliert.
- `npm run test:quick` – **bis zur letzten Prüfung durchgelaufen** (89 Skriptschritte laut Paketdefinition; letztes Prüfprotokoll: `PASS Spotify build environment`). Der ausführende Container-Aufruf meldete eine Zeitüberschreitung, daher **kein direkt erfasster Gesamt-Exit-Code**; die einzelnen Schritte im Protokoll zeigten keine fehlgeschlagenen Tests. Eine abschließende Wiederholung im Zielsystem bleibt empfehlenswert.

## Blocker für Produktionsfreigabe

- `npm install --prefer-offline` – **Zeitlimit überschritten**; keine Abhängigkeiten installiert.
- `npm run typecheck` – **Exit 2**: fehlende npm-Module/Typschnittstellen (`next`, `react`, `@types/node` usw.). Isolierte V715-Typchecks bestehen; das ersetzt keine vollständige TS-Prüfung.
- `npm run build` – **Exit 1** bereits im V680-Preflight: **0 von 17** npm-Abhängigkeiten installiert, **kein `package-lock.json`** im gelieferten Projekt. Noch **kein** erfolgreicher Next.js-Produktionsbuild nachgewiesen.
- Reale Browserabnahme (CSV-Datei, Touch-Navigation, Offline-/Quota-Fälle, Last.fm-API 429 und längere Kontowechsel im IndexedDB-Archiv) und Gerätetests sind **nicht** ausgeführt.

## Freigabe-Schritte auf Windows

1. In das extrahierte Projektverzeichnis wechseln und `npm install` ausführen. Das dadurch entstandene `package-lock.json` zusammen mit der Version einchecken.
2. `npm run test:quick`, `npm run typecheck`, `npm run build` ausführen. **Erst nach bestandenem Produktionsbuild freigeben.**
3. Im Browser mit dem bisherigen Last.fm-Archiv nach Datum suchen, zwischen Seiten wechseln, auf Künstler filtern und CSV-Datei in Excel/LibreOffice stichprobenartig prüfen. Die CSV darf bei größerer Filtermenge höchstens 25.000 Zeilen enthalten; der JSON-Export umfasst weiterhin die gesamte History.
4. Die bereits aktive Spotify→Last.fm-Verbindung nicht doppelt in Sonic Display einrichten.
