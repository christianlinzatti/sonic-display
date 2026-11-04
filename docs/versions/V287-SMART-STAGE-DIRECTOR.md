# V287 – Smart Stage Director

## Funktionen
- Opt-in Automatik in Settings → Dynamic Stage; standardmäßig aus, damit bisherige Bühnenwahl erhalten bleibt.
- Genre + bestätigter Songabschnitt aus V273 und geglättete Energie bestimmen Bühnenwechsel.
- Cooldown von 2,8 s (Drop) beziehungsweise 5,8 s, daher keine Bühnenwechsel bei jedem Beat.
- Manuelle Wahl überschreibt die Automatik bis zum nächsten Track.
- Leichtgewichtiger CSS-Übergang ohne zweites Three.js-Canvas; reduzierter Bewegungsmodus unterdrückt die Animation.
- Einstellungen lokal gespeichert; vorhandene V286-Preset-Bibliothek unverändert.

## Verifikation
`npm run verify:offline` und lokal mit installierten Abhängigkeiten `npm run build`.

## Grenzen
Der Stage Director verwendet die erkannten/geschätzten Songabschnitte, keine garantierten Spotify-Abschnittsdaten. Der CSS-Fade glättet visuell den Wechsel, interpoliert aber nicht einzelne 3D-Materialien.
