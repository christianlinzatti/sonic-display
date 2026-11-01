# Sonic Display V781 – Motion Smoothness Benchmark

Basis: vollstaendiges V780-Projekt, ausschliesslich additive, opt-in Bewegungsauswertung.

## Neu

- `services/monitoring/motionSmoothnessV781.ts`: dependency-freier, strikt validierender Bewegungsanalysator.
- `components/visualizer/ConcertBenchmarkV777.tsx`: **nur bei `motionV781=1` und waehrend eines aktiven Tests** werden nach dem bestehenden AnimationMixer- und Morph-Update Welt-Rotationen von Huefte und Oberkoerper, Mund-Morph-Zustand, synthetischer Vokal-Sollwert sowie vorhandene benannte Fussknochen erfasst. Die bestehenden Live-Animationen werden nicht veraendert. Im V781-Messmodus beginnen alle Durchlaeufe mit demselben logischen Clip- und Mund-Startzeitpunkt; dies ist eine eigene reproduzierbare Mess-Fixture und kein identischer V777-Performance-Lauf.
- `scripts/v777-concert-benchmark-browser.cjs`: optionaler `--motionV781`-Schalter im realen lokalen Chromium-Durchlauf; V777-Berichte sind weiterhin unveraendert und V780-Screenshots bleiben getrennt.
- `scripts/v781-motion-smoothness.cjs`: sechs echte Browserlaeufe in gegenlaeufiger Profilreihenfolge; zwei gemessene Durchgaenge mit je sechs Buehnen-/Avatar-Szenen pro Lauf. Der Offline-Assessor kann gespeicherte `runs.json` erneut auswerten.
- `app/diagnostics/motion-smoothness/page.tsx`: lokale, nur lesende JSON-Dateiauswahl, Vergleichstabelle und Warnungen. Keine Datenuploads, keine dauerhaft geaenderten Einstellungen.

## Kennzahlen und Grenzen

| Metrik | Interpretation |
|---|---|
| Pose-Holds % | Anteil nahezu unveraenderter benannter Hueft-/Spine-Rotationen in benachbarten gerenderten Frames. Eine kuenstlerisch gewollte Ruhepose kann denselben Wert erzeugen. |
| P95 Pose-Step / Pose-Jerk (Grad) | Groesse und Aenderung aufeinanderfolgender Welt-Rotationsschritte. Heuristischer Indikator fuer Spruenge, kein validiertes biomechanisches Mass. |
| Frame P95 / P95 Framezeit-Differenz (ms) | Echte WebGL-Framezeiten und deren Ungleichmaessigkeit (vom Browser gemessen). |
| Mund-Holds % | Anteil unveraenderter Mouth-Morphs trotz merklich geaendertem **synthetischem** Vokalsignal. |
| Vokal-MAE | Durchschnittliche absolute Abweichung des Mouth-Morphs von der synthetischen Vokal-Amplitude (kein Phonem-Sync). |
| Fussrutsch-Ereignisse | Horizontalbewegung benannter Fussknochen waehrend **geschaetzter** Bodenkontakte durch Hoehen-Perzentil. Keine echte Kontakt-/IK-Kraftmessung. |

Die Referenz-GLB V777 hat **keine Fussknochen**. Darum wird dort Fussrutschen nicht als 0 ausgegeben, sondern als `null` (`nicht messbar`). Bei komplexen eigenen GLBs haengen Erkennung und Skala von den benannten Foot/Ankle-Knochen ab. Unterschiedliche Rig-Namenskonventionen koennen zu fehlender Erkennung fuehren. Alle Metriken bleiben bewusst *Hinweise*, keine automatische Qualitaetszertifizierung. Die gesamte Audio-/Lyrics-Folge ist weiterhin synthetisch, keine reale Spotify-Session.

## Voraussetzungen

Im Projektordner:

```bash
npm ci
npm run typecheck
npm run build
npm run start
```

In einem zweiten Terminal:

```bash
npm run benchmark:v781:motion -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb
```

Die GLB vorher unter `public/benchmark/mein-avatar.glb` ablegen. Sie braucht einen Animationsclip, ein skiniertes Rig und benannte Mund-Morph-Targets, wie schon in V777. Fuer die optionale Fussanalyse sollten links/rechts Foot-/Ankle-Knochen benannt sein. Optional: `--glb2=/benchmark/zweiter-avatar.glb`, `--frames=180`, `--warmup=60`, `--chromium=/pfad/zu/chromium`, `--out=artifacts/v781/motion-review.json`.

Es entstehen `artifacts/v781/runs.json` sowie `artifacts/v781/motion-review.json` und `.md`. In `runs.json` stecken ausschliesslich reale Browser-Berichte, keine geschaetzten FPS/Posen. Bei fehlendem Server/GPU/GLB oder einer inkonsistenten Testumgebung wird der Bericht **blockiert** und es gibt keine Empfehlung.

Offline erneut auswerten:

```bash
npm run benchmark:v781:assess -- --input=artifacts/v781/runs.json --out=artifacts/v781/review-neu.json
```

Alternativ die `runs.json` unter `/diagnostics/motion-smoothness` lokal auswaehlen.

## Qualitaetspruefung

```bash
npm run test:v781
npm run test:v781:types
npm run verify:v781:static
npm run typecheck
npm run build
```

Tests enthalten synthetische **Unit-Test-Daten** fuer isolierte Berechnungen. Diese dienen ausschliesslich der Algorithmuspruefung und werden **niemals** als Browser-Messwerte oder reale Avatar-Beurteilungen ausgegeben. Ein echter GPU-/Browser-Lauf ist separat erforderlich.

## Folgeschritt V782

Gemessene Hold-Ratios und Pose-Jerks nutzen, um Zwischenframe-Interpolation im Performance-Modus auf visuellen Nutzen und Latenz zu pruefen. Keine Aenderung der Tanzqualitaet ohne Vorher-Nachher-Messung.
