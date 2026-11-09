# V1124 – Test- und Releasehinweise

## Umfang

V1124 übernimmt die vollständige V1123-Projektbasis. Die Regie erfindet
**keine neue Crowd-Engine**: sieben visuelle, lokal deterministische Szenen
werden auf die vorhandenen V1044-/V1073-/V1075-/V1092-Renderer abgestimmt.
Die eingebauten Begrenzungen und die bestehende Showtime bleiben maßgebend.

## Lokale Prüfungen

```bash
npm run test:v1124
npm run test:v1124:types
node scripts/v959-source-preflight.cjs
node tests/check-architecture.cjs
node tests/check-source-syntax.cjs
```

## Sicherheit

Keine Audioausgabe, automatisch erkannte Songstruktur, Hardware- oder
Govee-Kommandos. Showplan-Vorschau und Aktivierung bereits vorhandener
virtueller Crowd-Looks benötigen getrennte Benutzerbestätigungen. Kein
zusätzliches Publikum oder neue Renderloops. Pause, niedrige GPU,
Reduced Motion und manuelle Lichtmodi gehen vor.

## CI-Freigabe

Nach dem Import auf GitHub unter Node 24: Ubuntu/Windows-Produktion,
Regressionen, kompletter TypeScript-Build, Desktop-/Touch-Playwright und Soak.
Ein lokaler Kern-Test ist kein Ersatz für den vollständigen Produktionslauf.
