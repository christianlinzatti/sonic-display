# Sonic Display V483 – Natural Dance Interaction 3.0

**Basis:** vollständiges Sonic Display V482. **Schwerpunkt:** natürliche Gruppenreaktionen zu den Hock-/Low-Bounce-Posen, nicht neue Audio- oder Sprechererkennung.

## Neue Funktionen

- **Gegenseitiges Anschauen:** Hockende Tänzer wenden Kopf und Blick leicht ihrem benachbarten Bühnenpartner zu. Wenn dieser nicht in einer tiefen Pose ist, wird der auf der Bühne sichtbare Lead vorsichtig berücksichtigt. Realistische Blickwinkel sind begrenzt, sodass Avatare dem Publikum nicht völlig den Rücken zudrehen.
- **Rap-Interaktion:** Links und rechts leicht unterschiedliche, kurze Schulter-, Arm- und Oberkörperakzente. Die Basisgesten aus V475/V452/V458 werden nur additiv und durch die vorhandenen Sicherheits-Clamps ergänzt.
- **Versetztes Aufrichten:** Beim Ende einer automatischen tiefen Gruppenpose kann eine kurzfristige, maximal 240-ms-lange versetzte Freigabe den gemeinsamen Aufstieg abwechslungsreicher machen. Ein neuer Bühnenplan erhält Vorrang und beachtet das normale Limit. Ein bereits von V481 ausdrücklich erlaubter Vierer-Drop darf seinen maximal 240 ms langen Ausstieg auch dann gestaffelt vollenden, wenn das normale Limit auf zwei steht. V482 bleibt für das eigentliche sanfte Aufrichten zuständig.
- **Gemeinsame Drops:** Die zeitgleiche Entscheidung über den Drop bleibt bei der V481-Policy. V483 verändert nicht den musikalischen Einsatz, sondern die anschließende visuelle Gruppenreaktion.
- **Leistung:** Ein Zustand aus vier festen Slots wird innerhalb des vorhandenen V326-Render-Zyklus aktualisiert; keine zweite Audioanalyse, kein zusätzlicher Timer, kein neuer GLB-Mixer und keine neuen GPU-Lichtquellen.

## Implementierte Schnittstellen

- `components/visualizer/naturalLowPoseInteractionV483.ts`: `newLowInteractionStateV483()`, `stepLowInteractionV483()`; nimmt die frische Low-Pose-Planung aus V481 und Bühnenpositionen entgegen. Die Rückgabe enthält eine nur für den aktuellen Frame gültige Pose plus sanfte Blick-/Gestencues.
- `components/visualizer/ThreeAvatar.tsx`: V483-Akzente folgen auf V475/V458 und laufen über `combineCrewLooksV452`/`combineCrewGesturesV452` in die vorhandenen Partner-Overlays. Die Low-Pose-Kontexte bleiben stabil; V482 glättet weiterhin die Becken-/Kniebewegung und GLB-Clipwechsel.
- **Keine Einstellungs-Migration:** Die V481-Schalter in `components/visualizer/LowPoseControlsV481.tsx` steuern weiter die Intensität und die Maximalzahl. V483 wirkt nur in automatisch geplanten Gruppen.

## Sicherheits- und Daten-Grenzen

Manuelle Kamera-/Choreografie-/Sängerzuordnungen, Pause, Lyrics-Vordergrund, Trackwechsel und `reducedMotion` unterbrechen die zusätzliche Gruppeninteraktion. Authentifizierte Lyrics oder Feature-Credits sind **keine** verifizierten singer-to-timestamp-Daten. Eine passende GLB-Hock-/Knieanimation ist weiterhin Voraussetzung: V483 erfindet weder neue GLB-Skelettbewegungen noch löst es Bodenkollision oder Avatar-zu-Avatar-Kollision. Echte Kamera-, Foot-IK- und Performance-Qualität erfordert visuelle Prüfung im Browser und auf dem Raspberry Pi.

## Tests

```powershell
npm run test:v483
npm run test:v483:types
npm run test:v482
npm run test:v481
npm run check:architecture
npm run check:syntax
npm run build
```

Der V483-Test kontrolliert Blickwinkel, Gestengrenzen, versetztes Aufrichten, manuelle Vorrangregeln, Pause, Seek, Trackwechsel und eine simulierte 30-Minuten-Wiedergabe. Die vollständige Next.js-Produktionsprüfung benötigt installierte npm-Abhängigkeiten.
