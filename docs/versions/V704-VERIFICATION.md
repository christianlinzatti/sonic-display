# V704 – Verifizierungsprotokoll (29.10.2026)

## Fertiggestellte Änderungen

- `lib/listening-discovery-v704.ts`: reine Auswertung mit fünf evidenzgebundenen Kategorien, Deduplizierung, maximal 5000 Archivereignissen, verifizierten Track-Links und defensiver Zeitvalidierung.
- `components/ListeningDiscoveryDashboardV704.tsx`: eigenständiges Dashboard mit Konto- und Speicherschutz, fünf Schaltflächen, responsiver Song-/Künstlerdarstellung, leeren Zuständen und bewusstem Neuladen.
- `components/RecentlyPlayedV672.tsx`: zusätzlicher Tab „✧ Entdeckungen“, bestehende Spotify-Ansichten unverändert verfügbar; der neue Archiv-Tab benötigt keine bereits geladenen Chronik-Titel.
- `app/globals.css`: Desktop-, Touch- und schmale Bildschirmdarstellung. Neue Styles nur unter `.discovery-*-v704`.
- README, ARCHITECTURE, V704-Dokumentation, neue Tests und NPM-Testaufträge.

## Erfolgreich ausgeführt

- `npm run test:v704`: **59 Prüfgruppen**, **12000 fehlerhafte Eingabeereignisse** ohne Übernahme.
- `npm run test:v704:types`: PASS (isolierter TypeScript-Check).
- `npm run test:v704:ui-types`: PASS (isolierter React-/JSX-Check).
- Direkte Ausführung der bestehenden `test:vNNN`-Befehle für **alle 36 Versionen V669–V704**: **jeweils PASS**. Die älteren V696-, V699- und V703-Tests prüfen weiterhin ihre Funktionen und akzeptieren nun die gültige Nachfolgeversion V704. Log außerhalb der ZIP: `/mnt/data/v704-direct-regressions.log`.
- `npm run check:syntax`: PASS, 976 TS/TSX-Dateien.
- `npm run check:architecture`: PASS, 624 Quellcodeverknüpfungen.
- `npm run test:module-case`: PASS, 1652 Quellmodule ohne case-only-Dateikonflikte.
- `npm run check:test-types`: PASS, acht Test-Typdeklarationen von produktiven Typen isoliert.
- `npm run test:env:spotify-build`: PASS, Spotify-Build- und Sitzungs-Sicherheitsprüfung.

## Nicht als bestanden auszugeben

- `npm run test:quick` als ein durchgehender Prozess: **Zeitlimit** nach erfolgreichen V704–V694-Ausgaben; die einzelnen vorhandenen `test:vNNN`-Aufträge V669–V704 wurden deshalb getrennt erfolgreich wiederholt. Die isolierten Typprüfungen für ältere Versionen wurden **nicht alle separat** wiederholt.
- `npm run build`: **BLOCKIERT** im Abhängigkeits-Preflight: Node-Pakete **0/17** verfügbar, `package-lock.json` fehlt. Next.js wurde nicht gestartet. Dies ist ausdrücklich kein erfolgreicher Produktionsbuild.
- `npm run typecheck`: **FEHLGESCHLAGEN** wegen fehlender React-/Next-/Node-/Three-Module und Typdefinitionen; die nachfolgenden Fehler dürfen ohne Installation nicht als eigenständige Produktcode-Fehler interpretiert werden.
- **Kein echter Browser-/Spotify-End-to-End-Test**, keine Live-Daten aus einem Nutzerkonto und keine Raspberry-Pi-/WebGL-Messung.

## Verifikation auf dem Windows-Rechner mit Abhängigkeiten

```powershell
npm install
npm run test:smoke:v704
npm run test:quick
npm run typecheck
npm run build
```

Anschließend mit verbundenem Spotify-Konto „Zuletzt gespielt → Mein Archiv“ aktivieren, eine reale Wiedergabe bewusst sichern, unter „Entdeckungen“ die Kategorien testen, aktualisieren, den Browserneustart sowie einen Kontowechsel prüfen. Vorher ein JSON-Backup anlegen. Bei mehr als 5000 Archivereignissen ältere Daten und Speicherkappung berücksichtigen.
