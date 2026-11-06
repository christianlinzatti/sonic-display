# Sonic Display V1023 – Advanced Rap Performance 6.0

- Produktive, additive Verfeinerung für Deutschrap/rap-synchronisierte Wort-Gesten, motifstabile Übergänge und sanfte Phrasenhüllkurve.
- Bestehender Mund-Interpolator erhält sehr kleine Tempoanpassungen ausschließlich aus V837 bestätigten Wortfenstern für Kiefer, runde und breite Mundformen; kein zweiter Mund-Rig und keine neue Phonemrekonstruktion.
- B/P/M-Lippenschluss bleibt unverändert. Manuelle V644-Viseme, importierte Animationen, Ensemble-/Sängerzuweisungen, Reduktion der Bewegung, Low-LOD, Pausen und ungültige Wortzeiten haben Vorrang.
- Keine zusätzlichen API-Anfragen, keine neuen Renderer-Schleifen oder Hardwaresteuerung.
- Regression `npm run test:v1023`; Typcheck `npm run test:v1023:types`; CI-Preflight und Vercel-Gate erweitert.
- Node-24-Produktionsbuild muss in GitHub Actions und Vercel vollständig bestätigt werden.
