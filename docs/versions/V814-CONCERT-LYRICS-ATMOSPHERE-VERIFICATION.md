# Sonic Display V814 – V813/V814 Verifikation

## Implementiert

- V813: Boden-/Rueckwandprojektionen bei echten synchronisierten Lyrics und bestaetigter Songstruktur. Reim-Endungen als einfache Heuristik bei echten Wortmarken.
- V814: Geringe Alpha-Bodennebel und seitliche Lichtschichten ohne Ersatz von V308 Fog.
- Geschuetzte Lyrics und Gesichter; Presets Performance, Balanced, Ultra; keine Effekte bei Pause, Blackout, Low-Tier, Reduced Motion oder manuell priorisierter Lichtregie.

## Tests

`npm run verify:fx-v814` prueft neue FX-Tests, V809 und Syntax-/Architektur-Checks. Fuehre vor produktiver Freigabe bitte zusaetzlich aus:

```
npm ci
npm run typecheck
npm run build
```

Ein echter GPU/WebGL-Rendering-Test mit GLB-Avataren ist in dieser Umgebung nicht gelaufen. Die schematische Settings-Vorschau zeigt nur V810-V812; neue V813-V814-Effekte sind nur in der echten 3D-Stage zu sehen.
