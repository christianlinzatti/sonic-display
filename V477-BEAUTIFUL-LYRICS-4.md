# V477 – Beautiful Lyrics 4.0

## Änderungen

- Pure Planner `components/visualizer/beautifulLyricsV477.ts` für lesbare Typografie auf Basis von V455/V461, Kontrast und die Anzeige bei 1–4 Avataren.
- Nur tatsächlich vorhandene und validierte Wortzeitmarken treiben einzelne Karaoke-Wörter an. Fehlende oder ungültige Wortmarken erhalten **nur einen kontinuierlichen Zeilenfortschritt**, keinen künstlichen Wort-Timestamp.
- Immersive Bühne: Schriftgrößenanpassung bei dichten Rap-Passagen, Reduktion auf die aktive Zeile bei knapper Fläche, stabilere Anzeige.
- 3D-R3F-Text: integrierte Cast-Belegung, kleinere Wortmesh-Obergrenze mit echtem Timing und vorhandenen Performance-Tiers; keine zusätzlichen GPU-Lichter.
- Zurückspulen/Seek berechnet den Fortschritt direkt aus der Wiedergabezeit, ohne Timer oder Drift. Bei Pause bleibt die Anzeige stabil; Reduced Motion deaktiviert Einflugeffekte.
- Alle bisherigen Lyrics-Stile, Farben und manuellen Benutzereinstellungen bleiben verfügbar.

## Grenzen

Keine erfundenen Phoneme, Sprecherwechsel, Instrument-Erkennung oder Spotify-internen Timing-Daten. Wortkaraoke ist nur mit tatsächlich vorliegenden Zeitstempeln möglich. Aus dem Fortschritt einer Zeile wird **keine exakte Position einzelner Wörter** abgeleitet. Keine Veränderungen an den Audio- und Multi-Avatar-Sängerrollen.

## Tests

```powershell
npm run test:v477
npm run test:v477:types
npm run check:architecture
npm run build
```

Ein vollständiger Next.js-Produktionsbuild benötigt lokale npm-Abhängigkeiten und muss auf dem Zielsystem bestätigt werden.
