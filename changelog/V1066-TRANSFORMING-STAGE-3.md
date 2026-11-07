# Sonic Display V1066 – Transforming Stage 3.0

- Sechs neue Szene-zu-Formationen: Krone (Intro), Iris (Strophe), Helix (Build),
  Fächer (Hook), Halo (Interlude) und Bloom (Finale), über die 7-teilige Timeline.
- Vorhandene 4–8 V1037-Segmente bleiben einziges bewegtes Bühnenobjekt;
  keine neuen Meshes/Timer, keine geänderte zentrale Avatar-Bühne.
- Begrenzte Petal-Offsets: radial <= 0,065m, vertikal <= 0,085m, yaw <= 0,045rad;
  weiches Annähern pro vorhandenem useFrame.
- Standard aus, V1040-Showplan und automatischer V1037-Modus erforderlich.
- Manuelle Muster, Reduced Motion, Low GPU, Pause und sämtliche
  Govee-/Kamera-/Avatar-Owner haben Vorrang.
- Neu: Tests, isolierte TS-Prüfung, CI/Vercel Release-Gates, ZIP-Importvorschau.
