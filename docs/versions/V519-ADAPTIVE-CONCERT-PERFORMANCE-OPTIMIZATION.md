# Sonic Display V519 – Adaptive Concert Performance Optimization

## Zweck

Aus **echten, mindestens sechs zusammenhängenden V518-Render-Messfenstern** der laufenden Hauptbühne konkrete **manuelle** und überprüfbare Schritte für Deutschrap-/Hardstyle-Konzerte auf dem Raspberry Pi ableiten. Keine prognostizierten FPS-Gewinne und keine automatischen Einstellungen.

## Umsetzung

- `services/monitoring/concertOptimizationAdvisorV519.ts`: reine Funktionen zur Validierung einer V518-Capture, Einordnung der FPS/P95-/Slow-Frame-Last gegen wählbares 30-/45-/60-FPS-Ziel, priorisierte Vorschläge mit Messbezug und Schutzbedingungen.
- Die manuelle Reihenfolge berücksichtigt High/DPR, Pi-Effektbudget, reaktives Licht, die Anzahl von 3–4 Avataren und optional eine isolierte vereinfachte Lyrics-Anzeige. **Lip-Sync, Fußkontakt, importierte GLB-Animationen, manuelle Choreografien bleiben unberührt.** Das Studio schreibt keinen Konfigurationswert.
- `components/visualizer/PiConcertOptimizationAdvisorV519.tsx`: visuelle Empfehlungen und Auswahl zweier vorhandener Captures mit Angabe, ob **keine, eine oder mehrere** der erfassten Render-Einstellungen abweichen. Zeigt FPS- und schlechtestes Fenster-P95-Differenzen. Selbst eine Einzeländerung liefert nur Beobachtungen, **keinen Kausalbeweis**. Der Spieler wählt die Einstellungen weiterhin im vorhandenen UI.
- Integration direkt im `PiConcertPerformanceStudioV518.tsx`; keine neue WebGL-Szene, kein eigener Timer oder `requestAnimationFrame`, keine zusätzliche Hintergrund-/Native-Telemetrie.

## Grenzen und Interpretation

- Das Ziel 30/45/60 FPS ist ein **manuell wählbarer Zielwert**, kein garantiert erreichbarer Grenzwert.
- FPS, Slow Frames, Draw Calls und Dreiecke sind Browser-Renderdaten. `worstWindowP95Ms` ist ein Maximum der Fenster-P95-Werte und keine gepoolte Frame-P95. Engpasshinweise sind heuristisch; hohe Draw Calls/Dreiecke sind keine gemessene GPU-Zeit.
- Weder Songpassage noch Gerätetemperatur, Pi-RAM, GPU-Last oder Betriebssystem-Hintergrundlast werden automatisch kontrolliert. Captures mit mehreren Änderungen sind **vermischt**. Beim Test möglichst dieselbe Songpassage und Bühnenumgebung beibehalten; nur **eine** Einstellung auf einmal ändern und erneut mindestens sechs stabile Fenster erfassen.
- Fehlen gültige Messwerte, werden keine Optimierungsempfehlungen ausgedacht. Favorisierte Sängerrollen, Lyrics-Lesbarkeit, Lip-Sync und Tanzqualität gehen vor aggressiven Einsparungen.

## Tests

`npm run test:v519`, `npm run test:v519:types`, historische Regressionen, Syntax/Architektur, GLB-Modulprüfungen. `npm run build` zusätzlich im lokalen Node-Projekt mit installierten Dependencies ausführen. Ein echtes Pi-Benchmark ist nicht Teil der Offline-Tests.
