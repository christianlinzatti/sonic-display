# V750 – Integrated Concert Quality & Performance

## Ziel

Die V735-V749-Erweiterungen erzeugen bereits saubere, getrennte Tanz-, Gesangs-, Kamera-, Licht- und Lyrics-Effekte. V750 koordiniert **nur ihre zusätzlichen automatischen Intensitäten**. Statt weitere GPU-Objekte oder eine zweite Regie-Engine zu bauen, gibt es einen gemeinsamen, überprüfbaren Show-Budget-Plan.

## Gemeinsamer Ablauf

1. `VisualizerStage.tsx` übernimmt die vorhandenen Abschnittsmarken (V318), Track-Zeit, tatsächliche Ensemble-Größe, sichtbare/synchronisierte Lyrics, die aus V528 validierte Vocal-Szene, das bereits berechnete V670-Wiederholungsmerkmal und die aktuelle **Profilstufe** (low/balanced/high).
2. `integratedConcertQualityV750.ts` bewertet die **inhaltliche Komplexität**, nicht die tatsächliche GPU-Zeit. Dichte synchronisierte Lyrics und 3/4 Performer geben zunächst den zusätzlichen Kamera-/Lichtakzenten weniger Raum. Bei bestätigtem Sänger priorisiert V750 den visuellen Vocal-Fokus gegenüber automatischen Kamerafahrten.
3. Ein gemeinsamer und reiner Plan enthält `camera`, `lighting`, `dance`, `vocal`, `lyricsAccent`, `readabilityBonus`, `mode` und eine **heuristische** Belastungskennzahl `pressure`.
4. Der Plan wird an den **bereits vorhandenen Engines** umgesetzt:
   - V747: Nur die zusätzliche automatische Kamera-Regiestärke wird reduziert, die vorhandenen V351/V540/V550-Framing-Schranken bleiben in Kraft.
   - V749: Nur die Zusatzstärke wird reduziert; alle vorhandenen Lichter, Timelines und Blackouts behalten ihre Priorität.
   - V748: Bei echter Lyrics-Anzeige ggf. stärkere Lesbarkeit, geringere optionale Wort-/Hook-Glows. Wort-Zeitstempel werden **nie** synthetisch erzeugt; bereits vorhandener Karaoke-Modus bleibt erhalten.
   - V735/V742-V745: Reduzierung nur der automatischen prozeduralen Hüft-Grundstärke in den vorhandenen GLB-Overlays. Manuelle Auswahl, GLB-Animationen und bestehende Foot-IK bleiben unverändert.
   - V746: Reduzierung nur des **zusätzlichen** Oberkörper-/Gestik-Anteils. Lippen, Phoneme, Sängerrollen und Face-Rig werden nicht modifiziert.
5. Die DOM-Attribute `data-v750-mode`, `data-v750-reason` und `data-v750-pressure` ermöglichen die Inspektion der Entscheidungen ohne zusätzliche Animation-Frames. Diese Werte sind **keine** FPS-, GPU- oder Pixelmessungen.

V750 ist deterministisch und nutzt die aktuelle Songzeit; es werden weder `setInterval` noch `Math.random` noch neue Renderpasses, GPU-Leuchten oder zusätzliche `useFrame`-Schleifen eingeführt. Abschnittsmarkierungen aus V318 müssen vorhanden sein, andernfalls bleibt der Zustand `balanced` – V750 **erfindet** weder Hooks noch Sprechende.

## Einstellungen

Unter **Einstellungen → Dynamic Stage → V750 Integrated Concert Quality & Performance** können die automatische Qualitätsregie, Intensität, Lyrics-Schutz, Sänger-Priorisierung und komplexitätsabhängige Rücknahme gewählt werden. Default ist aktiviert, ohne individuelle manuelle Einstellungen zu überschreiben. Deaktiviert oder bei Stärke 0 ist die Budgetausgabe vollständig neutral.

## Manuelle Priorität / Sicherheitsregeln

- Keine globalen Änderungen gespeicherter Einstellungen (nur im Render abgeleitete Profile).
- Manueller Tanz, explizit festgelegter Hip-Modus, GLB-Clips, gespeicherte Kamerafahrten, Light-Timelines und Blackouts behalten Vorrang.
- Pause, Reduced Motion und ungültige Track-/Zeitdaten schalten die Zusatzsteuerung aus.
- No-Singer-Fallback: Ohne geprüfte Sängerinformationen gibt es keinen Vocal-Kamera-Fokus.
- Foot-IK läuft weiterhin nach dem Rig-Motion-Pass; V750 verändert keinerlei Foot-IK-Parameter.

## Grenzen

V750 misst weder Frames pro Sekunde noch GPU-Auslastung oder tatsächlich verdeckte Pixels. `tier=low` ist nur ein bereits existierendes **Leistungsprofil**, kein neuer Performance-Messwert. Die Anwendung wurde hier aufgrund fehlender React/Next/npm-Pakete nicht im Browser auf dem echten GLB getestet. Auch die tatsächliche Wirkung der neuen Budgets auf animierte Lyrics bleibt visuell zu verifizieren.
