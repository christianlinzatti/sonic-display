# Sonic Display V290 – Interactive Camera Director

- Eigene Kamerapositionen mit X/Y/Z, Blickhöhe und FOV erstellen, benennen, bearbeiten und löschen.
- Zuordnung der Presets zu Verse, Break, Build, Hook und Drop.
- Fallback zur automatischen V289-Kamera, wenn ein Songabschnitt kein Preset hat.
- Browser-lokale, validierte Speicherung; Korrektur ungültiger Positionen und beschädigter Daten.
- Laufende Kamera aktualisiert auf Preset-Änderungen, ohne weiteres Canvas oder Render-State pro Frame.
- Standardmäßig deaktiviert; benötigt Smart Stage Director + echte 3D-Kamerafahrten.
- Pausen und Reduced Motion haben Vorrang. Musikabschnitte bleiben Schätzungen.
- Tests: `npm run test:v290`, `npm run verify:offline`, `npm run build`.
