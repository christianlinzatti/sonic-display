# V870 – LED Wall Experience: dynamische Muster

**Ausgangspunkt:** V869 (inklusive V842 LED Wall Experience 3.0 und V866–V868-Konzertregie).

## Neue Funktionen

- `ledWallMotifDirectorV870.ts` plant EQ-Säulen in Intro/Strophe/Ruhe,
  Prismaformen bei Hook/Build und akzentuierte Bass-Schockwellen bei
  **verifizierten** Drops und Finales; Genre-Energie fließt aus V810 ein.
- `ledWallExperienceShaderV842.ts` zeichnet alle Varianten auf dem bereits
  vorhandenen `ledWallV635`-Mesh. Keine zusätzlichen Draw-Calls.
- Vier persistierbare Optionen in den bestehenden V810-Einstellungen:
  `ledMotifsV870`, `ledMotifStrengthV870`, `ledMotifStyleV870`,
  `ledCameraProtectionV870`. V821/V842-Einstellungen bleiben unverändert.
- Lyrics-Schutz, Kameraschutz, Vokal-Fokus, Budget und Geräteklasse verringern
  den LED-Zusatz. Keine Vollbildblitze; der existierende Alpha-Cap .15 gilt.
- Manuelle LED-Timeline, feste Looks und Lichtregie, Reduced Motion,
  Blackouts, Low-Tier oder ungültige Musikdaten schalten V870 aus.
- Die Vorschau im Concert FX Studio ist eine Simulation.

## Grenzen

- Keine echte zusätzliche 3D-Geometrie, keine Audio-FFT-Quelle zusätzlich,
  keine neuen physischen Effekte oder Stroboskop-Simulation.
- Der Code braucht einen realen WebGL-Browser-Test, eine visuelle Abnahme mit
  mehreren Avataren und Lyrics sowie volle Windows-/Ubuntu-Produktionsbuilds.
- Kein Auto-Release bei ausstehenden Checks.

## Prüfungen

`npm run test:v870`, `npm run test:v870:types`, `npm run test:v842`,
`npm run test:v869`, `npm run test:smoke:v665:flat`,
`npm run verify:production:v867`.
