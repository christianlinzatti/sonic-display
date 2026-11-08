# V1122 – Test- und Releasehinweise

## Umfang

Die vollständige V1121-Projektstruktur ist erhalten. V1122 fügt Atmosphäre-Vorschau, Tests und diese Dokumentation hinzu. Die aktuell vorhandene V1040-Show-Timeline wird nicht um einen neuen per-Szene-Fog-Automationskanal erweitert. Das Live-Preset schaltet nur bereits vorhandene virtuelle Renderer nach ausdrücklicher Bestätigung an.

## Lokale Tests

```bash
npm run test:v1122
npm run test:v1122:types
node scripts/v959-source-preflight.cjs
node tests/check-architecture.cjs
node tests/check-source-syntax.cjs
```

## Produktionsfreigabe

Nach dem Import in GitHub `master` die V965-Produktionspipeline mit Node 24 prüfen: Ubuntu (vollständige Regressionen, Next.js, Playwright Desktop/Touch, Soak) und Windows (TypeScript, Next.js). Lokale isolierte Prüfungen ersetzen diese CI-Freigabe nicht.

## Safety

Keine Nebelmaschine, Govee, DMX oder Netzwerkkommunikation. Die Live-Effekte respektieren reduzierte Bewegung, GPU-Tier, `arenaFestivalFxModeV1084 === auto` und manuell geänderte Presets; `Undo` ist konfliktgeschützt.
