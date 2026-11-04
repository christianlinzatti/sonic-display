# V635 – Dynamic Concert Stages

## Umsetzung

- `components/visualizer/dynamicConcertStagesV635.ts`: deterministischer V604/V622-Bühnenplan. Verse erhalten dezente LED-Streifen; Hooks ein Pixelgrid oder ein alternatives Motiv, Builds Diagonalen, bestätigte Drops ein dezentes radial wirkendes Muster. Wiederholte Hooks differieren über `repetition`.
- `components/visualizer/DynamicStage.tsx`: genau eine vorbereitete Plane hinter den Performern (6,2 × 3,35 Einheiten, z = -3,8), ein eigener kleiner Shader mit Pixelraster, ohne Texturen oder Post-Processing. Uniforms aus dem vorhandenen Stage-Framecallback, kein neuer Timer/Framecallback.
- Stimmung: kleine Zusatzwerte für die bereits vorhandene Hintergrund- und Bodenfarbe. `ConcertAtmosphereRendererV308` dämpft nach Möglichkeit ausschließlich seine selbst angelegte Nebelschicht.
- Validierung: exakter Track, Dauer, Abschnitt, Akt, Kapitel, Motiv, Wiederholungsindex und Cuequelle. Pausen, manuell gesteuertes Licht, reduzierter Bewegungsmodus, Blackout, Low-Tier, fehlende/ungültige Daten bewirken einen neutralen Plan. Die LED-Blende sinkt an echten Segmentgrenzen auf null.
- Bei schutzbedürftigen Lyrics, Sänger-Nahaufnahmen, vier Tänzern und Balanced-Tier sind die zusätzlichen Effekte nochmals begrenzt.

## Grenzen

Die Stage-Variation verwendet vorhandene V604-Songabschnitte; ohne Bestätigung findet keine neue musikalische Erkennung statt. Die LED-Wand ist eine visuelle Bühnenfläche, keine echte Steuerung physischer LEDs; keine separaten Gobos, keine neuen Stage-Assets. Der volle Next.js-Build und die Bildqualität mit echten GLB-Avataren und auf einem 10-Zoll-Display müssen noch lokal getestet werden.
