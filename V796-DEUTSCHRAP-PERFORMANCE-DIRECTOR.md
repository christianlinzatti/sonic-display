# Sonic Display V796 – Deutschrap Performance Director

## Was wurde implementiert?

V796 erweitert die bereits vorhandene, zeitlich synchronisierte Rap-Performance aus V437 um eine **deterministische Phrasenregie**. Die neue Datei `components/visualizer/deutschrapPerformanceDirectorV796.ts` ermittelt aus dem vorhandenen, trackgebundenen V437-Zeilenplan eine kurze Performance-Charakterisierung und passt die **bestehenden** Animations- und Ausdrucksstärken an.

- **Verse:** Zurückhaltendere, auf die Rap-Zeile abgestimmte Bewegungen und vier wiederverwendbare, songgebundene Phrasenvarianten.
- **Hooks:** Etwas stärkere Körper-/Gestenakzente; ein zusätzlicher Höhepunktbonus wird nur bei bestätigtem V790-Konzertbogen vergeben.
- **Antworten und Duette:** Eigene Kennzeichnung und Ausdrucksvariation nur bei vorhandenen manuell zugeordneten Zeilenrollen (V416). Es findet keine automatische Erkennung eines Sängers statt.
- **Gestencharakter:** Die Varianten „grounded“, „address“, „emphasis“ und „open“ verändern die bereits vorhandene Gestenstärke und Variationswerte; es werden **keine neuen GLB-Clips oder eigenständigen Knochenanimationen** erzeugt.
- **Vocal-Ausdruck:** Geringfügige, begrenzte Anpassung der bestehenden Gesichts- und Body-Gestenstärken; die eigentliche Mund-/Lippensynchronisierung bleibt vollständig unverändert.

## Integration

`VisualizerStage.tsx` nutzt das V437-Lyrics-Planobjekt und das V437-Live-Cue sowie optional die V790-Szenenregie. Der neue Planer wird ohne zusätzlichen Render-Loop aufgerufen. Die verfeinerten Werte fließen in vorhandene Props für die Avatare ein. Die Quelle lässt sich über `data-v796-phrase` und `data-v796-source` diagnostizieren.

Die Zeilenzeit und Zeilenidentität werden per binärer Suche gegen die aktuelle Wiedergabeposition geprüft. Bei Songwechsel, Seek in eine Lücke, fehlenden synchronisierten Lyrics oder Genre außerhalb Rap wird keine neue Performance erzeugt.

## Prioritäten und Sicherheit

Manuelle Tanzclips, Zeitachsen, Blend-Konfigurationen und Hip-Modi unterdrücken automatische Tanzänderungen. Manuelle Vocals oder Silbenkorrekturen unterdrücken automatische Gesichts- und Body-Stärken. Reduced Motion und niedrige Performance-Stufe deaktivieren V796, mittlere Stufe und sichtbare Lyrics reduzieren die Intensität. Die berechneten Werte werden begrenzt, ohne Layer oder gespeicherte Konfigurationen zu überschreiben.

**Nicht enthalten:** echte Adlib-/Sängererkennung, neue Motion-Capture-Gesten, neue GLB-Dateien, Audio-Stem-Trennung, automatische Phonemzuordnung. Dafür wären zusätzliche verlässliche Daten erforderlich.

## Testen

```bash
npm ci --no-audit --no-fund
npm run test:v796
npm run test:v796:types
npm run typecheck
npm run build
```

Zusätzliche Ergebnisse und fehlende Umgebungsabhängigkeiten: `V796-VERIFICATION.md`.
