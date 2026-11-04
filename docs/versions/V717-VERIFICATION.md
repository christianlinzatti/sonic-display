# Sonic Display V717 – Verifizierung

**Projektbasis:** Das vom Nutzer bereitgestellte vollständige `sonic-display-v716-history-calendar.zip`.

## Bestandene Prüfungen

- `npm run test:v717` – **61** neue Prüfschritte (Rekordtage und -monate, zusammenhängende Hörserien, Monatsvergleich, 90-Tage-Wiederentdeckungen, lokale DST-Grenzen, unsortierte/große Archive, UI-Navigation und No-Write-Vertrag).
- `npm run test:v717:types` – erfolgreich (Kernmodell).
- `npm run test:v717:ui-types` – erfolgreich (Kernmodell und neue UI im V706-Elternpanel).
- Einzeln erneut ausgeführte Versionstests `npm run test:v716` bis `npm run test:v699` – **alle bestanden**.
- `npm run check:syntax` – 999 TS/TSX-Dateien mit gültigen Bindings.
- `npm run check:architecture` – 661 Architekturreferenzen; Doku auf V717 angehoben.
- `npm run test:module-case` – 1688 Quelldateien ohne Groß-/Kleinschreibungskollisionen für TS/TSX.
- `npm run check:test-types` – acht reine Testtypdeklarationen isoliert, keine produktiven Ambient-Typüberschreibungen.
- `npm run test:env:spotify-build` – bestandene Spotify-Umgebungstests.

## Offene Prüfungen (nicht als bestanden werten)

- `npm run test:quick`: Vollständiger Testlauf hat **95 Schritte**, wurde bis in die V708-Typechecks ausgeführt und **durch das Laufzeitlimit** abgebrochen. Die einzelnen History-Funktionstests V699–V717 wurden daraufhin erfolgreich separat ausgeführt. Die gesamte 95-Schritt-Kette ist **nicht vollständig abgeschlossen**.
- `npm run typecheck` (gesamtes Projekt) und `npm run build` (Next.js-Produktionsbuild): **hier nicht erfolgreich nachgewiesen**. Der Dependency-Preflight meldet **0 von 17 direkten npm-Paketen installiert**, zusätzlich fehlt in der gelieferten ZIP eine `package-lock.json`. Ohne Installation sind Full-Typecheck und Next.js-Build nicht aussagekräftig ausführbar.
- Reale Browser-Abnahme (Last.fm-Account/IndexedDB, 10-Zoll-Touchscreen und Serverkonfiguration) nicht durchgeführt.

## Prüfung unter Windows (im entpackten Projektverzeichnis)

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
```

`npm install` erzeugt bei Bedarf ein neues `package-lock.json`. Dieses sollte nach erfolgreicher Auflösung ins Repository eingecheckt werden, damit weitere Builds reproduzierbar sind.
