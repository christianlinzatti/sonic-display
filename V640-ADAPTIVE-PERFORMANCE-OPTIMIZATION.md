# Sonic Display V640 – Adaptive Performance Optimization

## Implementierung

- `adaptiveVisualBudgetV640.ts`: deterministischer Drei-Stufen-Controller.
- Gleiches vorhandenes Echtzeit-Messfenster der R3F-Kamera, keine neue
  `useFrame`-Schleife, keine zusätzlichen GPU-Objekte, keine Netzwerkanfragen.
- Ab 3 belasteten Sekunden: `full` → `trimmed` mit Cooldown, bei weiterer
  Last `minimal`; über 16 stabile Sekunden/Stufe schrittweise Erholung.
- Vor der vollständigen Drosselung des DPR werden nur freiwillige Bühnen-
  Dekorationen verringert: V635-LED-Plane, V555-Gobos/LED/Nebel, V308-Lichtschäfte.
- Die vorhandene Unsichtbarkeitslogik verhindert unnötige transparente Draw Calls.
- Manuelle Lichtprogramme und manuell ausgewählte Grafikqualität haben Vorrang;
  die Stufen beeinflussen keine Lippen- oder Tanzanimation, keine Lyrics,
  keine Kamera und keine Beat- oder Playback-Zeitmarken.
- Pausen, Hintergrund-Tabs, Übergangsphasen und nicht endliche Messwerte
  zählen nicht als Performance-Nachweis.
- Audio-Worker-Latenz und diagnostische P99-Werte werden weiterhin angezeigt,
  sind jedoch **keine GPU-Ausführungszeiten**.

## Abgrenzung

Die Simulationsregressionen zeigen ein stabiles, deterministisches Drosselungs-
und Erholungsverhalten. Sie beweisen keinen messbaren FPS-Gewinn an echter
Hardware. Messungen mit mehreren GLB-Avataren und Browser/Hardware sind ausständig.
Ein vollständiger Next.js-Produktionsbuild ist erst nach Installation aller
Projektabhängigkeiten überprüfbar.

## Prüfungen

```bash
npm run test:v640
npm run test:v640:types
npm run test:smoke:v640
npm run verify:v640
npm run build
```

**Produktionsbuild:** lokal noch zu prüfen, bis eine vollständige
Next.js-/React-Installation vorliegt.
