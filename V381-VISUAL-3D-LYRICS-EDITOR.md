# Sonic Display V381 – Visual 3D Lyrics Editor

**Basis:** vollständiges V380-Projekt. Zugang: **Settings → Display → Lyrics Studio → Echte 3D-Bühne öffnen → 3D-Layout V381**.

## Was umgesetzt wurde

- **Direkte Bearbeitung im echten WebGL-Canvas:** Bei aktiviertem Bearbeitungsmodus kann die türkise Textfläche mit Maus oder Touch nach links/rechts und oben/unten verschoben werden. Der gelbe Eckgriff verändert die Größe; in den Reglern kann auch die Tiefe eingestellt werden. Beim Ziehen bleibt die normale Orbit-Steuerung gesperrt, um unbeabsichtigte Kamerabewegungen zu vermeiden. Ohne Editiermodus bleibt die bekannte Kamera frei verfügbar.
- **Eine gemeinsame persistente Bühnenposition:** `lyricsSpatialLayoutV381` (x, y, z, scale, safeMargin, faceGuard) liegt in `UiPreferences` und wird wie andere Anzeigeeinstellungen im lokalen Speicher des Browsers gesichert. `VisualizerStage` reicht sie an **dieselbe** `Lyrics3DScene` weiter, die Studio und Hauptbühne nutzen. Alte Einstellungen ohne dieses Feld bekommen die neutrale Position 0/0/0 und Skalierung 1, um bestehende Bühnenbilder beizubehalten. Die 2D-Karaoke-Ansicht bleibt unverändert.
- **Gesichtsschutzzonen:** Für die bis zu vier platzierten Performer werden *geschätzte* Kopfbereiche in der tatsächlichen Studiokamera projiziert. Die Ansicht markiert Konflikte rot. Auf Wunsch werden Kandidatenpositionen beim Verschieben abgewiesen und eine nächstgelegene freie Position gesucht. Die Schutzzone lässt sich vergrößern und deaktivieren. Das System erkennt dabei **keine** echten anatomischen GLB-Gesichts-Bounds; je nach importiertem Modell und Kamera ist das ein hilfreicher visueller Näherungswert, keine Garantie.
- **Benannte Layoutvorlagen:** Aktuelle räumliche Einstellungen mit einem eigenen Namen speichern, wieder laden und löschen. Die Liste liegt ausschließlich unter `sonic-display-lyrics-layouts-v381` im Browser-LocalStorage und wird nicht zu Spotify oder einer Cloud übertragen. Ein Layout enthält nur Bühnenoffsets und Skalierung; er verändert keine Lyrics-Quelltexte.
- **Detaillierte Regler:** Horizontal, vertikal, Tiefe, Skalierung, Schutzradius, Face Guard, automatische Platzsuche und Reset. Auch auf Touchgeräten benutzbar.

## Architektur

- `components/visualizer/lyricsSpatialEditorV381.ts`: reine Typen und mathematische Funktionen für Begrenzungen, Drag/Scale, Rechteckkollisionen, Auto-Platzierung und JSON-Vorlagen.
- `components/visualizer/SpatialLyricsHandlesV381.tsx`: R3F-Pointer-Griffe mit Pointer-Capture, Kameraprojektion und geschätzten Head-Bounds.
- `components/visualizer/RealLyricsStagePreviewV380.tsx`: schaltet Griffe nur im Studio-Editiermodus zu.
- `components/visualizer/Lyrics3DScene.tsx`: zusätzliche Transformgruppe um **alle** vorhandenen 3D-Karaoke-Meshes und die Kontrastplatte, inklusive dynamischem Karaoke-Fortschritt.
- `components/VisualLyricsStudioV379.tsx`: Steuerung, Sicherheitsfeedback, benannte Layoutvorlagen.
- `types/music.ts`, `context/UiPreferencesContext.tsx`, `components/visualizer/VisualizerStage.tsx`, `components/visualizer/registry.tsx`, `app/globals.css`: Typen, Standard, Hauptbühnenintegration und Darstellung.

## Relevante Grenzen

Das Studio ist kein vollständig zweiter Renderpfad der Tänzer-Choreografien. Es klont GLB-Modelle und zeigt vorhandene Clips; vollständige IK- und Vocal-Animationen verbleiben auf der Hauptbühne. Die Head-Bounds sind angenähert; importierte Modelle mit stark abweichenden Proportionen oder verzerrte Kameraperspektiven können von dieser Heuristik abweichen. Die Vorschau steuert Spotify weder beim Verschieben noch beim Scrubben. Die layoutbezogenen Parameter beziehen sich auf **räumliche 3D-Lyrics**; 2D-Karaoke wird weiter durch die älteren typografischen Einstellungen geregelt.

## Prüfung

`npm run check:syntax`, `npm run test:v381`, `npm run test:v380`, `npm run test:v379`. Die vollständige Installation und der Next.js-Production-Build erfordern auf einem internetfähigen Rechner `npm install` und danach `npm run verify`, da im Quellarchiv kein `node_modules` oder npm-Lockfile enthalten ist.

**Ergebnis in dieser Entwicklungsumgebung:** 508 TypeScript-/TSX-Dateien bestanden die Syntaxprüfung. 123 von 123 Offline-Testbefehlen aus `verify:offline` bestanden (parallel ausgeführt). `npm run build:preflight` meldete fehlendes `package-lock.json` und 16 von 17 nicht installierte npm-Abhängigkeiten; darum sind vollständige TypeScript-Typprüfung und Next.js-Produktionsbuild **nicht** als bestanden ausgewiesen.
