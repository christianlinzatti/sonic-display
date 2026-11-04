# V559 · Beat & Music-Energy Avatar Portrait Lighting · 25.10.2026

## Verhalten
- `beatVocalPortraitLightingV559.ts`: kleiner, begrenzter, rein funktionaler Planer für **vorhandene** 3D-Key-/Fill-Leuchten. Keine neuen Lichter, Schatten, Partikel oder Shader.
- Beatstärke (`beatStrength`/`kickAccentIntensity`), Mitten und Lautstärke werden als Signale genutzt. Mitten/Lautstärke **sind keine Stimmseparation**, können auch Instrumente enthalten; keine Erkennung bestimmter Performer, keine künstlichen Gesangs-Timestamps.
- Mit echten V557-Sängerzuordnungen und aktivem V558-Porträtlicht dynamische, begrenzte Akzente: maximal +12 % Key, +7,5 % Fill und dezenter warmer/kühler Farb-Mix. Weiches Ein-/Ausschwingen, keine Blitze.
- Dichte Deutschrap-Lyrics und aktive Haupt-Lyrics dämpfen die Akzente; Pausen, ausgeschaltete Effekte, Reduced Motion, Low/Pi-Tier, manuelle Licht-Timelines, eigene Farben und Blackouts bleiben vorrangig.
- Einstellbar: Beat-Porträtlicht an/aus, Reaktionsstärke. Standard an / 45 %. Demo in großer 3D-Bühnenvorschau mit Hook und verifizierten Duett-Rollen (synthetisch, keine echten Spotify-/Mikrofon-Daten).
- Test mit `npm run verify:v559`. Vollständiger Next.js-Build und echte GLB-Porträts/Pi-FPS bedürfen installierter Abhängigkeiten bzw. Endgerät.
