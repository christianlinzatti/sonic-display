# V281 – Stage Card 3D Preview

## Neu
Die Bühnenkarten im Settings-Bereich besitzen jetzt eine **echte kleine 3D-Vorschau** bei Hover, Fokus und Auswahl.

## Features
- **3D-Hover-Preview** direkt in jeder Stage-Karte
- bleibt auf der **ausgewählten Bühne aktiv**
- nutzt **React Three Fiber Canvas** statt nur CSS-Layer
- reagiert auf vorhandene Stage-Einstellungen:
  - musikreaktiv an/aus
  - Lichtstärke
  - Reduced Motion
- weiterhin mit den vorhandenen **2D-Beat-Preview-Layern** kombiniert

## Umsetzung
### Neue Komponente
- `components/visualizer/StageThemeCardScene.tsx`
  - leichtgewichtige Mini-3D-Szenen für alle Stage-Themes
  - eigene Farbpaletten je Bühne
  - subtile Animationen, Lichtkegel, Nebel und stage-spezifische Props

### Erweiterung der Karten
- `components/visualizer/StageThemePreviewGrid.tsx`
  - Hover-/Fokus-State
  - 3D-Szene wird nur bei Hover/Fokus oder für die aktive Karte eingeblendet

### Styling
- `app/globals.css`
  - Overlay-, Fade- und Badge-Styling für die 3D-Canvas-Vorschau

## Ziel
Schon beim schnellen Überfahren der Karten sieht man viel besser,
wie sich eine Bühne **räumlich und lebendig** anfühlt,
ohne erst die große Vorschau darunter ansehen zu müssen.
