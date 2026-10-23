# Sonic Display V299 – Camera Director Studio

Zentrales Camera Director Studio in Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director.

- Live-Status: Songabschnitt, aktive Regiequelle, Musikenergie, Wiedergabe und realer Kameraabstand. Event-Veröffentlichung maximal zweimal pro Sekunde und nur bei gemounteter Live-3D-Kamera.
- Vier Perspektiven: Automatisch, Totale, Nahaufnahme und Seitlich. Die Auswahl bleibt im lokalen Browser gespeichert.
- Manuelle Perspektiven werden **nach** dem Smart Camera Composer und **vor** dem V297-Avatar-Tracking aufgelöst; Sicherheits-Tracking darf auch die manuelle Nahaufnahme erweitern.
- Übersicht über aktive Kamera-Presets, Live-Keyframes, Composer und Tracking. Die bestehenden Controls bleiben erreichbar.
- Standard ist `auto`; bei Pausierung und Reduced Motion bleibt die ruhige Kamera erhalten.

## Verifikation
`npm run verify:offline` für Syntax und Regressionstests; `npm run build` nach Installation der npm-Abhängigkeiten.

## Einschränkungen
Der Status ist an die gemountete Three.js-Bühne gekoppelt. Wenn nur andere Visualizer laufen, steht kein Live-Status zur Verfügung. Die manuellen Modi verändern die Kameraposition, nicht Avatar-Motions oder gespeicherte Keyframes.
