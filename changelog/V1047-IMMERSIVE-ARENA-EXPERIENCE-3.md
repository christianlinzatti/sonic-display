# V1047 · Immersive Arena Experience 3.0

Neue optionale **Audience Holograms** und **360° Light Tunnel** für die virtuelle
360°-Bühne, mit fünffacher dramaturgischer Inszenierung aus dem lokalen V1040-Showplan:
Arrival (Intro/Break), Orbit (Strophe), Spiral (Aufbau), Canopy (Hook) und Crown (Finale).

- `lib/arena360ImmersiveArenaV1047.ts`: deterministische, gekappte Planungs- und
  Samplingfunktionen; keine externen KI-Abfragen und keine Behauptung über erkannte Drops.
- `components/visualizer/stages/ArenaImmersiveExperienceV1047.tsx`: zwei GPU-instanzierte
  Meshes, **maximal 24 Hologramme und 12 Leuchtringe** (balanced: 12/6, low: 0/0).
  Keine Echtzeitlichter, Schatten, Partikelsysteme oder zusätzlichen Renderpasses.
- Optionaler, kleiner Orbit-/Höhen-Akzent auf der **vorhandenen** R3F-Kamera, wenn
  V1043 Show Camera Director aktiv ist. Geschützte manuelle, Lyrics-, Vocal-,
  Duo- oder Timeline-Kameraposen bleiben vorrangig; keine zweite Kamera.
- Separate Freigabe und Intensität 0–75 % im **AI Show Designer**; standardmäßig AUS.
  Die vorhandenen Hologramm- und Laser-Schalter bleiben gültig. Pausen,
  Reduced Motion, ungültige Songposition und Performance-Tier werden respektiert.
- Rein **virtuelle 3D-Visuals**; keine realen Laser, Govee-Kommandos,
  Stroboskope, Pyrotechnik, externen Calls oder Timer.

Tests: `npm run verify:v1047:focused` und `node scripts/v1047-release-readiness.cjs`.
CI unter Linux und Windows mit TypeScript- und Next.js-Produktionstests.
Release-ZIP mit gesamtem Quellcode, ohne eingebettete ältere Release-ZIPs.
