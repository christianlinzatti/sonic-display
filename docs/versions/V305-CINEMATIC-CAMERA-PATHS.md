# Sonic Display V305 — Cinematic Camera Paths

## Neues in V305

V305 erweitert die bestehende Kamera-Keyframe-Bibliothek (V295–V304) um **pro Preset konfigurierbare räumliche Kamerafahrten**. Die alten Presets und Keyframes bleiben unverändert. Die neue Funktion ist **standardmäßig deaktiviert**.

- **Kurven:** Catmull–Rom/Hermite-Interpolation in sphärischen Kamerakoordinaten (Azimut, Höhe, Radius) statt kartesischer Geraden durch den Avatar. Alternativ lassen sich gerade Segmente zwischen den Winkelwerten wählen.
- **Tempo:** 0,25× bis 3,0× Wiedergabegeschwindigkeit, über die Song-/Motion-Zeit gesteuert (deterministisch auch nach Seek).
- **Beschleunigung:** Linear, Ease-in-out oder besonders weiches Cinematic-Easing.
- **Kurvenspannung:** Einstellbarer Tangentenfaktor 0–100 %, um den Schwung zwischen den Keyframes zu verändern.
- **Wiederholung:** Optionaler Loop mit zusätzlichem sanftem Abschlusssegment vom letzten zum ersten Keyframe. Dadurch bleibt die Kamera beim Übergang räumlich kontinuierlich.
- **3D-Pfadvorschau:** Orange Linie mit Start- und Endmarkierung in der vorhandenen V291-Avatar-Vorschau — kein zusätzliches WebGL-Canvas.

## Verwendung

1. **Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director** öffnen.
2. Im Kamera-Preset-Editor ein Preset auswählen und die **3D-Kamera visuell bearbeiten**-Vorschau öffnen.
3. Mindestens zwei Kamera-Keyframes setzen; sie können wie bisher durch Orbit/Pan im V303/V304-Editor entstehen.
4. Im neuen Abschnitt **Cinematic Camera Paths · V305** „Geschwungene 3D-Kamerafahrt für dieses Preset aktivieren“ einschalten.
5. Kurvenführung, Beschleunigung, Abspielgeschwindigkeit und Kurvenspannung anpassen. Optional **3D-Kamerapfad in der Vorschau anzeigen** und **Kamerafahrt vorschauen** aktivieren.
6. Damit die Kamerafahrt auf der Live-Bühne erscheint, zusätzlich **Eigene Kamerapresets verwenden** und **V296: Gespeicherte Keyframe-Kamerafahrten live verwenden** aktivieren und das Preset einem Songabschnitt zuordnen. Der 3D-Kamera-Director muss ebenfalls aktiviert sein.

Die Live-Kamerafahrt unterliegt weiterhin den bestehenden Regeln: pausierte Wiedergabe und Reduced Motion setzen die Bewegung aus. Ein aktiver Live-Kameraeditor übersteuert die automatische Kamerafahrt. V297 Smart Tracking und V298 Composer können die aus dem Pfad berechnete Kamera anschließend wie bisher verändern.

## Implementierung

- `components/visualizer/cinematicCameraPathsV305.ts`: Normalisierung, Speicherung, Kurvenberechnung und 3D-Stützpunkte.
- `components/visualizer/liveCameraKeyframesV296.ts`: verwendet pro Preset den neuen Pfad, falls aktiviert; andernfalls weiterhin die V295-Interpolation.
- `components/visualizer/StageCameraDirectorV289.tsx`: aktualisiert lokale Einstellungen via `CAMERA_PATH_EVENT`, ohne React-State im Render-Loop.
- `components/visualizer/CameraPresetStudioV290.tsx`: neue Bedienelemente im vorhandenen Keyframe-Editor.
- `components/visualizer/CameraLivePreviewV291.tsx`: eingeblendeter 3D-Kamerapfad im vorhandenen on-demand-Canvas.

Speicherschlüssel `sonic-cinematic-camera-paths-v305` (localStorage), pro Preset `CameraPathSettings`. Maximal 80 Preset-Einträge; ungültige IDs und nicht endliche Zahlen werden abgefangen. Die Daten aus V290–V304 müssen **nicht** migriert werden.

**Hinweise:** Für saubere Bögen sind drei oder mehr Keyframes ideal. Bei nur zwei Keyframes entsteht ein sphärisch geführter Bogen; ein deutlich ausgeprägter Catmull–Rom-Schwung benötigt mindestens drei. Browser-spezifische Live-Rendering-Eigenschaften wurden nicht vollständig verifiziert. Die Offline-Suite prüft zusätzlich die Loop-Nahtstelle, front-to-back-Orbits, temporale Einstellungen und die Speicherroutine.

## Prüfung

```bash
npm run verify:offline
npm run test:v305
npm install
npm run build
```

Der vollständige Next.js-Produktionsbuild setzt installierte npm-Abhängigkeiten voraus. Das Offline-Testprotokoll liegt außerhalb des Projekt-ZIPs gesondert vor.
