# V199 – Beat-Perfect Motion Sequencer

Aufbauend auf V198: Audio-Tempo wird in einen pause-sicheren integrierten Beat-Transport umgerechnet. Anstelle einer bei Pausen fortlaufenden Wall-Clock verankert die Sequenz-Auswahl ihre Schritte in abgeschlossenen musikalischen Takten. So bleibt eine Sequenz beim Pausieren stehen; Änderungen der BPM erzeugen keinen plötzlichen Sprung im Sequenzfortschritt. Phasenwechsel setzen die lokale Beat-Zählung zurück.

## Grenzen
Das interne Taktraster ist eine Integration des verfügbaren BPM-Schätzwerts, **keine samplegenaue Spotify-Beatposition**. Song-Seeks / externe Playback-Sprünge können ohne echte Positionsmetadaten nicht zuverlässig rekonstruiert werden. Die bestehende V193-Kick/Crossfade-Steuerung bleibt aktiv; eine Beat-Erkennung aus echtem Audiosignal kann ungenau sein.

## Tests
`npm run test:beat-perfect` und `npm run check:syntax`; vollständiger Build erfordert npm-Abhängigkeiten.
