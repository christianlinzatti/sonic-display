# V1048 · Next Generation Concert Director

- Lokaler deterministischer Track-Seed und vier Regiemotive in sieben Abschnitten.
- Variation der automatischen Stage-/Laser-/Hologramm-/Kamera-/Choreografie-Vorschläge;
  alle manuell bearbeiteten Showplan-Felder behalten ihre Priorität.
- Intelligente, begrenzte Intensitätsmodulation – niemals über den authored Cue.
- Ein gemeinsamer V1048-Adapter für die vorhandene 360°-Bühne, Avatare und den
  optionalen V1042-Govee-Overlay. Keine neue Govee-Übertragung oder V318-Drop-Behauptung.
- Separater Opt-in-Schalter (default AUS), Stärke 0–70 % im AI Show Designer.
- Sicherheitsregeln: Pause, Reduced Motion, Low-Tier, fehlender Track/Clock und
  manuelle Kamera-/Tanzregie behalten ihre bestehenden Prioritäten.
- Tests: `npm run verify:v1048:focused` und `node scripts/v1048-release-readiness.cjs`.
- Vollständiges Quellcode-ZIP ohne eingebettete frühere Releases.
