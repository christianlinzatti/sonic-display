# V261 – Adaptive Performance Control Center

Erweiterung von V260. In Einstellungen → Diagnose steht jetzt ganz oben ein zentraler Überblick über vorhandene Live-Messungen: FPS, P95-Framezeit, langsame Frames, aktive Qualitätsstufe/DPR, Draw Calls und Dreiecke, CPU-Scheduler, aktive Avatar-CPU-Callbacks und die letzten fünf Qualitätsentscheidungen. Die optionale V260-Multi-Avatar-Regelung lässt sich hier ein- und ausschalten.

Keine zusätzlichen useFrame-Callbacks. Veraltete Werte werden als nicht verfügbar markiert. CPU-Zeit ist kein GPU-Messwert; kein automatischer Austausch von Avataren. Bestehende Diagnoseabschnitte und Features bleiben bestehen.

## Prüfungen

`npm run test:v261`, `npm run test:v260`, `npm run check:syntax`, lokal bei vorhandenen Abhängigkeiten `npm run typecheck && npm run build`.
