# Sonic Display V302 – Live Camera Editing Studio

## Neu

- In **Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director → Camera Director Studio** die 3D-Vorschau öffnen und **„Aktuelle Kamera live bearbeiten“** wählen.
- Die Kamera des **vorhandenen Three.js-Canvas** wird direkt gesteuert (X/Y/Z, Blickhöhe und FOV); sechs Pfeil-/Zoom-Schritte helfen bei der Feinjustierung. Auch mit pausierter Musik möglich.
- Der Bearbeitungsmodus unterbricht nur **vorübergehend** die automatische Kamera, manuell gewählte Perspektiven, den Camera Composer, Live-Keyframes und Smart Camera Tracking. Beim Beenden oder Schließen der Vorschau wird der bisherige Regiemodus wieder aktiv. Ohne bestätigtes Speichern werden keine Presets überschrieben.
- **Neues Kamera-Preset speichern und zuordnen:** Name und Songphase wählen; das Preset wird in die vorhandene V290-Presetbibliothek aufgenommen und eigene Presets werden aktiviert (maximal 80 Einträge).
- **Keyframe bei dieser Zeit speichern:** Eines der bereits vorhandenen Presets auswählen und eine Zeit **innerhalb der Kamerafahrt** (0–3600 s) angeben. Ein Keyframe nahe derselben Zeit (±0,025 s) wird aktualisiert, sonst ein neuer hinzugefügt (maximal 120 je Preset). Die V296-Live-Keyframe-Funktion muss separat aktiviert sein, damit diese Keyframes automatisch auf der Live-Bühne laufen.
- Keine zweite WebGL-Scene und keine dauerhaft laufende Stream-Übertragung: Die V301-Live-Vorschau wird nur angezeigt, wenn sie im Dashboard geöffnet ist. Steht Canvas-Streaming nicht zur Verfügung, kann die bestehende schematische Kameravorschau benutzt werden.

## Technische Umsetzung

- `liveCameraEditingV302.ts`: normalisierte Kommandos, Preset-Erstellung und Keyframe-Upsert.
- `LiveCameraEditingStudioV302.tsx`: Live-Slider, schrittweise Kameraänderungen, Preset- und Keyframe-Speicherung.
- `StageCameraDirectorV289.tsx`: temporäre V302-Kameraübersteuerung am vorhandenen R3F-Camera-Objekt (ohne Zwischeninterpolation im Bearbeitungsmodus). Nach Freigabe greifen vorhandene Autoregie-/Manual-/Tracking-Regeln wieder.
- `CameraDirectorDashboardV300.tsx`: V302 ist im ausklappbaren V301-Vorschau-Bereich integriert.

## Grenzen

- Kamera-Presets speichern nach bestehendem Datenformat X/Y/Z, **vertikale** Blickhöhe und FOV, nicht eine separate horizontale `targetX`-Blickposition. Beim Beginn der Bearbeitung richtet der Editor den Blick wieder auf die Bühnenmitte aus. Der zuvor aktive Avatar-Tracking-Bildausschnitt wird während des Editierens nicht automatisch korrigiert.
- Ein Keyframe ist keine absolute Song-Timeline-Markierung, sondern eine Position innerhalb der Kamerafahrt, die V296 nach ihrer bisherigen Logik synchron zur Songposition wiederholt.
- Die Einstellungen werden weiterhin nur im lokalen Browser gespeichert. Ein echter Browser-/WebGL-Integrationstest und `npm run build` erfordern installierte Projektabhängigkeiten.

## Verifikation

`npm run verify:offline` (inkl. `test:v302`) sowie `npm run build:preflight`. Der Preflight meldet fehlende npm-Abhängigkeiten; auf einem Rechner mit Internetzugang `npm install && npm run build` ausführen.
