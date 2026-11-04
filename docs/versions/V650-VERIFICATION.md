# V650 – Prüfbericht (28.10.2026)

## Implementierung

- Basis: vollständiges V649-Projekt; Touch-Steuerzentrale um den Tab **„Profile“** erweitert.
- 6 validierte Werksprofile: Deutschrap, Hardtekk, Hardstyle, Rock, Pop und 10-Zoll-Lyrics.
- Bis zu 12 lokale eigene Profile; explizite V649-Steuerfeld-Allowlist, V648-Kioskansicht und Lesbarkeit sowie optional V388-Displayleistungsprofil. Versionierter JSON-Import/-Export, 64-KiB-Dateigrenze, Namens-/ID-Kollisionsschutz, kein automatisches Überschreiben. Eigene Profile benötigen zum Löschen zwei Betätigungen.
- Anwendung nutzt einen einzigen bestehenden `updatePreferences`-Patch plus bestehende Kiosk-/Display-Setter. „Letzte Änderung zurück“ stellt selektiv den vorherigen Zustand wieder her. Unzulässige oder unbekannte Felder können nicht aus dem Profil in die UI-Preferences gelangen.
- Keine Spotify-Audiomanipulation, Token-/Audio-/GLB-Exporte, keine manuellen Sänger-/Visem-/Kamera-/Show-Timelines im Profil, kein neuer Three.js-Loop und keine neuen Render-Pässe.
- Neue Dateien: `components/concertPresetsV650.ts`, `components/ConcertPresetManagerV650.tsx`, `tests/v650-smart-concert-presets-regression.cjs`, `tests/tsconfig.v650-core.json`, Dokumentation und Prüfbericht. Angepasst: V649-Steuerpanel, TouchKioskControls, CSS, README, ARCHITECTURE, package.json, überholte Versionsannahmen im V649-Regressionstest.

## Prüfungen – ausgeführt

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v650` | PASS – 120 Regressionstest-Gruppen und 12.000 synthetische Profiloperationen |
| `npm run test:v650:types` | PASS – separater TypeScript-Kerntest mit V649-Testtypdeklaration |
| `npm run test:v649` | PASS – 126 Regressionstest-Gruppen für V649 |
| `npm run test:smoke:v650` | PASS – gesamte rekursive V650→V649→V648→V647→ältere Smoke-Kette, Syntax, Architektur |
| `npm run verify:v650` | PASS – erweiterte Regressionstests inklusive V646/V635/V388, Syntax, Architektur |
| `npm run test:v558`, `test:v568`, `test:v571`, `test:v580` | PASS – historische Build-Vertrags-/UI-Tests |
| `npm run check:syntax` | PASS – 881 TS-/TSX-Dateien |
| `npm run check:architecture` | PASS – 532 aktuelle Codeverweise, 10 Abschnitte |
| `npm run build` | NICHT erfolgreich – alle vorgeschalteten Prüfungen PASS, aber `next: not found` (Exit 127: Projektabhängigkeiten nicht installiert) |
| `npx tsc --noEmit` | Nicht vollständig ausgeführt, da Next/React/Three-Typen nicht installiert sind |
| Echte Touch-/GLB-Darstellung und physisches 10-Zoll-Display | Nicht ausgeführt; keine Aussagen über echte FPS oder Bedienergonomie auf Zielhardware |

## Grenzen

Es gibt **keine automatische Genre-Erkennung durch V650**: Die sechs Vorlagen werden explizit manuell gewählt. Das eigens gespeicherte V388-Displayprofil übernimmt nur die bestehende Auswahl (off/auto/eco/sharp) und ist **keine Messung oder Garantie der Hardwareleistung**. Das Ändern vorhandener Shader-/Bühnen- und Lichtoptionen kann WebGL-Rekonfiguration auslösen; ein ruckelfreier Live-Wechsel ist nicht nachgewiesen. Profile liegen nur auf der Browser-Origin und können bei Browserdaten-Löschung verloren gehen; deshalb gibt es einen JSON-Export.

## Windows-Check

```powershell
npm install
npm run test:v650
npm run test:smoke:v650
npm run verify:v650
npx tsc --noEmit
npm run build
npm run dev
```

Danach `Touchmodus → Steuerzentrale → Profile` öffnen, alle sechs Werkspresets und Undo testen; eigenes Profil mit Energiespar-Displayprofil speichern, wieder anwenden und zurücknehmen. JSON importieren/exportieren, Dopplungen und Löschen testen. Browsergrößen 1024×600 und 1280×800 sowie eine reale GLB-Konzertshow manuell prüfen.
