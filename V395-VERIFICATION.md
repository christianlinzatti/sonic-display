# V395 – Verifikationsprotokoll

Stand: 19. Oktober 2026.

- `npm run test:v395`: PASS, deterministische Wiederherstellungszustände und Integration.
- `npm run check:syntax`: PASS, 530 TypeScript-/TSX-Dateien syntaktisch geprüft.
- Gesamte `verify:offline`-Befehlsliste: **137 / 137 PASS**, darunter V394, V393, V392, V389, V388, V387 und die älteren Regressionen. Prüfungen wurden als einzelne Node-Skripte parallel ausgeführt, nicht als vollständiger serieller `npm run verify:offline`-Befehl.
- `npm run build:preflight`: Voraussetzungen nicht vorhanden: 16/17 erforderliche npm-Abhängigkeiten fehlen und `package-lock.json` fehlt. Daher wurden TypeScript-Semantik-Check, `next build` und ein Browser-End-to-End-Test nicht erfolgreich ausgeführt; keine Behauptung über Produktions-Build-Erfolg.
- Keine automatisierten realen 24-Stunden-Hardware-/Browser-Soak-Tests.
- Archive: CRC-Test und Vollständigkeitsvergleich mit V394 zum Releasezeitpunkt.

## Lokale vollständige Prüfung

```bash
npm install
npm run verify
```

## Manuelle 10-Zoll-Gerätetests

- Touchmodus an/aus: Wake Lock muss sauber freigegeben werden; ohne Browserunterstützung keine Fehler beim Start.
- WebGL-Verlust: ursprüngliche Browser-Wiederherstellung abwarten; wenn nötig begrenzte Neuinitialisierung; nach drei Fehlern 2D-Fallback und manueller Knopf.
- Tab ausblenden: keine neuen automatischen Versuche, Screen Wake Lock freigeben. Nach Rückkehr sichtbares Display testen.
- Spotify pausieren, Track wechseln, längere Lyrics-Anzeige: keine unnötigen GPU-Neustarts.
- Mindestens einige Stunden Laufzeit mit 1–4 Avataren auf dem echten Zielgerät prüfen. Diagnoseexport auf sensible Browser-/Gerätedaten überprüfen, bevor der Bericht geteilt wird.
