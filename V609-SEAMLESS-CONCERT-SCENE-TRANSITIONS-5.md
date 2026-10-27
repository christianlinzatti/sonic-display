# V609 – Seamless Concert Scene Transitions 5.0

**Basis:** V608. **Datum:** 26.10.2026. **Status:** Implementierung und Offline-Regression; realer Browser-/Pi-Abnahmelauf ausständig.

## Ziel

Die bestehende V604-Konzertdramaturgie soll Kamera, Lichtstimmungen und automatisch erzeugte Mehrpersonenformationen an denselben **verifizierten** Songabschnittsgrenzen sanfter überleiten. Keine neue Effektpipeline und keine vermeintliche Musikerkennung.

## Tatsächliche Integration

- `components/visualizer/seamlessConcertTransitionsV609.ts`: Rein deterministische Kurve aus dem V604/V600 bestätigten Live-Akt und der vorhandenen Songzeit. Nur tatsächlich **aneinandergrenzende** Akte aktivieren am Eintritt bzw. Austritt ein 1.800-ms-Fenster. Die Kamera-Interpolationsrate wird nahe der Grenze höchstens bis auf 62 %, die vorhandene Lichtinterpolation bis 58 % reduziert; im Aktinneren gilt exakt die bisherige Rate. Diese Multiplikatoren verändern **keine** ausgewählten Kamera-Shots, Motive oder Songabschnitte.
- `components/visualizer/StageCameraDirectorV289.tsx`: Ändert die bestehende eine R3F-Kamera-Interpolation unmittelbar vor `lookAt`, nach V605-/V606-/V351-Bildkomposition. **Harte V400-Cuts und Editor-Änderungen bleiben sofort wirksam**, gespeicherte Kamerafahrten bleiben eigenständig.
- `components/visualizer/DynamicStage.tsx` und `components/visualizer/ConcertAtmosphereRendererV308.tsx`: Verwenden dieselbe Cue-Kurve für die bereits vorhandene Dämpfung von Key/Fill/Beam, Farbüberblendung und Atmosphären-Fog. Kein neuer Shader, Lichtkörper, zusätzlicher Frame-Callback oder Nebelpartikel.
- `components/visualizer/VisualizerStage.tsx`: Verlängert nur die vorhandenen V326-Smoothstep-Übergänge *automatisch generierter*, trackgebundener V442-/V446-3-/4-Avatar-Cues um höchstens 0,32 s bzw. bis zu 1,7 s Gesamtdauer – sofern der nächste Cue weit genug entfernt ist. Keine Änderung an GLB-Clips, IK, Gesichtern, Sängerzuordnungen, Bühnenpositionen, Cue-Zeitpunkten oder manuell gespeicherten Formationen. Vorhandene ausdrücklich gesetzte 0-s-Schnitte und Drop-Cues bleiben unverändert.

## Schutz und bewusste Einschränkungen

Die komplette V609-Zusatzsteuerung fällt bei einer fremden Track-ID, nicht passendem Zeitfenster, fehlenden/inkonsistenten V604-Cues, Pause, Reduced Motion und Low-Quality auf das bestehende Verhalten zurück. Getrennte Sperren erhalten manuelle Kamera- und Licht-Autorität einschließlich Licht-Blackout. Kein künstlicher Abschnittswechsel bei Lücken in der Songstruktur. Ein synchroner Verlauf ist **nur** gewährleistet, soweit der authentisch beschriftete Songplan verfügbar ist. V609 verspricht weder einen neuen generativen Kamera-Schnitt noch eine vollständige Art-Direction-Abnahme.

## Verifikation

```bash
npm run test:v609
npm run test:v609:types
npm run test:smoke:v609
npm run verify:v609
```

Die Offline-Tests prüfen auch 30.000 Songzeitpunkte sowie tatsächliche Runtime-Wiring-Signaturen. Die Kontrolle einer live laufenden Spotify/WebGL-Performance auf dem Raspberry Pi und ein vollständiger Next.js-Produktionsbuild bleiben erforderlich. Details siehe `V609-VERIFICATION.md`.
