# V1118 · Tests & Release

## Lokale Prüfungen

- `npm run test:v1118` – kompiliert Produktions-TypeScript und prüft 256 Varianten,
  optische Szenen, Preview, Caps, manuell veränderte Timeline und Konfliktschutz.
- `npm run test:v1118:types` – strikter isolierter TypeScript-Check.
- `npm run test:v1117` bis `npm run test:v1106` – rückwärtskompatible Regie-Regressionen.
- `node scripts/v959-source-preflight.cjs` – vollständige lokale Import-/Source-Prüfung.

## Browser und Deployment

`tests/e2e/ai-holographic-stage-v1118.spec.cjs` enthält Produktions-Chromium-Szenarien
für Desktop und Touch: seven-scene optical preview ohne Geräte/AI sowie separate Live-Freigabe.
Der vollständige Node-24-Next.js-Build und alle Playwright-Läufe müssen nach dem
ZIP-Upload in GitHub Actions bestätigt werden; lokale Kernprüfungen ersetzen CI nicht.

## Einschränkungen

Keine neuen Hologramm-GLBs, kein echter Künstler-Doppelgänger, keine automatische
Gesangs-/Drop-Erkennung, kein hardwareseitiges Projektionssignal. V1081 nutzt vorhandene
virtuelle Ring-Silhouetten; V1085 vorhandene Bühnenprojektionen. Live-Muster folgen nur
unter bestätigter Show-Designer-/Konzertdirektor-Freigabe und den bestehenden Schutzgrenzen.
