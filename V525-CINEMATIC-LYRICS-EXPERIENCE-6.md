# V525 – Cinematic Lyrics Experience 6.0

## Ziel

Die aktive Lyrics-Zeile auf dem etwa 10-Zoll großen Raspberry-Pi-Display **besser lesbar** machen, ohne Wort-Timestamps, Sängerrollen oder manuell festgelegte Bühnenpositionen zu verändern. Ein Deutschrap-Lauf soll bei dicht gesetzten echten Wortgrenzen nicht mit unnötigen Wortsprüngen vom Songtext ablenken.

## Umsetzung

- `components/visualizer/cinematicLyricsExperienceV525.ts`: pure, reproduzierbare und streng begrenzte Lesbarkeitsplanung auf Basis des V501-Layouts und der V477-Verifizierung. Die Genreheuristik erkennt Deutschrap/Rap, aber **nur verifizierte Wort-Zeitstempel** dürfen für die Erkennung dichter Wortfolgen herangezogen werden. Ein kurzer Median-Abstand beschreibt die **Dichte der vorhandenen Zeitmarken**, keine Phonem- oder Sängererkennung.
- `components/KineticLyrics.tsx`: kleiner Schriftgrößen-Ausgleich in dicht besetzten 3-/4-Avatar-Bühnen bei nicht überlangen Zeilen, kontrastreichere Textplatte und reduzierte V382-/V501-Wortbewegungen für schnelle Deutschrap-Zeitmarken. **Karaoke-Füllung bleibt an realen Zeitmarken verankert** und wird nicht verändert. Andere Zeilen und Nutzer-Lyrics-Schriftgröße/-Position bleiben erhalten.
- `components/visualizer/Lyrics3DScene.tsx`: dieselbe V525-Lesbarkeitsplanung, mit V501-beschränkter 3D-Textbreite; bei schnell getaktetem Rap werden nur zusätzliche Bewegungsskalierungen begrenzt, nicht die vorhandene Text-/Zeitsynchronität. Das User-Spatial-Layout, Composition-Cues, Kameras und Avatare bleiben unverändert.
- `app/globals.css`: lokale Lesbarkeits-/Kontrastregeln für die aktive Zeile und einen vorsichtig breiteren seitlichen Bühnenbereich auf 761–1100px breiten Displays. Der mittlere Avatarbereich bleibt als Reserve freigehalten; auf schmalen Viewports bleibt das bisherige Vollbreiten-Overlay erhalten. Reduced-Motion lässt zusätzliche Animationen entfallen.

## Grenzen

Es gibt **keine** gemessenen Gesichts-/Körperboundingboxes, sodass eine nicht überlappende Platzierung relativ zu jedem beliebigen Kamerawinkel nicht garantiert ist. Es gibt keine neuen Wörter-, Silben-, Audio- oder Sprecher-Timestamps; ohne verifizierte Wörter verbleibt die vorherige Zeilenanzeige. Keine neue WebGL-Schleife, kein Timer, keine npm-Abhängigkeit, keine importierten GLB-Motions oder IK-Änderung.

## Verifikation

`npm run test:v525`, `npm run test:v525:types`, `npm run check:syntax`, `npm run check:architecture`. Kompletter lokaler Produktionsbuild: `npm install && npm run build`. Auf einem echten 10-Zoll-Pi sind Deutschrap-Wortlesbarkeit, Stage-Überdeckung, echte Morph-Target-Aktivität und FPS weiterhin visuell zu prüfen; Testsimulationen ersetzen diese Prüfung nicht.
