# Sonic Display V433 – Smart Rap Camera Transition Director

V433 ergänzt die bestehende Rap-Kameraregie um **optionale, musikalisch orientierte Übergänge** zwischen automatisch ermittelten Solo-, Antwort-, Duett- und Hook-Einstellungen. V432-Keyframes und manuelle Kamerapositionen behalten Vorrang.

## Bedienung

**Einstellungen → Anzeige → Rap Performance Editor → V429 → V433**

1. V416-Rapper-Zuordnungen und synchronisierte Lyrics für den Song vorbereiten.
2. Die bestehende **V429-Kameraregie** aktivieren.
3. Optional **„Musikalische Rap-Kameraübergänge live aktivieren“** einschalten (standardmäßig **aus**).
4. Über **Übergangsweichheit (0–100 %)** die Dauer anpassen. „BPM-Raster oder erkannte Kick-Akzente“ lässt sich separat deaktivieren.
5. V430-Einzelshots und V432-Keyframes können weiter verwendet werden.

## Funktionsweise

- **Automatische Shot-Erkennung:** V429/V430 bestimmen anhand **explizit gespeicherter V416-Szenen** und synchronisierter Lyrics, wann der verantwortliche Rapper bzw. die Einstellung wechselt. V433 **führt keine selbstständige Spracherkennung** durch.
- **Rapper-Wechsel und Hook:** Bei tatsächlichem Shot-/Lead-Slot-Wechsel startet ein begrenzter, kubisch geglätteter Kameraübergang. Dauer je nach Szene und Weichheit etwa 180–820 ms. Wiederholte Frames oder gleichartige Folgezeilen starten keinen neuen Übergang.
- **Musikalischer Beginn:** Wenn Audio-BPM in 60–220 BPM verfügbar sind, kann ein Übergang auf das nächste *angenäherte* BPM-Raster gelegt werden, sofern es höchstens 160 ms entfernt liegt. Ein hoher `kickAccentIntensity`-Wert löst ihn sofort aus. **BPM allein liefert keine garantierte Beat-Phase**; dies ist ein heuristischer Schnittpunkt, kein garantiert exakter Onset-/Downbeat-Detektor. Bei ungültigen Werten beginnt der Übergang ohne Verzögerung.
- **Sichere Reset-Grenzen:** Pause, reduzierter Bewegungsmodus, Songwechsel, deutlicher Seek, ungültige Zeit, offener V430-Ruhemodus und alle bestehenden Kameraprioritäts-Gates führen zu einem Reset bzw. verhindern die Wirkung.
- **Eine Kamera:** Die Übergangsschicht wird im bestehenden `StageCameraDirectorV289` zwischen `composeRapCameraV429` und `composeRapCameraKeyframeV432` angewandt. Es gibt weder einen zweiten Canvas noch zusätzliche Render-Loop.
- **Priorität:** Manuelle Live-Edits, Kamera-Presets, V400-, Duett-, Konzert-, Festival- und Show-Kameraregie schalten die Rap-Automatik weiterhin aus. Nach V433 bleiben ausdrücklich gespeicherte V432-Keyframes unverändert vorrangig; der bestehende `guardAutomaticCameraV351` überprüft die finale Pose.

## Technische Dateien

- `components/visualizer/smartRapCameraTransitionsV433.ts`: Reine Übergangskernlogik mit per-Stage-State, BPM-Grid-Näherung, Kick-Akzent und Playback-Reset.
- `components/visualizer/StageCameraDirectorV289.tsx`: Integration in die bestehende R3F-Kamera, nach V429, vor V432.
- `components/visualizer/VisualizerStage.tsx`, `components/visualizer/registry.tsx`: Vorhandene BPM-/Kick-Werte werden an die Kamera übergeben.
- `components/visualizer/ExpressiveRapDirectorPanelV425.tsx`: Opt-in, BPM-Ausrichtung und Weichheitsregler.
- `context/UiPreferencesContext.tsx`, `types/music.ts`: Lokale V433-Einstellungen und Standardwerte.
- `tests/v433-smart-rap-camera-transitions-regression.cjs`, `tests/tsconfig.v433-core.json`: Neue Regressionen und isolierte strenge Typprüfung.

## Prüfen (Windows)

```powershell
npm install
npm run test:v433
npm run test:v432
npm run test:v431
npm run test:v430
npm run test:v429
npx tsc -p tests/tsconfig.v433-core.json
npm run check:syntax
npm run test:imports
npm run test:module-case
npx tsc --noEmit
npm run build
```

Siehe `V433-VERIFICATION.md` für den hier erreichten Prüfstand und bekannte Grenzen.
