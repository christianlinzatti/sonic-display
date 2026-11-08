# Sonic Display V1114 – Release-Prüfungen

```sh
npm ci
npm run test:v1114
npm run test:v1114:types
node scripts/v959-source-preflight.cjs
```

Ubuntu-GitHub-Action: vollständige historische Regression, TypeScript, Next.js-Produktion, Chromium Desktop und Touch, Screenshot-Nachweise und Ressourcen-Soak. Windows: TypeScript- und Next.js-Produktions-Smoketest. Erst ein grüner Pipeline-Lauf bestätigt einen vollständigen Release-Build.

Pfad: Einstellungen → Bühne → 360° Arena → KI Show Remix → **V1114 AI Dance Choreographer 4.0**. Probenmodus erzeugt nur einen Entwurf; separates „Stage-Crew-Automatik … aktivieren“ schaltet den bestehenden GLB-Crew-Modus um und ermöglicht Konflikt-sicheres Undo. Stage-Crew-Bereich: Drei-Avatar-Trio wie bisher einrichten, alternativ dort den Modus „V1114 Auto-Choreografie“ wählen. Nutzerdefinierte Motion-Timelines, manuelle Clips und Reduced Motion haben Vorrang.

Die Vorschau ist eine geplante Story-Partitur; Hook/Drop-Grenzen sind kein Ergebnis eines neu trainierten Musikmodells. Für Live-Crew-Modus werden tatsächlich vorhandene Abschnittssignale verwendet. Tests: `tests/e2e/ai-dance-choreographer-v1114.spec.cjs` mit verpflichtenden echten Bildern.
