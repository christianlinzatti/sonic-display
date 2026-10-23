# Sonic Display V208 – Advanced Music Structure Detection 2.0

Baut auf V207 auf. Die bisherige konservative V194-Drop-Prognose bleibt erhalten; eine neue zeitlich geglättete Interpretation erzeugt die vier Zustände `verse`, `build`, `drop`, `break`.

## Änderungen
- Separate, deterministische Zustandsmaschine in `components/visualizer/advancedMusicStructureV208.ts`.
- Exponentiell geglättete Energie-, Kick- und Basswerte und Mindestzeiten für Eintritt und Verlassen von Break.
- Drop-Onsets stammen weiterhin aus dem bewährten V194-Predictor; es wird kein unbeobachteter Songablauf vorausberechnet.
- Konfidenz und Gründe im Live Music Structure Timeline Director (V208) einsehbar.
- Break wird für ältere Drei-Phasen-Choreografien (`verse/build/drop`) auf `verse` abgebildet, um vorhandene Einstellungen nicht zu beschädigen.
- Pausen setzen die Analyse zurück. Kein Speichern oder Übertragen von Audiorohdaten.

## Grenzen
Keine Spotify-Waveform-API, keine Kenntnis künftiger Songabschnitte, keine samplegenaue Beat-Synchronisation. Breaks sind heuristische Schätzungen; Drop-/Build-Erkennung bleibt von verfügbarer Signalqualität abhängig. Die Tests decken Zustandsmaschinen- und Quelltextintegration ab, kein echtes GLB-/Browser-Playback. Ohne installierte npm-Abhängigkeiten ist der Next-Produktions-Build offen.

## Tests
`npm run test:structure-v208`; bestehende `npm run test:structure-timeline` und `npm run test:drop-prediction`.
