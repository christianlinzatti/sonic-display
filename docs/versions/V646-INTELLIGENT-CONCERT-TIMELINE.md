# V646 – Intelligent Concert Timeline

## Neu

Der kleine Schalter **Regie-Zeitplan** erscheint links unten bei laufender Avatar-Bühne. Die Ansicht ist standardmäßig geschlossen, kann per Tastatur geöffnet und geschlossen werden und zeigt die Songposition in sechs Zeitspuren:

1. bestätigte bzw. geprüfte **Songstruktur** (nur V318 → V600 → V604, ohne erfundene Hooks oder Drops),
2. **Kameramotif als Regievorschlag**, ausdrücklich *nicht* als tatsächlich ausgeführter Kameraschnitt,
3. **Ensembleformation als Vorschlag**, nicht als aktueller Fußkontakt-/Positionsnachweis,
4. **Licht-/Dramaturgiemotiv als Vorschlag**, keine tatsächlichen Scheinwerferwerte,
5. **Sänger aus manuellen Zeitmarken** (nur bei eingeschalteten V496-/V547-Zuweisungen, 1–4 Slots),
6. **aktive manuelle V354-Clips** aus Dance/Kamera/Licht/Effekte/Fotos/Lyrics.

Manuelle Cues werden in einer separaten Spur angezeigt und bleiben bei Konflikten maßgeblich. Nicht analysierte Lücken erscheinen als solche, auch wenn manuelle Spuren vorliegen. Die aktuelle Szene wird nur dann als live bestätigt beschrieben, wenn der V600-Cue denselben Song und denselben Act bestätigt. Play/Pause und Songwechsel ändern keine externen Abläufe.

## Technische Umsetzung

- `components/visualizer/intelligentConcertTimelineV646.ts`: begrenzter, deterministischer, reiner Planer; bis zu 160 Musikacts, 400 manuelle Clips, 120 autorisierte Vocal-Segmente, maximal 1800 Anzeigeelemente. Prüft Song-ID, Duration, Abschnittsgrenzen und 1:1 V600/V604-Actidentität.
- `components/visualizer/ConcertTimelineOverlayV646.tsx`: standardmäßig geschlossener **Read-only**-Overlay, HTML-/CSS-DOM-Spuren und JSON-Export. Lauscht dem vorhandenen V354-Aktualisierungsevent. Kein `useFrame`, kein eigener Renderloop, keine GPU-Objekte, keine Audio-/Spotify-Anfragen und kein Timeline-Writer.
- `components/visualizer/VisualizerStage.tsx`: bindet geprüften Arc, NarrativePlan, Live-Cue, Wiedergabezeit, Avataranzahl und ausdrücklich editierte Sängersegmente direkt ein.

## Grenzen

- Die Timeline ist eine **Planansicht**, kein Tracking realer Kamera-/Scheinwerferbewegungen. Zur visuellen Bestätigung weiterhin V641 QA und reale Browser-/GLB-Aufnahmen verwenden.
- Die Sänger-Spur ist nicht diarisiert; sie zeigt nur eigene editorische Zuweisungen. Aus Song-Metadaten oder Credits wird keine Sängerzeit erfunden.
- Automatische Dramaturgie-Akte sind nur sichtbar, wenn eine validierte, hinreichend sichere Trackanalyse vorliegt. Unvollständige Daten werden nicht vervollständigt.
- JSON enthält Metadaten und Song-ID, **keine Audioinhalte oder Lyrics-Texte**. Datei nur lokal, kein Netztransfer. Ein JSON-Export ist kein visualisierter Qualitätsnachweis.
- Kein Raspberry-Pi-FPS-Test oder vollständiger Next.js-Produktionsbuild in der aktuellen containerbasierten Umgebung (fehlende `node_modules`).

## Tests

```
npm run test:v646
npm run test:v646:types
npm run verify:v646
npm run test:smoke:v646
npx tsc --noEmit
npm run build
```
