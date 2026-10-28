# V621 – Advanced Stage Lighting Director

## Umsetzung

- Ein neuer, zustandsloser Licht-Regieplaner `advancedStageLightingV621.ts` verwendet bestehende, bestätigte V604/V600-Akte und denselben Live-Playback-Stand wie die aktuelle Kamera. Keine unabhängige Songstrukturerkennung, keine erfundenen Performer.
- `DynamicStage.tsx`: dezente zusätzliche Regie für **vorhandene** Key/Fill/Beam/Sweep-Lampen. Bereits bestehende Face-Floors, manuelle Timelines und Blackouts wirken weiter.
- `ConcertAtmosphereRendererV308.tsx`: dieselben bestätigten V621-Akzente für zwei vorhandene Moving Spots, Haze-Materialien und ihre Schwenks.
- `ConcertDetailStageV555.tsx`: dieselbe Lichtregie für die **vorhandene** Gobo-Projektion, LED-Pixelwand, Bodennebel und Hook-Projektionen, nachdem die V602-Pi-Qualitätsbremse angewendet wurde. Die gemeinsame Effektstärke von Gobo, LED und Projektion überschreitet die bereits erteilte Freigabe nicht.
- Genre-Einordnung dient nur zur abgestuften Stärke bestätigter Beats und Drops. Keine Strobes, keine neuen Laser- oder volumetrischen Nebeleffekte.

## Schutzregeln

Ohne bestätigten Songakt, bei falschem Track, außerhalb des Aktfensters, nach einem Seek in nicht bestätigte Abschnitte, bei Pause, abgeschalteter Reaktivität, manuellem Licht, Blackout, reduziertem Bewegungsmodus oder Low-Tier liefert die Zusatzregie einen neutralen Plan. Schnelle Lyrics und Sängerfokus reduzieren Nebel, Beams, LED/Gobo und Schwenks. Bestehende Farben, Keyframes, Schriften, Karaoke-Timestamps, Tänzer und Sängerrollen werden nicht verändert.

## Tests lokal

```powershell
npm run test:v621
npm run test:v621:types
npm run test:smoke:v621
npm run verify:v621
npx tsc --noEmit
npm run build
```

**Achtung:** Syntax-, Struktur- und Simulationstests beweisen keine reale visuelle Qualität der Bühne. Vor dem Release mit deinen GLB-Avataren mindestens einen kompletten Deutschrap-, Hardstyle- und Hardtekk-Song im Browser prüfen. Hardware-Benchmarks erst anhand der vorhandenen PC-Hardware auswerten.
