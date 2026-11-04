# V636 – Professional Lighting Show

Die bestehende Lichtshow wurde erweitert, ohne einen weiteren Renderer, Timer, Schatten oder GLB-Assets einzubauen.

- `professionalLightingShowV636.ts`: pure, deterministische, V600/V604-belegte Lichtregie. Ohne bestätigten aktuellen Abschnitt, bei Pause, Blackout, manuellem Licht oder Low-Tier neutral.
- `ConcertAtmosphereRendererV308.tsx`: die bereits vorhandenen zwei Spots und Lichtkegel folgen einer sanften, begrenzten Intensitäts- und Zielvariation. Bestätigte Vocal-Ziele behalten Vorrang.
- `ConcertDetailStageV555.tsx`: vorhandene Boden-Gobo-Shader erhalten vorsichtige Motivvariation (Linien, Raster, Ringe). Die V556/V601/V602/V621-Allokation bleibt bindend, sodass kein neues GPU-Licht oder zusätzlicher Draw-Call entsteht.
- Genre: bei Hardstyle/Hardtekk werden hörbare Kick-Akzente etwas stärker berücksichtigt, Deutschrap schützt Sänger-Nahaufnahmen und lesbare Lyrics. Drop ohne hörbare Kick bleibt zurückhaltend. Wiederholte Hooks variieren das Gobo-Motiv.
- Durch Songabschnitts-Randfenster werden neue Lichtmotive bei Wechseln weich zurückgenommen.

**Grenzen:** Neue Steuerung nutzt vorhandene WebGL-Spots und virtuelle Gobo-Projektionen. Kein DMX, keine echten Moving-Head-Scheinwerfer, keine Phonem-Erkennung. Browser-Aufnahmen mit realen GLB-Avataren und vollständiger Produktionsbuild müssen separat geprüft werden.
