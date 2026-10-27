# Sonic Display V504 – Natural Multi-Avatar Stage Interaction

## Umsetzung

V504 verbindet den vorhandenen V500-Sängerregisseur mit einer kleinen, **rein funktionalen** Interaktionsschicht: `components/visualizer/naturalMultiAvatarStageInteractionV504.ts`. Sie wird in den echten Duo- und 3-/4-Personen-Renderwegen nach V500 aufgerufen:

- `components/visualizer/DanceFormationActorsV492.tsx`
- `components/visualizer/GroupDancersV326SceneV492.tsx`

Das Ergebnis sind zusätzliche, **sehr zurückhaltende** V144-Blicke und V145-Gesten. Alle Werte laufen durch die vorhandenen begrenzenden `combineCrewLooksV452` / `combineCrewGesturesV452`. Die Funktion verwendet keine neuen WebGL-Mixer, Hooks, `useFrame`-Durchläufe, Worker, Cloud-Dienste, IK-, Fuß-, Hand- oder Root-Manipulationen. Sie verändert keine vorhandenen Avatar-Animationen und überschreibt keine Lip-Sync-Morphs.

## Verhalten

| Bereits ausdrücklich zugewiesene Situation | Neue visuelle Interaktion |
|---|---|
| Solo | Lead bleibt publikumsorientiert; Zuhörer reagieren zeitversetzt mit kurzen Blicken und zurückhaltenden Schulter-/Armgesten |
| Call-and-Response | Nur der tatsächlich markierte ausgehende Sänger bestätigt den neuen Lead kurz nach dem Wechsel |
| Duett | Kurz alternierende Blickkontakte, statt dauerndem gegenseitigem Anstarren; beide Sänger bleiben überwiegend zum Publikum ausgerichtet |
| Hook | Kleine gemeinsame Akzente ohne gegenseitiges Wegdrehen; jeder Avatar blickt zur Bühne/zum Publikum |

Ein 2,65-Sekunden-Phrasenraster sorgt für gesammelte Reaktionen anstatt zusätzlicher Gesten auf jedem schnellen Rapwort. Gesten starten und enden mit 380- und 320-ms-Hüllkurven. Zielavatare, die weniger als 0,75 oder mehr als 7 Bühneneinheiten entfernt sind, werden nicht per Blick verfolgt. Qualitätsstufen: `high` 100 %, `balanced` 58 %, `low` 22 % der **zusätzlichen** V504-Schicht.

## Schutzvorrang und begrenzte Evidenz

Der **trackgebundene, aktive V500-Plan** ist zwingende Voraussetzung. V504 aktiviert keine neue automatische Sänger-/Stimmenerkennung, rät nicht anhand von Genius-Mitwirkenden, Lyrics-Zeilen oder Audioenergie, wer gerade rappt, und leitet keine Phoneme oder Voice-Timestamps ab. Ohne V416-/V496-Zuordnung bleibt V504 neutral. Manuelle V385-Sängerrollen, manuelle V326-Aufstellungen, gespeicherte Choreografien, Pausen, falscher Spotify-Track und `reducedMotion` unterdrücken den Effekt. Existing V475 visual-only stage interaction remains independent and does not supply singer identities.

V504 ist eine *additive* Bühnenintention; gespeicherte GLB-/FBX-Motions und die bestehenden Hände-/Fuß-Kontaktregeln haben Vorrang. Der visuelle Eindruck muss mit echten importierten Avataren auf dem Zielgerät überprüft werden.

## Tests

```powershell
npm run test:v504
npm run test:v504:types
npm run test:v503
npm run test:v500
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Die V504-Regression prüft Solo, Duett, Reply und Hook für 2/3/4 Avatare, korrekte Priorität nach V500, Zeit-/Track-Sperren, manuelle Priorität, Qualitätsstufen, identische Ergebnisse bei Seek/Replay, Obergrenzen sowie 24.000 deterministische Simulationsschritte. Die isolierte TypeScript-Kernprüfung kann ohne installierte Next.js-Abhängigkeiten laufen. Eine echte Produktiv-Build-Prüfung erfordert die Installation dieser Abhängigkeiten.
