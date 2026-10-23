# V279 – Live Stage Preview FX

## Neu
- Große **Live-Vorschau** der aktuell ausgewählten Bühne direkt in den Settings.
- **Bewegende Scheinwerfer** als animierte Preview-Beams.
- **Nebel/Fog-Layer** für mehr Bühnenatmosphäre.
- Bühnenabhängige Spezialelemente bleiben sichtbar:
  - Vaporwave-Sonne + Grid
  - Galaxy-Sternenfeld
  - Cyberpunk-Neon
  - White-Showroom-Softboxen
  - Rock-Truss, Speaker und warme Flare-Lights

## UX
- Vorschaukarten bleiben zur schnellen Auswahl erhalten.
- Unterhalb der Karten erscheint nun eine größere animierte Szene.
- Die Szene reagiert auf:
  - ausgewählte Bühne
  - Musikreaktiv an/aus
  - Lichtstärke
  - Reduced Motion

## Technische Umsetzung
- Neue Komponente:
  - `components/visualizer/StageThemeLivePreview.tsx`
- Integration in:
  - `components/SettingsPanel.tsx`
- Zusätzliche CSS-Animationen/Stile:
  - `app/globals.css`

## Performance
- Weiterhin **ohne zusätzliches WebGL-Canvas** in den Settings.
- Die Live-Vorschau ist als animierte DOM/CSS-Szene umgesetzt und daher leichtgewichtig.
