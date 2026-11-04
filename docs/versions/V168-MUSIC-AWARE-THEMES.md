# Sonic Display V168 – Smart Ambient Scenes & Music-Aware Themes

V168 ergänzt V167 um optionale Musikfarben (Touchmodus → **Musikfarben**). Standardmäßig bleibt die bisherige Darstellung unverändert.

- Genrepaletten: Hardstyle, Techno (einschließlich Hardtekk als erkannte Techno-Kategorie), Hip-Hop/Deutschrap, Rock, Ambient und Pop.
- Albumcover-Farbsampling über ein kleines Canvas mit `crossOrigin=anonymous`; bei Spotify-CDN-CORS-Sperren, fehlendem Cover oder fehlender Sättigung automatische Rückkehr zur Genrepalette.
- Farben werden als CSS-Variablen auf die Oberfläche und Ambient-Standby übertragen. Die ursprüngliche Three.js-Beleuchtung und Avatar-Materialien werden nicht manipuliert.
- Ruhiger Übergang der Text- und UI-Farben; Reduced-Motion respektiert. Standby-Hintergrundfarben werden per CSS angepasst.
- Theme-Schalter bleibt per localStorage bestehen. Rückkehr zu V167-Farben mit einem Klick möglich.

## Validierung
`npm run test:music-themes && npm run verify:offline && npm run typecheck && npm run build`

Eine vollständige Browser-/GPU-Prüfung erfordert ein laufendes Gerät und verfügbare npm-Abhängigkeiten.
