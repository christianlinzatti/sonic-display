# V1123 – Test- und Releasehinweise

## Funktionsumfang

Die V1122-Projektstruktur wird vollständig erhalten. V1123 entwickelt eine
**lokal deterministische Konzertregiepartitur** und steuert keine fünf eigenen
sekundengenauen Live-Automationen. Es werden ausschließlich vorhandene
V1040-Timelinefelder und bestehende virtuelle Controller verwendet.

## Lokale Prüfungen

```bash
npm run test:v1123
npm run test:v1123:types
node scripts/v959-source-preflight.cjs
node tests/check-architecture.cjs
node tests/check-source-syntax.cjs
```

## Sicherheit und Einschränkungen

Nur explizit autorisierte V1040-Vorschau/Übernahme; gesonderter Opt-in für
V1071 Smart Flow, V1041 Choreography, V1043 Camera, V1066 Stage, V1060 Lighting
und V1045 Atmosphere. Manuelle Formationen, Reduced Motion, GPU und Songpausen
haben Priorität; kein Govee, DMX, echte Lichter, Stroboskop, Pyro oder
Roh-Audio-Cloud-Upload. V1108 liefert nur ein lokales, optionales Kurzzeitsignal,
keine echte vollständige Audio- oder Drop-Erkennung.

## Vollständige CI-Freigabe

Nach dem ZIP-Import in GitHub `master` unter Node 24: Ubuntu/Windows
Produktionsbuild, alle Regressionen, TypeScript, Desktop/Touch Playwright
und Ressourcentests. Die lokale Kernprüfung ersetzt diesen Lauf nicht.
