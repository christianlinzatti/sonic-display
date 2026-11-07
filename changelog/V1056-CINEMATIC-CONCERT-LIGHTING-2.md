# V1056 – Cinematic Concert Lighting 2.0

## Implementiert

- Opt-in-Lichtregie für die bestehende 360°-Arena mit sieben geplanten Lichtkapiteln (Intro, Strophen, Aufbau, Hook, Interlude, Finale).
- Zwei **bestehende**, budgetierte SpotLights werden für wirkliche Bühnen-Avatarpositionen aus der Szene nachgeführt: `v377-vocal-stage-slot-0`, optional Slot 1. Die `TRACKING_ROOT_NAME` bleibt Solo-Fallback.
- Sichere Fallback-Bühnenpositionen, wenn keine sichtbaren Avatare oder gültige Weltkoordinaten vorliegen. Keine behauptete Erkennung eines aktiven Sängers.
- Farbwechsel mit Interpolation und gedämpfte Positionsbewegungen innerhalb der bestehenden Stage. Kein neuer Renderer, kein neues Licht, kein Schatten und kein Govee-Verkehr.
- Niedriger Grafikmodus, Pause, Reduced Motion, fehlerhafte Uhrzeiten, ungültiger Showplan oder deaktivierte V1032-Bühnenlichter schalten den Zusatz ab.
- Setup im AI Show Designer, Standard aus, 0–80 %. Abhängigkeit vom bestehenden V1040 Showplan und V1034 Show Director.

## Verifikation

`npm run verify:v1056:focused`; Regressionen in V931, Vercel-Build und Release-Preflight registriert. Die Release ZIP-Importvalidierung schützt weiter bestehende GitHub-Workflows. Finalen GitHub-Production-Build und Playwright nach dem Upload prüfen.
