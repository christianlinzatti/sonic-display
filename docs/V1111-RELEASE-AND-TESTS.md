# V1111 Release-Hinweise

Offline und ohne neue Cloudberechtigung: `npm run test:v1111`, `npm run test:v1111:types`.

Kombinationen aus Regiestil, Überraschungsoption, Genre und Intensität; Tests für ungültige Eingaben, exakte Szenengrenzen, 360°-Playback-Sampling und pausierten/reduced-motion-Betrieb.

Die V1111-Vorschau ist kein echter Live-KI-Stream. Nur die bereits vorhandene, opt-in V1040 Showplan-Engine kann gespeicherte, bestätigte Regiepläne während des Songs ausspielen. Um Browserintegration zu prüfen: Playwright-Tests in `tests/e2e/ai-live-conductor-v1111.spec.cjs` gegen ein tatsächlich gebautes `next start`.
