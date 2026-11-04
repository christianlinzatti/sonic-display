# Sonic Display V432 – Interactive Rap Camera Keyframe Studio

## Neue Bedienoberfläche

**Einstellungen → Anzeige → Rap Performance Editor → V425 → V429 → V431 → V432**

V432 ergänzt die bestehende, synchronisierte V431-Lyrics-Kameratimeline um einen Keyframe-Editor je ausgewählter Zeile. Wähle eine Lyrics-Zeile in der V431-Kartenleiste, wähle den gewünschten relativen Zeitpunkt und bearbeite Kamera-X/Y/Z, Blickpunkt-X/Y/Z und Sichtwinkel. Ein Klick auf **Keyframe speichern** übernimmt genau diese Pose für diesen Track und diese Lyrics-Zeile in die lokalen Einstellungen. Ein Klick auf einen bestehenden Zeitmarker lädt den gespeicherten Keyframe, und **Keyframe löschen** entfernt genau den Marker.

- **Sanfte Interpolation:** Zwischen zwei Keyframes innerhalb derselben Zeile wird die Pose mit kubischem Smoothstep interpoliert. Vor dem ersten und nach dem letzten Marker wird die nächstgelegene Pose gehalten.
- **Echte interaktive 3D-Vorschau:** Ein optionaler, erst auf Klick geladener `CameraLivePreviewV291`-Canvas zeigt die Pose mit dem gewählten Avatar oder neutralem Fallback und optional dem gespeicherten Positionspfad. Maus-/Touch-Orbit kann die Pose im Entwurf verändern. Keine zweite Live-Kamera und keine zusätzlichen Live-Render-Loops.
- **Timeline-Marker:** V431 zeigt jetzt die Anzahl der gespeicherten Keyframes an den jeweiligen Lyrics-Karten. Die Navigation verwendet die bestehende lokale Vorschauzeit und sucht Spotify **nicht** vor oder zurück.
- **Titelbezogen:** Die Keyframes liegen in `rapCameraKeyframesV432[trackId]`, nicht in einem globalen Kamerapreset. 128 Tracks mit je bis zu 128 Keyframes (max. 10.000 Zeilenindizes), begrenzte Offsets (0–14.000 ms), beschränkte Kamerapose. Persistiert über die vorhandene `UiPreferencesContext`-LocalStorage-Logik.
- **Opt-in:** `rapCameraKeyframesEnabledV432` ist standardmäßig `false`. Das Speichern alleine startet keine Live-Kamerafahrt.

## Laufzeit und Vorrang

V432 ist eine *zusätzliche, begrenzte Kameraposen-Ebene* nach `composeRapCameraV429` und `applyRapCameraShotV430`, aber vor `guardAutomaticCameraV351`. Sie verwendet nur einen bereits aktiven, legitimen V429-Plan. Der V430-Ruhemodus, nicht zugeordnete V416-Zeilen, Pausen, Songwechsel, fehlende synchronisierte Lyrics, reduzierte Bewegung sowie alle bestehenden Hand-/Preset-/Keyframe-/V400-/Konzert-/Duett-Kameraprioritäten verhindern den automatischen Einsatz weiterhin. Bei geschützten Lyrics wird der Keyframe-Einfluss zusätzlich auf 30 % reduziert. Eine einzelne Pose darf die automatische Bühne nur begrenzt verschieben (u. a. ≤2,2 Einheiten seitlich, ≤7° Sichtwinkel); die finale bestehende automatische Kamerasicherung läuft danach unverändert.

Die isolierte 3D-Editoransicht zeigt *exakte gespeicherte Entwurfsposen*, während der Live-Renderer Keyframe-Posen sicherheitsbegrenzt mit dem laufenden dynamischen Kameraplan mischt. Die Ansicht ist deshalb keine pixelgenaue Aufnahme des tatsächlichen Spotify-/Bühnenzustandes. Der Browser-GPU-/GLB-Sichttest bleibt erforderlich.

## Dateien

- `components/visualizer/cameraPoseTypeV432.ts` – struktureller Kamera-Pose-Typ für unabhängige Kern-TS-Prüfung
- `components/visualizer/rapCameraKeyframesV432.ts` – Keyframe-Normalisierung, sichere Library-Updates, kubisches Sampling, auf V429-Gates basierte Pose-Komposition
- `components/visualizer/RapCameraKeyframeStudioPanelV432.tsx` – Keyframe-Timeline, Slider, Knöpfe und on-demand R3F-Preview
- `components/visualizer/{ExpressiveRapDirectorPanelV425,RapCameraTimelinePanelV431,StageCameraDirectorV289,VisualizerStage,registry.tsx}` – Integration in bereits vorhandene Stage und Lyrics-UI
- `context/UiPreferencesContext.tsx`, `types/music.ts` – lokale Einstellungen und Persistenz
- `tests/v432-rap-camera-keyframes-regression.cjs`, `tests/tsconfig.v432-core.json` – automatisierte Tests

## Lokal prüfen

```powershell
npm install
npm run test:v432
npm run test:v431
npm run test:v430
npm run test:v429
npx tsc -p tests/tsconfig.v432-core.json
npm run check:syntax
npm run test:imports
npm run test:module-case
npx tsc --noEmit
npm run build
```

Der komplette Next.js-Produktionsbuild einschließlich React/R3F und der tatsächlichen GPU-/GLB-Interaktion kann nur in einer Umgebung mit installierten `node_modules` bestätigt werden. Die ZIP enthält bewusst **keine** npm-Abhängigkeiten.
