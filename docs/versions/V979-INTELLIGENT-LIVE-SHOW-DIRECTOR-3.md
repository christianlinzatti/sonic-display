# V979 – Intelligent Live Show Director 3.0

V979 koordiniert die vorhandene **virtuelle** V958-Konzertbühne, anstatt einen zweiten
Kameradirector, eine zweite Effekt-Engine oder zusätzliche Render-Loops einzubauen.
Die vorhandenen V975-Energiekurven, V976-Übergänge, V977-Dramaturgie und
V978-Atmosphären-Layer bleiben die einzigen zuständigen Module.

## So arbeitet die gemeinsame Regie

1. Die V318-Analyse bestätigt zur tatsächlichen Wiedergabeposition ein aktuelles
   Stück `verse`, `hook`, `build`, `drop`, `break` oder `outro` mit >= 0,75 Confidence.
   V979 verwendet **keine** erfundenen Drops und keine zukünftigen Songabschnitte.
2. Die alten Regiestufen erzeugen ihre Szene und optional bestehende V969-Presets
   und V968-virtuelle Alexa-Looks. Die V976-Kameraübergabe bleibt im bisherigen
   V354-Kamerapfad; V979 erzeugt **keine** neue Kamera-/Choreografiespur.
3. V979 bestimmt für den **gegenwärtigen** Abschnitt einen Schwerpunkt:
   Intro, Reise/Verse, Build, Höhepunkt, Pause, Ausklang oder bestätigtes Finale.
4. Das kombinierte positive Lichtplus wird relativ zur ursprünglichen V958-Szene
   begrenzt; die Gesamtintensität bleibt <= 0,97. In Pausen werden unpassende
   Spitzen-Effekte entfernt. Maximal drei bestehende gleichzeitige Effekte,
   in Pausen zwei. V979 erzeugt **keinen** neuen Effekt-Typ.
5. Zusätzliche V978-Nebel-, Strahlen- und Publikums-Transparenzen werden abhängig
   vom Schwerpunkt und dem gemeinsamen Budget **ausschließlich reduziert**.
   Dies verhindert unnötige Überlagerungen und zusätzliche GPU-Last.

Beispiele: ruhiger Deutschrap-Vers ohne zusätzlichen Laserakzent, ein langsam
wachsender Hardtekk-Build, kontrollierte Hook-/Drop-Spitzen und eine ruhigere
Deutschrock-Pause. Ein spezieller Outro-Fokus entsteht nur bei einem durch
V958 bestätigten tatsächlichen Finale.

## Einstellungen

Im `ConcertRoadmapStudioV958`:

- `liveShowDirectorV979`: standardmäßig **aus** (Opt-in).
- `liveShowStyleV979`: `adaptive`, `cinematic`, `festival` oder `club`.
- `liveShowStrengthV979`: 0–100 %, standardmäßig 65 %.
- Schaltfläche **V975–V979 als gemeinsame Show aktivieren** aktiviert die
  bereits existierenden Energie-, Übergangs-, Story- und Atmosphäre-Regler
  gemeinsam mit V979. Anschließend lassen sie sich **einzeln** abschalten.

Das bestehende `ultimate-concert-v958`-Speicherschema wird weiterverwendet:
ältere gespeicherte Einstellungen erhalten sichere Standardwerte, ohne Migration.

## Priorität und Geräteschutz

- Gespeicherte Shows, aktive manuelle Timelines, Autorenbühnen, fehlende oder
  unzuverlässige Analyseabschnitte und pausierte Wiedergabe sperren V979.
- Reduzierte Bewegung, `compactFxV960` und Raspberry-Pi-/Low-Performance-
  Betrieb sperren V979 ebenfalls; sämtliche bisherigen Sparfunktionen bleiben.
- Kein Spotify-, Netzwerk-, Alexa-Lambda-, Govee-, LAN-, Matter- oder
  Hardware-Laser-/Strobo-Befehl wird von V979 ausgelöst.
- Keine neuen R3F-Meshes, Renderer, Timer, Animationsschleifen oder Audio-Analysen.
- V976-Kamera und manuelle Avatarformationen bleiben unabhängig und autoritativ.
- Bei abgeschalteter V979-Funktion werden die bestehenden V975–V978-Ergebnisse
  unverändert verwendet (gleiche Szenenreferenz und gleicher Atmosphären-Cue).

## Relevante Dateien

- `lib/intelligentLiveShowDirectorV979.ts`
- `lib/ultimateConcertRoadmapV958.ts`
- `components/visualizer/ConcertFestivalFxV958.tsx`
- `components/ConcertRoadmapStudioV958.tsx`
- `tests/v979-intelligent-live-show-director-regression.cjs`
- `tests/tsconfig.v979-core.json`

## Qualitätssicherung

`npm run test:v979`, `npm run test:v979:types`, `npm run verify:v979:focused`.
Die V931- und Vercel-Produktionsgates prüfen V979 explizit vor dem vollständigen
TypeScript-Check und realen Next.js-Build. **Diese beiden Produktionsprüfungen
sind erst nach erfolgreichem `npm ci` mit Node 24 auf CI/Vercel freigegeben.**
