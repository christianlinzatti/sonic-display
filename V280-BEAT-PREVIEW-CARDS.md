# V280 – Beat Preview Cards

## Neu
- Die kleinen Bühnenkarten in den Settings sind jetzt **beat-animiert**.
- Jede Karte zeigt nun eine kleine Live-Simulation mit:
  - pulsierenden Ringen
  - bewegten Lichtkegeln
  - leichtem Nebel
  - Beat-Orb / Taktimpuls
  - stilabhängigen Spezialeffekten je Bühne

## Verknüpfung mit den Settings
Die Karten reagieren auf bestehende Optionen:
- **Bühne reaktiv** an/aus
- **Lichtstärke**
- **Reduced Motion**

## Umsetzung
### Komponenten
- `components/visualizer/StageThemePreviewGrid.tsx`
  - neue Props für `reactive`, `lightStrength`, `reducedMotion`
  - zusätzliche Preview-Layer für Beam/Fog/Beat

### Integration
- `components/SettingsPanel.tsx`
  - Übergibt die Stage-FX-Einstellungen jetzt auch an die Karten-Vorschau

### Styling
- `app/globals.css`
  - neue Keyframes für beat-synchrone Mini-Animationen
  - visuelle Unterschiede je Bühnenstil bleiben erhalten

## Ziel
Die User sehen schon in der kompakten Kartenansicht klarer,
wie sich eine Bühne **in Bewegung** anfühlt – nicht nur als statisches Thumbnail.
