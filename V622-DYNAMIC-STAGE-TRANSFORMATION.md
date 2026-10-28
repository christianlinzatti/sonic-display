# V622 – Dynamic Stage Transformation

## Umsetzung

- Ein neuer rein deterministischer Mood-Planner `components/visualizer/dynamicStageTransformationV622.ts` liest **ausschließlich** bestätigte V604-Akte mit echter Track-ID, Songdauer, Songposition und Live-Songabschnitt. Der Plan liefert nur geringe, farbliche Änderungsfaktoren für vorhandene Material-/Nebelparameter.
- `DynamicStage.tsx`: Bestehender Szenenhintergrund, Bühnenboden und bereits vorhandene Scheinwerferfarben morphen bei bestätigten Verse-, Build-, Hook-, Break- und Drop-Abschnitten. Theme-Auswahl, Bühne und Avatare werden **nicht** gewechselt.
- `ConcertAtmosphereRendererV308.tsx`: Die beiden vorhandenen Beam-/Haze-Farben und die ausschließlich von V308 erzeugte `scene.fog`-Instanz folgen derselben Grundstimmung.
- `ConcertDetailStageV555.tsx`: LED-Wand, Gobo- und Bodennebel-Shader erhalten lediglich eine mitlaufende RGB-Tönung über vorhandene Shader-Uniforms. Die V602/V621-Effektbudgets und ihre Reihenfolge bleiben erhalten. Keine neuen Lichtquellen, Strobes, GLB-, Mesh- oder Renderloops.
- An echten, angrenzenden Aktgrenzen werden die Farbstimmungen **auf beiden Seiten** kontinuierlich ineinander übergeblendet. Wiederholte Hooks erhalten unterschiedliche Farbtöne; Hardtekk/Hardstyle und Rock berücksichtigen passende Genre-Schwerpunkte.

## Sicherheitsgrenzen

- Ohne bestätigten Act, nach Trackwechseln, Seek in unbelegte Songabschnitte, bei Pausen, deaktivierter Reaktivität, reduzierter Bewegung, geringer Renderqualität, manueller Lichtregie und Blackouts werden nur die bestehenden Theme-Grundwerte angefahren.
- Lyrics-Fokus und Sängerportraits schwächen die Bühnenveränderung ab; keine neuen Singer-Cues, Lyrics oder Kamerafahrten.
- Die V622-Palette wirkt nur sehr dezent auf bereits vorhandene Farben, damit festgelegte Bühnenfarben stabil bleiben. Benutzerseitig gespeicherte Farb-Keyframes werden nicht überschrieben.

## Lokal testen

```powershell
npm run test:v622
npm run test:v622:types
npm run test:smoke:v622
npm run verify:v622
npx tsc --noEmit
npm run build
```

Die realistische Bildqualität und Framerate sind erst nach einem vollständigen Browser-/GLB-Test nachgewiesen.
