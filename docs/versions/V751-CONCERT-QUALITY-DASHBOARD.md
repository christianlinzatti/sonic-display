# V751 – Concert Quality Dashboard

## Ziel / Integration

Live- und Systeminformationen klar unterscheiden statt aus Settings-Schaltern auf tatsächliche Ausgabe zu schließen. Der neue, nur lesende Bereich ist in **Einstellungen → Dashboard** (gemeinsam mit V667/V725) sowie **Einstellungen → Anzeige/Dynamic Stage** erreichbar.

**Datenfluss**: `VisualizerStage.tsx` erzeugt den bereits in V750 genutzten Qualitätsplan und erstellt daraus mit `concertDashboardProjectionV751.ts` eine reine Statusprojektion. `concertDashboardStoreV751.ts` stellt sie per `useSyncExternalStore` bereit und begrenzt gleichbleibende Aktualisierungen auf maximal 1 Hz. Im UI `ConcertQualityDashboardV751.tsx` werden sieben Systeme mit Einstellungen, aktuellem Zustand und Begründung angezeigt:

1. Integrierte Qualitätsregie V750
2. Tanz und prozedurale Akzente
3. Gruppen-/Ensembleplanung
4. Vocal-Performance mit bestätigter Zuordnung
5. Cinematic Camera
6. Lyrics-Performance
7. Concert Lighting

**Statusdefinitionen:** `Konfiguriert` bedeutet, dass die interne Konfiguration für das Modul verfügbar ist, **nicht**, dass das zugrundeliegende GLB-Rig oder ein externer Dienst geprüft wurde. `Aktiviert` ist der relevante Settings-Schalter. `Automatisch vorgesehen` zeigt nur die geplante Regie bei Wiedergabe, niemals eine gemessene, tatsächliche Ausführung. `Bereit – aktuell kein Eingriff` weist auf fehlende Voraussetzungen wie Sängerzuordnung, synchronisierte Lyrics oder nur einen Avatar hin. `Manueller Vorrang` macht einen bewussten Override sichtbar. Bei Pause, Reduced Motion oder deaktivierter 3D-Bühne wird keine Live-Wirkung behauptet.

## Echte Messwerte ausdrücklich getrennt

Die bestehende freiwillige **V466-WebGL-Probe** misst tatsächlich Renderer-FPS, P95-Frame-Time, Draw Calls und projizierte Avatar-Kopfpositionen. Sie wird im V751-Dashboard **nur dann angezeigt, wenn die Probe aktuelle Werte liefert** (höchstens 5 s alt). Der Button „WebGL-Qualitätsmessung auf der Bühne öffnen“ fordert über ein clientseitiges Event das Öffnen der existierenden V466-QA-Probe auf der 3D-Bühne an; das Dashboard erzeugt keine zweite Probe und startet keine Messung ohne aktiven Renderer. Kein GPU-Auslastungswert, keine Bild- oder Gesichtsokklusionsmessung, keine Behauptung erfolgreicher Lip-Sync-Verifikation.

Das V750-`pressure` ist ein **Planungsheuristikwert, kein FPS/GPU-Messwert**. V750-Faktoren stellen maximal eine Dämpfung der prozeduralen Zusatzeffekte dar. Manuelle Kamera-/Licht-Timelines, GLB-Clips, echte Phoneme und Foot-IK werden vom Dashboard nicht geändert.

## Datenschutz, Performance und Grenzen

- Es werden **weder Songtitel, Track-IDs, Lyrics noch die Messhistorie gespeichert**, übertragen oder in `localStorage` geschrieben. Der Zustand liegt lediglich im flüchtigen Browsermodul.
- Die Stage benötigt keinen neuen Animations- oder Audio-Loop; bei unverändertem Status wird die Veröffentlichung auf 1 Hz begrenzt.
- Die laufende UI aktualisiert ihre Freshness-Anzeige sekündlich nur, während sie eingeblendet ist.
- Nach mehr als 5 Sekunden ohne Stage-Signal zeigt die UI „Kein aktuelles Signal“; WebGL-Messwerte werden nach 5 s nicht weiter als aktuell dargestellt.
- Die Zustandsprojektion beweist nicht, ob ein Licht sichtbar war, eine GLB-Animation abgespielt wurde oder Lyrics pixelgenau überlappungsfrei gerendert wurden.

## Reproduzierbarkeit

`npm run test:v751`, `npm run test:v751:types` und `npm run test:v751:ui-types` prüfen Status- und Evidenzlogik, 40.000 simulierte Szenen, die React-Oberfläche (isolierter TS-Check) und das Routing. Ergänzend `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case` und die älteren Regressionen. **Vor einer Produktionsfreigabe** müssen mit installierten Abhängigkeiten `npm run typecheck` und `npm run build` erfolgreich laufen sowie ein echter Browser-/WebGL-Test durchgeführt werden.
