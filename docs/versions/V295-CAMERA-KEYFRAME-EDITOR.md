# V295 – Camera Keyframe Editor

Aufbauend auf V294: bis zu 120 Keyframes pro Kamerapreset, zeitlich an die Motion-Timeline gebunden, inkl. Erstellen, Löschen, Ersetzen und Anwählen. Weiche cubic smoothstep-Interpolation von Kamera-Position, Blickhöhe und FOV. Vorschau nur im isolierten Kamera-Editor, **keine** automatische Übernahme in die Live-Bühnenkamera. Keyframes im Browser-LocalStorage je Preset; beim Löschen eines Presets werden sie gelöscht.

**Bedienung:** In Settings > Dynamic Stage > Smart Stage Director > Interactive Camera Director eine Kamera wählen, 3D-Vorschau öffnen, Motion auswählen, Pose und Kamera einstellen und „Keyframe hier setzen“. Weitere Zeitpunkte wählen und weitere Keyframes setzen; „Kamerafahrt vorschauen“ aktiviert die interpolierte Kameraperspektive während des Scrubbens. Die Vorschau bleibt bewusst im pausierten Modus, sodass keine Konflikte mit der manuellen Orbitsteuerung auftreten.

**Tests:** `npm run test:v295`, `npm run verify:offline`; lokaler Produktionsbuild `npm run build`.
