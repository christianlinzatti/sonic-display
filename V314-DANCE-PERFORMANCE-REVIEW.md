# Sonic Display V314 – Dance Performance Review Studio

## Ziel

Eine **beobachtende, nicht selbst optimierende** Auswertung, damit Kamera, Show-Licht und zusätzliche Tanzbewegungen objektiver besprochen werden können. Das Studio ändert keine Tänzerbewegungen, importierten GLB-Clips, Kamerakeyframes oder Licht-Timelines.

## Öffnen

Settings → Dynamic Stage → Smart Stage Director → **Dance Performance Review Studio · V314**. Die Session zeichnet bei laufenden Tracks und aktivem Avatar-Visualizer automatisch höchstens alle 1,25 Sekunden einen Snapshot auf. Aufzeichnung kann pausiert/fortgesetzt werden; „Session zurücksetzen“ entfernt die bisherigen Daten. Zwischen „ganzer Verlauf“ und „letzte 60 Sekunden“ wechseln. CSV und JSON lassen sich direkt aus dem Browser exportieren.

## Daten und Messgrenzen

* **Musikenergie / Kick:** Bereits im Sonic Display ausgewertete Audiomerkmale (je nach Einstellung Mikrofon oder Schätzdaten, *keine* Spotify-Audio-Streamingdaten).
* **Tanzbewegung:** Tatsächlich im Rig berechnete **additive** Bewegungswerte aus V311 bei GLB- und prozeduralen Avataren. Nicht die vollständige kinetische Energie eines importierten Animationsclips.
* **Beat-Reaktion (Proxy):** Additive Bewegungsaktivität an erkannt starken Kick-Samples. Keine millisekundengenaue Beat-Onset-Abweichung, kein objektiver Sync-Score und keine verlässliche Aussage über eingespielte GLB-Bewegungen.
* **Fußimpulse bei Kontakt:** Zusätzliche Fußbewegung, während die Fuß-IK „planted“ signalisiert (nur GLB). Kein 3D-Fußrutsch- oder Balance-Motion-Capture-Test. Niedriger ist tendenziell ruhiger, aber **keine** allgemeingültige Gut/Schlecht-Note.
* **Kamera-/Effektanalyse:** Beobachtet die automatisch erzeugten V306/V310/V313-Cues. Eigene Kamera-Timelines, manuelle Presets oder tatsächliche WebGL-Lichthelligkeit sind damit nicht durchgängig messbar.
* **Beat-Lock-Vertrauen:** Nur angezeigt, wenn die Audioanalyse tatsächlich `phaseLocked` meldet. Sonst steht „—“.

Die automatischen Hinweise identifizieren kurze Kamerawechsel, eine für mehr als 45 Sekunden unveränderte automatische Perspektive, starke Sprünge der generierten FX sowie erhöhte FX im Break oder zusätzliche Fußimpulse trotz Kontakt. Sie sind **Prüfanregungen**, keine Diagnose eines defekten Tanzes.

## Performance und Datenschutz

* Alles in einem kleinen In-Memory-Modul, **ohne Speicherung in localStorage, Upload oder Telemetrie-Netzwerk**.
* Maximal 480 Samples des jeweils aktuellen zusammenhängenden Songsegments (~10 Minuten bei 1,25-Sekunden-Sampling); beim Trackwechsel oder Titelsprung wird ein neues Segment begonnen.
* Avatare aggregieren vorhandene V311-Werte ungefähr viermal pro Sekunde, **kein separates Mesh, kein 3D-Readback und keine Per-Frame-React-Updates**.
* Dashboard aktualisiert sich alle 1,6 Sekunden. Pause erzeugt keine neuen Samples. Bei ausgeschaltetem Avatar-Visualizer wird nicht aufgenommen.
* Exportierte Dateien bleiben unter Kontrolle der Person, die sie aus dem Browser herunterlädt.

## Testen

```bash
npm install
npm run test:v314
npm run verify
```

`npm run verify` führt neben Offline-Tests auch Präflight, Typcheck und `next build` aus. Ohne installierte Next.js-, React- und Three.js-Abhängigkeiten lässt sich der vollständige Build nicht verifizieren.

## Dateien

* `components/visualizer/dancePerformanceReviewV314.ts`: getrennte, begrenzte Erfassung und Auswertung
* `components/visualizer/DancePerformanceReviewStudioV314.tsx`: Diagramm, Metriken, Hinweise, CSV/JSON
* `components/visualizer/VisualizerStage.tsx`: React-Effect-Observationspunkt nach Show-Regie
* `components/visualizer/ThreeAvatar.tsx`: gedrosselte additive Bewegungsdaten von GLB/prozeduralen Avataren
* `tests/v314-performance-review-regression.cjs`: Telemetrie-, Schranken-, UI- und Regressionschecks
