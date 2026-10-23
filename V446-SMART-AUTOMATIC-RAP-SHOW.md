# V446 – Smart Automatic Rap Show

## Ziel

Eine schöne automatische Rap-Show **ohne zusätzliches Setup**. Die vorhandene GLB-Motion-Bibliothek, die Feature-Song-Bühne (1–4 Avatare), die Künstler-Namensblasen und die bisherige Rap-Kamera sollen gemeinsam wirken statt unabhängig und hektisch zu wechseln.

## Technische Umsetzung

- `components/visualizer/smartAutomaticRapShowV446.ts`: reine, deterministische und begrenzte Song-Szenenplanung. Bei synchronisierten Lyrics werden Gruppen aus höchstens vier Zeilen untersucht und unnötig kurze Szenen (<5,5 Sekunden) zusammengehalten. Mindestens zwei benachbarte, substanzielle und in Abstand wiederholte Zeilen können als visueller Hook-Hinweis gelten. Keine behauptete echte Songstruktur-Erkennung.
- `buildSmartRapShowV446`: höchstens 63 Szenen und 5.000 betrachtete Zeilen, kein Zugriff auf Audioinhalte, keine Spotify-Streams und keine Netzwerkanfragen. Bei fehlenden synchronisierten Lyrics werden bei bekannter Songdauer und BPM (ersatzweise Standardtempo) längere Acht-Takt-Szenen aufgebaut; ohne verwertbare Dauer wird die bestehende Regie unverändert verwendet.
- `sampleSmartRapShowV446`: binäre Suche über Szenen; stabiles Ergebnis während der Szene, reproduzierbar nach Seek/Pause. Tempo, Lyrics und Track-ID werden bei der Szenenplanung berücksichtigt; musikalisch von V437 gemeldete Hooks, Drops und Duette dürfen eine gemeinschaftliche Szene vorübergehend hervorheben.
- `arrangeAutomaticGroupV446`: nutzt unverändert die vorhandene V326-Dreier-/Vierer-Gruppenbühne und arrangiert ihre automatisch erstellten Cues neu: Solo-Fokus, weiche Übergänge und breite gemeinsame Hook. Gespeicherte Gruppen-Choreografien werden **nicht geschrieben** oder verändert.
- `smartShowCameraAssignmentsV446`: ersetzt ausschließlich **abgeleitete** Rap-Kamera-Zeilenbereiche. Autorisierte, benutzerdefinierte Rapper-Rollen und Kameraschlüsselbilder bleiben geschützt.
- `VisualizerStage.tsx`: Multi-Avatar Motion-Slot-Auswahl verwendet dieselbe Szene und Szenen-ID wie der Bühnen- und Kamera-Autopilot. So wird der fokussierte Slot musikalisch hervorgehoben, die anderen wählen – sofern passende GLBs vorhanden und die bestehende Library-Automatik aktiv ist – eher ruhigere Clip-Profile. Unterschiedliche Clips bleiben von installierten Assets abhängig.
- `types/music.ts` und `context/UiPreferencesContext.tsx`: `rapSmartShowEnabledV446` standardmäßig `true`. Ein einzelner Schalter im vorhandenen `AutoMotionIntelligencePanelV438.tsx` (Rap Performance Editor).

## Schutz und Grenzen

- **Keine zusätzlichen Abhängigkeiten**, kein Python-Server, kein Song-Upload, keine neuen API-Schlüssel.
- Song- und Künstler-Credits beweisen keine Rapper-Stimmidentität. Ein visuell betonter Avatar ist deshalb **nicht automatisch der tatsächliche Sänger**. V385-/V416-Zuordnungen, manuelle Timelines, Motion/GLB-Edits, Kamerakeyframes, manuell konfigurierte Bühnenaufstellungen und Reduced-Motion-Vorgaben bleiben vorrangig.
- Kein garantierter automatischer GLB-Tanzwechsel, wenn die vorhandene Motion-Library-Automatik deaktiviert ist oder passende installierte Clips fehlen. Ohne Lyrics und ohne bekannte Songdauer gibt es keinen neuen V446-Szenenplan.
- Die separate, opt-in V445-Klangwechsel-Heuristik wird weder zur Künstlererkennung umfunktioniert noch zum Show-Autopiloten vorausgesetzt.

## Bedienung

Rap Performance Editor → Automatic Motion Intelligence → **V446 · Smart Automatic Rap Show** → `Show-Autopilot verwenden (empfohlen)` (standardmäßig an). Für automatische GLB-Clipwechsel zusätzlich wie bisher `Vorhandene Motions automatisch kombinieren` und die automatische Motion-Library aktivieren.

## Tests

`npm run test:v446`, `npm run verify:v446`; die vollständige React-/Next.js-Kompilierung benötigt installierte `node_modules` und muss in der Zielumgebung zusätzlich laufen.
