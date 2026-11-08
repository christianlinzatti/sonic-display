# V1113 – AI Performance Director

- Auf V1112 Avatar Personality aufgebaut. Bühnenenergie, Gestik und Rollen werden für alle drei Stage-Crew-Künstler und alle sieben Songphasen als individuelle Vorschau berechnet.
- Neue Presets: Natürlich & musikalisch, Energiegeladen & direkt, Filmisch & ausdrucksstark. Ausdrucksstärke 20–80%.
- Künstlerfokus, Spotlight und Energiekurven variieren entlang des bestehenden Storybogens; keine erfundenen Beat-/Drop-Erkennungen.
- Der tatsächliche Live-Showplan nutzt weiter nur **vorhandene gemeinsame** Kamera- und Tanzmodi von V1040, die nur nach ausdrücklicher Bestätigung übernommen werden.
- Kein dauerhaftes KI-Polling, keine Mikrofon-, Cloud-, Govee- oder Gerätedaten für diese Regie; keine individuellen GLB-Clips oder neue tatsächliche Rig-Animationen behaupten.
- Validierung und Grenzen: maximal 85% virtuelle Show-Intensität, bestehende Szenengrenzen bleiben erhalten, Bewegungsreduktion und Pausen sperren aktive Show-Cues. Undo bleibt erhalten.
- Tests: `npm run test:v1113`, `npm run test:v1113:types`; Playwright-Tests `tests/e2e/ai-performance-director-v1113.spec.cjs`.
