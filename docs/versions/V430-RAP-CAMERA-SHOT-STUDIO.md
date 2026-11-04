# V430 – Rap Camera Shot Studio

## Was neu ist

Im bereits vorhandenen **V425 Expressive Rap Performance Director → V429 Cinematic Rap Camera Director** lässt sich ab V430 pro **synchronisierter und manuell zugeordneter V416-Lyrics-Zeile** eine Kameraeinstellung speichern. Eine weitere Kamera oder ein neues 3D-Canvas wird nicht erstellt.

- **Automatik:** V429 plant wie bisher anhand der gespeicherten Solo-/Reply-/Duett-/Hook-Rollen.
- **Solo – Nahaufnahme**, **Antwort – Seitenwechsel**, **Duett – Totale**, **Hook – sanfte Kamerafahrt**: Die Auswahl überschreibt nur den Typ des von V429 zulässigen Shots.
- **Kamera hier nicht zusätzlich bewegen:** Unterdrückt den V429-Overlay für genau diese Zeile; andere automatische Kamerafunktionen bleiben unverändert.
- **Stärke pro Zeile:** 0–100 % relativ zur gewählten allgemeinen V429-Kamerastärke und deren vorsichtiger, V416-basierter Signalenergie. Die globale Stärke und V429-Sicherheitsregeln bleiben verbindlich.
- **Titelgebunden:** Anpassungen in `rapCameraOverridesV430[spotifyTrackId]` werden in den bestehenden UI-Preferences im Browser gespeichert. Andere Titel behalten ihre eigenen Einstellungen.
- **Entwurf und Übernahme:** Änderungen an Select/Slider sind lokal im Panel vorgemerkt. Erst „Kameraeinstellung für diese Zeile speichern“ übernimmt sie. „Zeile auf Automatik zurücksetzen“ entfernt nur die aktuelle Zeile.

## Sicherheitsregeln

V430 wirkt nur, wenn V429 aktiviert ist und bereits einen gültigen Shot anbietet. Dies setzt passenden Track, abgespielte, synchronisierte Lyrics, aktuelle V416-Rapper-Szenenzuordnung und mehr als einen aktiven Avatar-Slot voraus. Kein Versuch, Sprecher oder Emotionen aus Audio zu erkennen. Pause, Trackwechsel und Seek werden weiterhin von V429 verarbeitet. Reduzierte Bewegung deaktiviert die Automatik; V430 kann sie nicht wieder einschalten.

**Vorrang:** manuelle Kamera/Live-Edit, Kamera-Presets, gespeicherte Keyframes, Kamerazeitachsen und bereits aktive sonstige Show-/Duett-/Konzertkameras stehen vor V429 und damit vor V430. Lyrics-Schutz, Mindestabstände, FOV-Grenzen, sanfte Übergänge und Shot-Hold von V429 bleiben aktiv. Keine Änderung an Spotify-Zeit, Lyrics, Gesichtsanimation, Mund-Keyframes, Tanzgesten oder gespeicherten Kamerafahrten.

## Technische Umsetzung

- `components/visualizer/rapCameraShotStudioV430.ts`: ausschließlich reine, defensive Normalisierung, track- und zeilengebundene Änderungen, Echtzeit-Override mit begrenzter linearer Suche, ohne Array-Sortierung pro WebGL-Frame.
- `components/visualizer/RapCameraShotStudioPanelV430.tsx`: zeilenbezogene Controls mit explizitem Speichern/Zurücksetzen.
- `ExpressiveRapDirectorPanelV425.tsx`: zeigt V430 im bestehenden Kamera-Panel, benutzt denselben Vorschauzeit-Regler; er sucht **weder Spotify noch die Live-Kamera**.
- `VisualizerStage.tsx`, `registry.tsx`, `StageCameraDirectorV289.tsx`: geben nur den aktuellen Track-Override an die bestehende Kamera weiter. V430 verändert ausschließlich den zulässigen V429-Plan vor dem vorhandenen Shot-Hold.
- `types/music.ts`, `context/UiPreferencesContext.tsx`: Preferences und defensive JSON-Normalisierung beim Laden.
- `tests/v430-rap-camera-shot-studio-regression.cjs`, `tests/tsconfig.v430-core.json`: Testabdeckung für Track-Isolation, Invalid-JSON, Überschreiben, Auto/Off, Stärke-Grenzen, kein Eingriff in manuelle Kamera-Schutzregeln und UI-Verdrahtung.

Der Speicher begrenzt pro Titel auf 256 zeilengebundene Änderungen und die Bibliothek auf 128 Titel; ungültige Werte werden beim Import verworfen. Es findet kein Upload und keine Spotify-API-Schreiboperation statt.

## Lokal prüfen (Node >= 20.9)

```powershell
npm install
npm run test:v430
npm run test:v429
npx tsc -p tests/tsconfig.v430-core.json
npm run check:syntax
npm run test:imports
npx tsc --noEmit
npm run build
```

Ohne installierte Next.js-/React-/R3F-Abhängigkeiten können vollständige Browser-, GPU- und Produktions-Buildprüfungen nicht als bestanden gelten.
