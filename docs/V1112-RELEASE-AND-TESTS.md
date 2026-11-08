# Sonic Display V1112 – Release und Prüfungen

```
npm run test:v1112
npm run test:v1112:types
node scripts/v959-source-preflight.cjs
```

CI: Ubuntu führt vollständige Regressionen, Next.js-Produktion, Chromium Desktop/Touch und Bildnachweise durch; Windows den schlankeren TS-/Next-Produktionscheck. E2E: `tests/e2e/ai-avatar-personality-v1112.spec.cjs`. Ein lokaler Unit-Test ersetzt keinen vollständigen GitHub-Actions-Produktionslauf.

Bedienung: Einstellungen → Bühne → 360° Arena → AI Show Designer → V1112 AI Avatar Personality. Drei Profile wählen, ausdrücklich proben und bei Bedarf die sieben Szenen übernehmen. Undo nach der Übernahme. Kein automatisches Aufrufen externer Dienste, keine realen Lichter, keine biometrische Analyse.
