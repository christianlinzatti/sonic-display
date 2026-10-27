# V546 – Advanced Deutschrap Lip-Sync 4.0

## Neue Funktionen

- Ein zusätzlicher, stateless V546-Pass verfeinert das bereits von V538 ermittelte Gesicht sowohl am GLB-Facial-Rig als auch am prozeduralen Avatar.
- **B/P/M:** Der buchstabierte Wortanfang kann einen sehr kurzen ergänzenden Mundverschluss erhalten. Bereits stärkere V384/V415-Verschlüsse werden weder gelockert noch überschrieben.
- **Wort-zu-Wort-Übergang:** Nur wenn die *vorhandenen* Wort-Zeitstempel maximal 90 ms auseinanderliegen, kann das folgende Vokalbild unmittelbar am Ende des aktuellen Worts vorsichtig angedeutet werden. Vor einem geschriebenen B/P/M erfolgt kein Vorgriff.
- **Satzzeichen:** Dezente Wangen- und Augenbrauenbetonung beim bereits aktiven Wort; ohne zusätzliche Sprecher- oder Audio-Interpretation.
- Ausgeschaltet bei Pause, fehlendem Lyrics-Wort, unsynchronisierten Lyrics, nicht berechtigtem Sänger, reduzierter Bewegung, manuell editiertem Wort, priorisierter Vorschau oder aktivem V423-Audio-Mundprofil.
- Kein Editieren importierter GLB-Animationen, keine zusätzlichen Render-Loops, Kameras, AnimationMixer oder GPU-Effekte.

## Technische Prüfung

`npm run test:v546`

`npm run test:v546:types`

`npm run verify:v546`

Ein vollständiger Produktionsbuild erfordert ein installiertes Projekt-`node_modules`; Live-WebGL, realer Lip-Sync und Raspberry-Pi-Performance müssen separat sichtbar beurteilt werden. Der V546-Pass ist eine **textbasierte visuelle Annäherung, kein tatsächliches Audio-Phonem-Alignment und keine automatische Erkennung, wann ein Feature-Rapper singt**.
