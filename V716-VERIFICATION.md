# Sonic Display V716 – Prüf- und Freigabestatus

**Release:** `0.1.0-v716` · 29. Oktober 2026 · Interaktiver History-Kalender.

## Technisch nachgewiesen

- `npm run test:v716`: PASS – 54 Kalender-Regressionen (Monatswechsel, Schaltjahre, leere Monate und Tage, lokale Sommer-/Winterzeit, 10.003 Ereignisse, UI-Verknüpfung, bestehende History-Integration).
- `npm run test:v716:types`: PASS – V716-Kalenderdatenkern (TypeScript).
- `npm run test:v716:ui-types`: PASS – isolierte React/JSX-Typprüfung mit ausschließlich im Test erlaubten Stubs. Dies ersetzt **nicht** die vollständige Projekt-Typprüfung.
- `npm run test:quick`: **PASS (Exit 0)** – alle im Projekt registrierten Schnelltests einschließlich V716, älterer Versionsregressionen, Typprüfungen, Syntax-/Architekturprüfung und Spotify-Session-Umgebung.
- `npm run test:v715` sowie `npm run test:v699` bis `npm run test:v714`: PASS – bestehende History, Longterm IndexedDB, Wrapped und Taste Evolution erhalten.
- `npm run check:syntax`: PASS – 997 TS-/TSX-Quelldateien.
- `npm run check:architecture`: PASS – Architektur-Dokumentation und reale Quellcode-Referenzen.
- `npm run test:module-case`: PASS – keine Konflikte bei nur durch Groß-/Kleinschreibung unterschiedenen Modulnamen.
- `npm run check:test-types`: PASS – Test-Only-Typen aus produktiver Konfiguration ausgeschlossen.

## Blocker und noch offene Abnahme

- `npm run typecheck`: **Exit 2** – fehlende npm-Module inklusive `react`, `next`, `@types/node` (0 von 17 direkten Abhängigkeiten installiert). Kein vollständiger Projekt-Typcheck möglich.
- `npm run build`: **Exit 1 im V680-Abhängigkeitscheck**, bevor Next.js gestartet werden kann: 17 npm-Pakete fehlen, `package-lock.json` fehlt in der V715-Basis und wird nicht erfunden.
- Reale UI-/Touch-Browser-Tests und Last.fm-Livekonten-Verifikation sind hier nicht durchgeführt. Es wurde kein Produktionsbuild erfolgreich bestätigt.

## Nach dem Entpacken auf Windows

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
```

Das durch `npm install` entstehende `package-lock.json` mit ins Projekt aufnehmen. Anschließend die Kalendernavigation, einen Tag ohne Songs, den Klick auf einen belegten Tag, Filterkombinationen und die 23-/25-Stunden-Tage in der lokalen Browser-Zeitzone visuell testen. Bereits aktiviertes Spotify-Scrobbling bei Last.fm nicht zusätzlich in Sonic Display duplizieren.
