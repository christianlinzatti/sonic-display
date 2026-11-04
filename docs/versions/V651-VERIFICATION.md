# V651 – Verifikation (28.10.2026)

## Implementiert

- Verlässlichkeitsschwellen für die vorhandene Last.fm/Genre-Intelligence: Track ≥80/100, Künstler ≥88/100. Diese Zahlen stammen aus dem vorhandenen *heuristischen* Genre-Score und sind keine empirisch kalibrierte Genauigkeitswahrscheinlichkeit.
- Genrezuordnung ausschließlich zu fünf vorhandenen V650-Werksprofilen; unbekannte/mehrdeutige Genres, Fehler und manuelle Genrekorrekturen werden nicht automatisch verarbeitet. Werkprofil für 10-Zoll-Lyrics bleibt ausschließlich manuell wählbar.
- Benutzersteuerung im Touchmodus → Steuerzentrale → Profile: Off (Standard), Vorschlag oder Auto; lokale persistente Moduswahl ohne API-Aufrufe. Auto nur bei laufendem Song und Startzeit ≤12 Sekunden, nach 900 ms Stabilisierung und pro Titel maximal einmal. Aktueller Song wird beim Einschalten von Auto nicht automatisch umgestellt.
- Manuelle V649-/V650- oder Touch-Schnellleisten-Änderungen verhindern nachfolgende V651-Anwendungen für den Song. Letzte automatische/manuelle V651-Anwendung kann für denselben Song selektiv rückgängig gemacht werden; bei neuem Track wird Undo nicht auf fremden Song angewendet.
- Für automatische Anwendung ausschließlich die vorhandene V649-Whitelist und V650-Validator verwendet. Keine Spotify-Steuerung, Token-, Audio-, GLB-, Sänger-, Visem- oder handautorisierten Timeline-Daten verändert. Kein weiterer R3F-Frame-Loop oder WebGL-Objekt.

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v651` | PASS: 108 Gruppen, 12.000 synthetische Genre-/Songzustände |
| `npm run test:v651:types` | PASS: gezielter TypeScript-Kerntest |
| `npm run test:v650` / `test:v649` | PASS: Profil- und Steuerzentrale-Vorgänger |
| `npm run test:smoke:v651` | PASS: vollständige rekursive V651→V650→V649→V648→V647→ältere Kette |
| `npm run verify:v651` | PASS: erweiterte Verifikation einschließlich Bühnen-/Konzertregressionen |
| `npm run test:v558`, `v568`, `v571`, `v580` | PASS: ältere Build-Vertrags- und Produktionsvorbereitungsprüfungen |
| `npm run check:syntax` | PASS: 883 TS/TSX-Dateien |
| `npm run check:architecture` | PASS: versionierte Architektur und referenzierte Quellen |
| `npm run build --ignore-scripts` | **NICHT ausführbar:** `next: not found`, kein `node_modules` |
| Voller `npx tsc --noEmit` | Nicht ausgeführt: React/Next/Three-Typen sind nicht installiert |
| Live-Browser/10-Zoll-Gerät, realer Last.fm-Genre-Flow | Nicht durchgeführt, keine echte automatisierte GUI-/GLB-Prüfung |

## Lokal validieren

```powershell
npm install
npm run test:smoke:v651
npm run verify:v651
npx tsc --noEmit
npm run build
npm run dev
```

Anschließend mit realer Wiedergabe die Track-/Artist-Schwellen und Fehlerfälle prüfen, Kiosk zwischen Vorschlag/Automatik/Off umschalten, unmittelbar vor automatischem Wechsel manuell eine Ansicht ändern, Undo auslösen und mindestens zwei Songs nacheinander abspielen. Erstmals bei einem Song eingeschaltete Automatik greift bewusst erst beim nächsten Song. Echte visuelle Übergänge und Hardwareleistung können nur im Browser gemessen werden.
