# Sonic Display V289 – Stage Camera Director

- Echte Kamerafahrten direkt auf der bestehenden React-Three-Fiber-Kamera.
- Musikabschnitte: Verse, Break, Build, Hook und Drop mit unterschiedlichen Kameraposen.
- Sanfte, framerate-unabhängige Interpolation für Position, Blickpunkt und FOV.
- Einstellungen im Smart Stage Director: Ein/Aus (standardmäßig aus), Intensität 0–100 %.
- Bei deaktivierter Kameraführung bleibt die bewährte SmartStageCameraV236 aktiv.
- Keine zweite Kamera, kein zusätzlicher Canvas, keine React-State-Updates pro Frame.
- Reduced Motion deaktiviert die Kamerabewegung; bei Pause kehrt die Kamera sanft in die Ausgangslage zurück.
- Unterliegt der vorhandenen Songabschnittsschätzung; keine garantierte Spotify-Abschnittserkennung.
- `npm run test:v289`, `npm run verify:offline`, `npm run build`.
