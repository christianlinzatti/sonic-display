# V616 – Natural Multi-Performer Interaction

**Basis:** V615 – Intelligent Choreography Variety.

## Umsetzung

- `components/visualizer/naturalMultiPerformerInteractionV616.ts` verfeinert zwei bereits bestehende Szenenregie-Kanäle. Der V500-Plan bleibt die Quelle der (manuell bzw. editorseitig) belegten Duett-Sängerrolle. V539 stellt den gemeinsamen Ensemble-Ausgang für die Zweier- und Gruppenbühne bereit.
- V616 fügt nur wenige, zeitlich versetzte Oberkörper-Impulse für Sänger und zuhörende Performer hinzu. Die vorhandenen Gesichts-/Lippen- und IK-Steuerungen werden nicht geändert. Es entstehen keine zusätzlichen GLB-Clips, keine neuen Motion-Mixer und keine zusätzlichen Render-Schleifen.
- Der V416-inline-Reply startet erst nach der bereits belegten 62%-Songzeilen-Grenze; V496-Segmente reagieren ab Segmentstart. Der abgebende Künstler darf nach 880 ms im Crew-Zweig keine zusätzliche Nachbewegung erhalten.
- Duett-Blickkontakt setzt eine schon existierende, korrekt gerichtete Blickbewegung und sicheren Abstand voraus. Hooks bleiben zum Publikum ausgerichtet; keine automatische Sängererkennung.
- Rollen-, Track-, Cue-, Performance-, Kollisions- und Benutzerprioritäten bleiben maßgeblich. Die Overlay-Funktionen sind reine Funktionen der Eingabe/Songzeit (Seek-/Replay-sicher).

## Ausführen

```powershell
npm run test:v616
npm run test:v616:types
npm run test:smoke:v616
npx tsc --noEmit
npm run build
```

`npm run test:all` läuft weiterhin alle einzeln registrierten Testskripte durch.

## Grenzen

Regressionstests und simulierte Musikzeiten ersetzen keine echte visuelle GLB-Freigabe. Die bisherige Bühnenformation, Sängerbesetzung und Avatar-Positionen werden von V616 **nicht** geändert; V616 verfeinert nur Blick- und Gesten-Overlays.
