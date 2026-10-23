# V157 – Smart IK Auto-Tuning & Motion Quality Analyzer

Erweitert V156 um eine **nicht-invasive** Diagnose in der bestehenden Dance-Diagnostics-Ansicht.

- Misst die Abweichung zwischen verankertem Fuß und aktueller Fußposition (Modelleinheiten, kein absoluter Slip-Speed).
- Misst Hand-Zielabweichungen nur in aktiven Partnergesten.
- Misst die additiven Hand-IK-Rotationen und schlägt bei auffälligen Werten eine manuelle Kalibrierung vor.
- Verwendet 1-Sekunden-Sampling zur Begrenzung von UI-Re-Renders.
- Bei Pause werden Messfenster zurückgesetzt.
- Die Diagnose enthält bewusst **keine** automatische Manipulation von Presets oder Limits.
- Im Duo wird derzeit nur die jeweils zuletzt veröffentlichte Messung angezeigt. Die Messwerte sind Heuristiken und müssen an echten Avataren geprüft werden.

## Test

`npm run test:ik-quality`, `npm run verify:offline`, `npm run build` (letzteres erfordert installierte Abhängigkeiten).
