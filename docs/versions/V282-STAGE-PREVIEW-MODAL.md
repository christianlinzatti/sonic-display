# Sonic Display V282 – 3D Stage Preview Modal

Basiert auf dem vollständigen V281-Projekt. Spotify, Lyrics, Avatar-Choreografien, frühere Bühnenauswahl sowie die kleinen 2D-/3D-Vorschaukarten bleiben bestehen.

## Bedienung

1. **Settings → Avatar & Tanz → Dynamic Stage** öffnen.
2. Unter der gewünschten Bühnenkarte **„Große 3D-Vorschau öffnen“** auswählen.
3. Mit gedrückter Maus/Finger bewegen: drehen. Mit Mausrad/Pinch: zoomen. Rechtsklick: verschieben.
4. In der Großansicht zwischen allen neun Bühnen wechseln. Die Kamera kann zurückgesetzt werden.
5. Zusätzliche Scheinwerfer/Nebel und automatische Kameradrehung lassen sich unabhängig ein- und ausschalten. Die Animation kann pausiert werden.
6. **„Diese Bühne verwenden“** speichert die Auswahl in den bestehenden UI-Einstellungen. **„Schließen“** verwirft die Vorschauauswahl.

## Umsetzung

- `components/visualizer/StagePreviewModal.tsx`: auf Wunsch gerenderter Canvas, `OrbitControls`, lebendige Scheinwerfer, diskrete Nebelgeometrien, Bühnenwechsel und barriereärmeres Dialogverhalten.
- `components/visualizer/StageThemePreviewGrid.tsx`: separate Schaltfläche pro Bühnenkarte, Modal-Anzeige und Rückkehr des Tastaturfokus.
- `app/globals.css`: responsive Modal-Gestaltung und Fokusindikatoren.
- Die Großansicht rendert die **gleichen `DynamicStage`- und `StageEnvironment`-Komponenten** wie der Avatar-Visualizer. Sie enthält keinen weiteren Avatar, um die Prüfung der Bühne im Vordergrund zu halten.

## Performance

- Der zusätzliche WebGL-Canvas wird **nur bei geöffneter Großansicht** erzeugt; die 3D-Mini-Vorschauen werden währenddessen deaktiviert.
- Pixel-Ratio ist auf maximal 1,5 begrenzt, die Zahl der zusätzlichen Licht- und Nebelelemente klein.
- `Reduced Motion` unterbindet die künstliche Animation sowie die automatische Kameradrehung.

## Hinweise

- Die Audioenergie in der Vorschau ist eine **simulierte Rhythmuskurve**, kein Zugriff auf Spotify-Audio. Echte Musikreaktionen bleiben in der Live-Bühne.
- Nebel wird für die Vorschau über vereinfachte transparente Geometrien und Szenen-Fog erzeugt, nicht als kostenintensiver volumetrischer Effekt.
- Zum visuellen Laufzeittest wird ein Browser mit WebGL benötigt. Ohne installierte `node_modules` kann der vollständige Next.js-Build nicht bestätigt werden.
