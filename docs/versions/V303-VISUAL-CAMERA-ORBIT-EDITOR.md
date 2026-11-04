# Sonic Display V303 – Visual Camera Orbit Editor

## Neu

Im **Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director → Camera Director Studio** auf **3D-Vorschau öffnen** und **Aktuelle Kamera live bearbeiten** klicken. Erst dann aktiviert sich die transparente V303-Eingabeschicht über dem bereits angezeigten Bühnenbild.

- **Maus:** Im Live-Bühnenbild ziehen, um den Avatar zu umkreisen; Mausrad zoomt an den Bühnenmittelpunkt heran oder davon weg.
- **Touch:** Mit einem Finger ziehen, mit zwei Fingern den Abstand durch eine Pinch-Geste verändern. Die Gestenerkennung verarbeitet mehrere Pointer-IDs samt Pointer Capture; Seiten-Scrolling ist nur in der aktiven Eingabeschicht unterdrückt.
- **Tastatur:** Fokus auf die Bühnenvorschau, Pfeiltasten zum Drehen, Plus/Minus zum Zoomen. Der Fokus ist sichtbar und die Steuerung besitzt eine ARIA-Beschreibung.
- **Rücksetzen:** `Ausgangsperspektive wiederherstellen` stellt die Pose beim Beginn der jeweiligen Bearbeitung wieder her.
- **Speichern:** Alle Orbit-Änderungen verändern dieselbe V302-Kamerapose wie die bisherigen Regler. Die Perspektive kann somit weiterhin **als Preset (inkl. Songphase)** oder **als Keyframe im gewählten Preset** gespeichert werden.
- **Abbrechen / Schließen:** Der temporäre Live-Edit wird beendet, die automatische Regie übernimmt wieder. Ohne aktives Bearbeiten wird kein Drag/Wheel abgefangen. Das gespeicherte Preset wird nie ungefragt überschrieben.

## Implementierung

- `cameraOrbitV303.ts`: Validierung von Orbit-Gesten, reine sphärische Rotations-/Zoom-Berechnung, Browser-Events für Gesten und aktiven Modus.
- `VisualCameraOrbitSurfaceV303.tsx`: transparenter HTML-Pointer-/Wheel-/Keyboard-Controller auf der bestehenden V301-Canvas-Stream-Videovorschau bzw. der schematischen V300-Vorschau. **Kein zusätzlicher WebGL-Kontext**.
- `LiveCameraEditingStudioV302.tsx`: derselbe V302-Bearbeitungszustand verarbeitet auch V303-Gesten. Eine Ref hält die zuletzt geänderte Pose synchron, damit schnelle Pointer-Ereignisse nicht verloren gehen. V302-Speicherpfade sind unverändert.
- `CameraDirectorDashboardV300.tsx`: V303-Fläche um beide Vorschautypen gelegt; die Eingabeschicht ist nur bei aktivem Editieren und verbundener Bühne interaktiv.
- `app/globals.css`: fokussierbares Overlay, Touch-/Drag-Hinweise und Einbettung.

## Grenzen

Das bestehende V290-Pose-Format speichert `x`, `y`, `z`, `targetY` und `fov`, aber **keine frei wählbare horizontale Zielposition `targetX`**. Die Kamera rotiert deshalb um die Bühnenmitte auf Höhe `targetY`; der Orbit ist auf den **vorderen Kamerahalbkreis** (±75°), eine Neigung von ±67,5° und die vorhandenen V290-Positionsgrenzen beschränkt. An Grenzpositionen kann die Bewegung begrenzt werden. Kein freier 360°-Orbit und kein Pan-Modus; diese Erweiterung würde ein neues persistentes Pose-Format erfordern.

Das Browser-Canvas-Streaming aus V301 muss unterstützt werden, um den **echten Avatar** in der Vorschau zu sehen. Die schematische Ansicht bleibt verwendbar. In der Live-Vorschau wird keine zweite Three.js-Szene aufgebaut.

## Verifikation

- `npm run verify:offline` einschließlich `test:v303`: bestanden.
- `npm run check:syntax`: 334 TS/TSX-Dateien geprüft.
- `npm run build:preflight`: Die npm-Abhängigkeiten sind hier nicht installiert. Auf deinem Rechner `npm install && npm run build` ausführen; ein tatsächlicher Browser-Integrationstest ist hier nicht erfolgt.
