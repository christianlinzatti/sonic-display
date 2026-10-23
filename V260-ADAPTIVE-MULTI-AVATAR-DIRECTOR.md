# Sonic Display V260 – Adaptive Multi-Avatar Performance Director

- Optionales Kontrollkästchen unter Einstellungen → Diagnose → Avatar CPU-Profiling.
- Standardmäßig ausgeschaltet; V252-Verhalten bleibt unverändert, wenn ausgeschaltet.
- Opt-in-Einstellung bleibt in `localStorage` dieses Browsers erhalten.
- Bei mindestens zwei Avataren mit mindestens 45 Samples nutzt V260 Mittelwert- und P95-CPU-Callback-Zeiten. Schwellen: Gesamtmittelwert ≥9 ms oder P95 eines Avatars ≥8 ms.
- Leichte Charaktere werden priorisiert geschützt. Nur kostenintensive sekundäre Choreografie-Berechnungen werden auf niedrigere Cadence umgestellt; Audio/Beat-Transport, Rig, Pose, IK und Mixer laufen weiter.
- Bereits bestehende Stabilisierung mit Erholungsdauer verhindert Qualitäts-Flattern. Keine automatische Avatar-Auswahl; V259 bleibt ein manueller Einmalklick.
- CPU-Callback-Dauer ist keine GPU-Zeit; Ergebnisse müssen auf Zielgerät getestet werden.
- Tests: `npm run test:v260`, `npm run test:v259`, `npm run check:syntax`; vollständiges `npm run build` bei installierten Dependencies.
