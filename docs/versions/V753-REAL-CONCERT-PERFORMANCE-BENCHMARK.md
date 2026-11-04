# Sonic Display V753 — Real Concert Performance Benchmark

## Funktionsumfang

Der Performance-Benchmark ist **optional**, **rein lesend** und wird als neuer Bereich im bestehenden V751-Concert-Quality-Dashboard angezeigt (Einstellungen → Dashboard bzw. Dynamic Stage). Er verwendet die vorhandene V466-WebGL-QA-Probe und die bereits existierende `renderDiagnostics`-Pipeline. Es gibt **keinen zweiten Renderloop**, keine eigenen FPS-Schätzungen, keine automatischen Profilwechsel und keine Veränderungen an Kamera, Licht, Lyrics, Animationen oder Foot-IK.

### Bedienung

1. Die 3D-Bühne mit laufender Musik öffnen. Eine konkrete Gruppengröße (1, 2, 3 oder 4 tatsächlich geladene GLB-Avatare) wählen.
2. Im Dashboard **WebGL-Probe auf der Bühne aktivieren** auswählen; die QA-Probe muss auf der gerenderten Bühne eingeschaltet sein.
3. Die tatsächliche Avatarzahl im Benchmark-Auswahlfeld einstellen. Ein Klick auf **Messung starten** ist nur bei frischer, valider Messung und aktiver 3D-Musikwiedergabe möglich.
4. Der Recorder nimmt 12 aufeinanderfolgende, unterschiedliche Messfenster mit echten Renderer-Daten auf. Nicht geladene Avatare, Pausen, Songabschnittwechsel, veraltete Fenster oder Änderungen am Qualitätsprofil bzw. an der **physischen WebGL-Renderauflösung** unterbrechen die Messung. Ein nicht abgeschlossener Lauf geht **nicht** in den Vergleich ein.
5. Die Gruppe auf der Bühne manuell auf die nächste Anzahl umstellen und den nächsten Lauf starten. Ergebnisse (maximal vier vollständige Gruppen) werden nebeneinander angezeigt und lassen sich als CSV exportieren.

### Messwerte und fachliche Grenzen

- **FPS Ø / FPS Min:** Mittel bzw. Minimum aus den 12 echten Renderer-Telemetriefenstern; keine Benchmarksimulation.
- **Frame Ø:** Mittel der berichteten mittleren Frame-Zeiten.
- **P95-Fenster-Median:** Median aus 12 **jeweils einzeln gemessenen** P95-Framezeiten; *kein* globales P95 aller Frames.
- **Draw Calls / Dreiecke:** Mittel der gemeldeten WebGL-Renderer-Zähler.
- **Geometrien / Texturen:** Bei jedem Messfenster vom Renderer gemeldete Ressourcenanzahl; **keine** VRAM-Messung und keine Byte-Schätzung.
- **JS-Heap MB:** Nur, wenn der Browser `performance.memory.usedJSHeapSize` liefert; **keine** RAM-Gesamtnutzung, keine native GPU-Speicherbelegung.
- **Renderpixel:** Breite/Höhe des tatsächlichen `gl.domElement`-Backing-Stores; deshalb werden DPR-Änderungen korrekt als nicht vergleichbar behandelt. CSS-Canvas-Größe allein wäre hierfür ungeeignet.
- Keine echten GPU-Timestamps, GPU-Auslastung, Temperatur-, Watt- oder Thermalthrottling-Messungen. Diese Werte werden nicht erfunden.

### Vergleichbarkeit, Datenschutz und Grenzen

Messungen sind nur direkt vergleichbar, wenn Canvas-Backing-Store-Auflösung und Renderqualität übereinstimmen. Gleiche Szene, Effekte, Songabschnitt, Track, Browser und Hardware müssen **vom Nutzer** für jede Messreihe beibehalten werden. V753 stellt diese Umgebungsidentität nicht automatisch fest und behauptet daher keine universelle Hardware-Rangliste oder Raspberry-Pi-Eignung.

Das V751-Dashboard liefert nur einen Projektions-/Regieplan. Der Benchmark verwendet **ausschließlich** die von V466 gemessenen Rendererwerte und die tatsächliche Zahl geladener GLB-Slots. Fehlende oder alte Daten bleiben als fehlend gekennzeichnet. Kein Track-Name, keine Track-ID, keine Lyrics, keine Hardware-ID und keine Messung werden an einen Server geschickt oder in `localStorage` persistiert. Alle Messreihen bleiben bis zum Verlassen der Ansicht im flüchtigen React-State; der CSV-Export erfolgt nur nach Nutzerklick lokal im Browser.

### Technische Umsetzung

- `components/visualizer/realConcertBenchmarkV753.ts`: strict-TS-isolierter Mess-/Validierungs-/Vergleichskern, maximal 12 Samples pro Lauf, separate Quellenzeitstempel (`metricsAt`) zur Duplikat-Erkennung, Invalidationsbedingungen, CSV.
- `components/visualizer/RealConcertBenchmarkPanelV753.tsx`: Start/Abbruch, manuelle Gruppenauswahl, Tabelle, CSV, Wiedergabe- und Songabschnitt-Schutz.
- `components/visualizer/ConcertQualityProbeV466.tsx` und `concertQualityStoreV466.ts`: vorsichtig erweiterte Telemetrie mit WebGL-Backing-Pixeln, Renderer-Fensterzeitstempel und optionalen Ressourcen-/JS-Heap-Werten.
- `components/visualizer/ConcertQualityDashboardV751.tsx`: neue Benchmark-Ansicht im vorhandenen Dashboard.

### Qualitätsprüfungen

`npm run test:v753`, `npm run test:v753:types`, `npm run test:v753:ui-types`, `npm run verify:v753:static`, `npm run typecheck`, `npm run build`.

**Produktionsfreigabe:** Die isolierten Typprüfungen und Regressionen konnten ohne installierte Next.js-/React-Pakete durchgeführt werden. Vollständiger `tsc` und Next.js-Build bleiben bis zu einer erfolgreichen `npm ci`-Installation mit Netzwerkzugang offen. Ein echter GLB-Browser-Benchmark auf Nutzerhardware ist nicht vorgetäuscht worden.
