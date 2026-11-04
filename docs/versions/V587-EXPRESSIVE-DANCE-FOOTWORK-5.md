# Sonic Display V587 – Expressive Dance & Footwork 5.0

Stand: 26.10.2026 · Basis V586.

## Änderungen

- `components/visualizer/expressiveDanceFootworkV587.ts`: zwei reine, voneinander unabhängige finishing passes für vorhandene automatische 3-/4-Personen-Fußarbeit und additive GLB-Arm-/Rumpfkanäle.
- Im automatischen Gruppentanz V486 → V524 → **V587**: sanftere Fußhebungen, Gewichtsverlagerungen mit kleinerem Ausschlag bei bekanntem Standfuß, dezente genre-/Abschnitt-abhängige Varianz. Bei bekanntem BPM hängt die kleine Intensitätskurve am Song-Takt; ohne BPM gibt es keinen künstlichen Beat. Kein Fußheben bei tatsächlich erkanntem Kontakt und **keine** Änderung von `offsetX`, `offsetZ` oder `rootSpeed`. Die Group-Renderpfade bekommen die neuen Werte über das bestehende `naturalFootworkV524`-Objekt.
- Im GLB-Rig V545 → **V587** → `filterMotionDebugLayers` → `applyAvatarRigMotion`: Bewegungsamplitude von vorhandenem `armSwing`, `followThrough` und `hipSway` wird abhängig von bekannten Stützphasen geringfügig gedämpft; Hooks behalten etwas mehr Ausdruck. Schon stille Kanäle bleiben still. Keine neuen Clips, keine neuen Bones und keine zusätzlichen Frame-Schleifen. Der alte Foot-IK-Durchlauf bleibt unverändert.
- **Sicherheitsgrenzen:** Manuell choreografierte Shows, gespeicherte Clips/Timelines, fehlende Kontaktmeldung, Pause, `reducedMotion`, Low-Tier und nicht plausible Songzeit verhindern den neuen Rig-Eingriff. Die Standfußdaten kommen aus der bestehenden IK, niemals aus BPM oder Genre. Solo-/Duett-Sängerrollen und Face/Lipsync werden nicht geändert.

## Verifikation

```powershell
npm install --no-audit --no-fund
npm run test:smoke:v587
npm run verify:v587
npm run typecheck
npm run build
```

Auf einem echten Raspberry Pi danach `npm run benchmark:v580:pi` in der laufenden Anwendung durchführen. Zum visuellen Vergleich echte GLB-Modelle verwenden: langsame Rap-Parts, schnelle Wortfolgen, Hook, bewusster Sängerwechsel und beide Füße am Boden. Auch 30/60 Hz, Pause und vorwärts/rückwärts-Seek begutachten. **Statistische Regressionen beweisen keine gefühlte Natürlichkeit oder GPU-Leistung.**
