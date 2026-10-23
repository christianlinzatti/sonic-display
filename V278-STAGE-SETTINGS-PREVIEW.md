# V278 – Stage Settings Preview

## Neu
- Bühnenvorschau direkt im Settings-Bereich für **alle verfügbaren Stages**.
- Vorschaukarten sind **klickbar/touch-freundlich** und wählen die Bühne sofort aus.
- Zusätzliche Metadaten je Bühne:
  - Kurzbeschreibung
  - stilistische Einordnung / Mood
  - sichtbare Auswahlmarkierung

## UI-Verhalten
- Die bisherige Select-Box bleibt als kompakte Auswahl bestehen.
- Darüber wird eine Vorschau-Galerie angezeigt.
- Die aktuell aktive Bühne wird visuell hervorgehoben.
- Auswahl funktioniert ohne weitere Dialoge.

## Abgedeckte Bühnen
- Classic Stage
- Neon Club
- Festival
- Minimal Studio
- Cyberpunk Club
- Vaporwave Sunset
- Cosmic Galaxy
- White Showroom
- Rock Arena

## Technische Umsetzung
- Neue Komponente: `components/visualizer/StageThemePreviewGrid.tsx`
- Erweiterte Bühnen-Registry mit Beschreibung/Mood:
  - `components/visualizer/stages/index.tsx`
- Zusätzliche Styles für Preview-Cards:
  - `app/globals.css`
- Integration in Settings:
  - `components/SettingsPanel.tsx`

## Hinweise
- Die Vorschauen sind bewusst leichtgewichtig umgesetzt und benötigen **kein zusätzliches WebGL-Canvas** in den Settings.
- Dadurch bleibt die Vorschau performant, auch auf schwächeren Geräten.
