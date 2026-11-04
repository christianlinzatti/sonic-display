# V522 – Concert Benchmark & Quality Validation

V522 baut auf der tatsächlich ausgelieferten V521-Version auf und bleibt in der vorhandenen **3D-Renderdiagnose → Raspberry Pi Concert Performance Studio**. Es werden **keine** neuen Benchmark-Kunstszenen oder WebGL-Renderer gestartet. Stattdessen legt V522 einen wiederholbaren Ablauf über den Ein-Sekunden-Messfenstern der realen, vom Nutzer abgespielten Konzertbühne an.

## Szenarien und Ablauf

| Profil | Aufwärmen | Messphase | Empfohlene Szene |
| --- | --- | --- | --- |
| Deutschrap-Feature | 5 s | 30 s | Vier Performer, verifizierte Vocal-Rollen, schnelle Verses/Hook, Lyrics und Lip-Sync |
| Hardstyle/Hardtekk-Drop | 5 s | 45 s | Vier Tänzer, harter Drop, reaktives Licht |
| Lange Konzertshow | 5 s | 180 s | Vier Tänzer, anhaltende Wiedergabe, laufende Messung der Performance und verfügbaren JS-Heap-Daten |

1. Auf dem Zielgerät und im Browser die Bühne mit echten installierten GLBs öffnen und geeignete Passage auswählen. Ein festes Grafikprofil ist für Vergleiche einfacher als Auto (Auto-Änderungen machen den Durchlauf ungültig).
2. FPS-Ziel 30, 45 oder 60 und Szenario im Studio wählen. Anzeige des tatsächlichen Profils und der Avataranzahl; **Empfehlungen werden nicht angewandt**.
3. Nach vorhandener gültiger Hauptbühnenmessung ausdrücklich den Benchmark starten. 5 Sekunden Aufwärmphase, dann die angegebene Messdauer. Musik durchgehend laufen lassen. Große Samplinglücken, Hintergrundpausen sowie Änderungen an Grafik, DPR, Avataren, Pi-Budget, Lyrics, Lip-Sync oder reaktivem Licht machen den aktuellen Lauf ungültig.
4. Dreimal **denselben Songabschnitt** mit identischer Kamera, Auflösung, Avatarbestückung und möglichst ähnlicher Gerätetemperatur abspielen. Die drei letzten erfolgreichen Messungen mit gleicher erfasster Konfiguration werden gegenübergestellt. Andere Konfigurationen werden nicht stillschweigend als Wiederholungen anerkannt.
5. Zusätzlich die vier manuellen Sichtprüfungen abhaken: Lesbarkeit, plausible Lippen-/Sängerwechsel, natürliche Tänzerbewegungen und ungestörte Bühnen-/Lichtkomposition. Diese Punkte sind keine automatische Erkennung.
6. Durchläufe optional als JSON exportieren. Maximal zwölf Sitzungsdurchläufe werden vorgehalten; keine API, Datenbank, Cloud, lokale dauerhafte Speicherung oder neue npm-Abhängigkeit.

## Kennzahlen und Grenzen

Die bestehende `AdaptivePerformanceController`-Framesammlung wird um **P99 pro Ein-Sekunden-Fenster** ergänzt; V522 führt keinen weiteren `requestAnimationFrame`-Aufruf, keine WebGL-GPU-Abfrage und keinen Timer ein. Zusätzlich enthält jede V518-Messung optional die vorhandenen Zähler für Texturen und Geometrien.

Berichtet werden gemessene durchschnittliche und minimale FPS, maximales Fenster-P95 und Fenster-P99, mittlerer Anteil langsamer Frames, Draw Calls, Dreiecke und optional das JS-Heap-Delta. **Maximales Fenster-P99 ist NICHT das P99 aller Frames über die gesamte Messphase.** Ebenso ist das Fenster-P95 keine gepoolte Perzentilkurve. Diese Ungenauigkeit wird ausdrücklich ausgewiesen. Die JS-Heap-Angabe ist Chromium-abhängig und entspricht nicht dem gesamten Raspberry-Pi-Arbeitsspeicher. GPU-Zeit, thermische Drosselung, CPU-Temperatur, tatsächliche Audio-/Bildlatenz und die Lip-Sync-Korrektheit sind damit nicht gemessen.

Die Browser-Leistungsziele werden anhand des konfigurierten FPS-Ziels, beobachteter Mindest-FPS, Fenster-P95 und des durchschnittlichen Anteils langsamer Frames beurteilt. Fehlen P99-Fensterdaten (z. B. bei älteren V518-Datensätzen), bleibt die Beurteilung eingeschränkt, statt eine erfolgreiche vollständige Messung vorzutäuschen. Selbst drei erfolgreiche Wiederholungen ergeben **nur ein vorläufig positives Browserurteil**, keinen Produktivnachweis auf einem realen Raspberry Pi oder eine Garantie für fehlerfreies Lip-Sync oder Tanzverhalten.

## Code-Pfade

- `services/monitoring/concertBenchmarkValidationV522.ts`: pure zustandsgeführte Start-, Warm-up-, Mess-, Abbruch-, Ergebnis- und Wiederholungslogik; bounded number of session records.
- `components/visualizer/PiConcertBenchmarkStudioV522.tsx`: ausdrücklich gesteuerte Messung, Ablaufstatus, Vergleich dreier Wiederholungen, Sichtcheckliste, sitzungslokaler JSON-Export. Unter `PiConcertPerformanceStudioV518.tsx` eingebunden.
- `components/visualizer/adaptivePerformance.tsx`: berechnet P99 aus derselben sortierten Frame-Dauer-Liste wie das bisherige P95; bereits vorhandene WebGL.info-Ressourcenzähler werden ohne zusätzliche Abfrage weitergereicht.
- `services/monitoring/piConcertPerformanceStudioV518.ts`: akzeptiert die neuen **optionalen** Werte, alte V518-Messungen bleiben kompatibel.
- `tests/v522-concert-benchmark-regression.cjs`, `tests/tsconfig.v522-core.json`.

## Nächste Schwerpunkte

Nach der realen Benchmark-Validierung soll die Showqualität im Vordergrund stehen: **Deutschrap-Lip-Sync**, flüssigere und persönlichere GLB-Tanzbewegungen sowie bessere, gut lesbare Wort-Lyrics. V522 führt noch keine Änderungen an diesen Animations- und Textkanälen durch.
