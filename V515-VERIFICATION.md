# V515 – Verifikation (24.10.2026)

## Ausgeführt und erfolgreich

- **65 Offline-Versionsregressionen V451–V515**: vollständig, ohne Ausfälle. Log: internes Release-Protokoll.
- **24 isolierte TypeScript-Kernprüfungen V492–V515**: vollständig, ohne Ausfälle.
- `npm run test:v515` – 30.000 variable-FPS-Simulationsframes, maximale Zusatzamplituden, Ratenbegrenzung, Sänger-/Quellenhoheit, Authoring-Vorrang, Pause/Reduced Motion, Spur-Reset und reine Korrekturhinweise.
- `npm run test:v514` – 28.000 dynamische Qualitäts-Samples aus V514.
- `npm run test:v513` – 26.000 GLB-Vorschau-Samples aus V513.
- `npm run test:gltf-hook-split` und `npm run test:three-avatar-split` – modularer GLB-/ThreeAvatar-Pfad.
- `npm run check:syntax` und `npm run check:architecture`.
- ZIP-Integrität und Dateivollständigkeit der veröffentlichten V514-Basis.

## Nicht möglich in dieser Umgebung

- **Kein vollständiger Next.js-Produktionsbuild**, da die npm-App-Abhängigkeiten lokal nicht installiert sind (`next` fehlt). Kein Ersatz durch grüne Kernprüfungen.
- **Kein visueller Browser-/GLB-/Raspberry-Pi-Hardwaretest** und kein echter FPS-Leistungsvergleich.

## Funktionsgrenzen

V515 glättet automatisch **nur den bereits vorhandenen additiven GLB-Vocal-Gestenkanal**. Sie modifiziert weder importierte noch manuelle Choreografien und ersetzt keine IK-/Foot-Lock-Reparatur. Fußrutsch-, Haltungs- oder Gelenkhinweise aus der V514-Vorschau sind Empfehlungen, keine automatisch korrigierten Posen. Bestehende Sängerzuweisung und Lyrics-Zeitmarken werden unverändert übernommen.

## Lokale Komplettprüfung

```powershell
npm install
npm run build
```

Die V515-Test- und TypeScript-Skripte sind in `build:preflight` vor den bisherigen Tests eingebunden.
