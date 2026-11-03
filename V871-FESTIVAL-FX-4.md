# V871 – Festival FX 4.0: intelligente Sichtschutz-Koordination

**Basis:** vollständiger V870-Projektstand. Kein zweiter Renderer, kein zusätzlicher Shader, keine neu erzeugten FX-Instanzen.

## Verhalten

- `components/visualizer/festivalFxCoordinationV871.ts` legt **nach** den vorhandenen V817/V823/V825/V843/V844/V846/V847/V849/V850-Gates die automatisch genehmigten CO₂-, Schaum-, Seifenblasen-, Luftschlangen- und Finale-Cues zusammen.
- Es priorisiert einen bestehenden visuellen Schwerpunkt je bereits bestätigtem V810-Songabschnitt. Es kann ausschließlich **vorhandene** Counts, Opacities und Gain-Werte reduzieren. Es aktiviert keine Effekte und ändert weder Timings noch Musik-/Beat-Erkennung.
- Die Einstellung `festivalCoordinationV871` (Standard: `true`) schaltet diesen zusätzlichen Sichtschutz an/aus. `festivalClarityV871` (Standard: 70, 0–100) regelt den maximalen **normierten Planungs-Dichtewert** der automatischen FX. Das ist **keine** echte Bildschirmabdeckungs- oder GPU-Overdraw-Messung.
- Bei sichtbaren Lyrics, Vocal-Fokus, Nahaufnahme, vier Avataren oder Balanced-Hardware wird die Dichte zusätzlich reduziert. Besondere Sorgfalt für Deutschrap-Faces und Texte; Hardtekk-Drops behalten bei freier Bühne einen Hauptakzent.
- **Keine Veränderung von manuellen V823-Spuren**: Eine autorisierte `particles`-Spur lässt CO₂, Blasen, Streamer und Finale bitgenau bestehen, eine `foam`-Spur lässt Schaum bestehen. Explizit aktivierte V844.1-Full-Stage-Flashes bleiben unangetastet. Bei Pause, Blackout, Reduced Motion, manueller Lichtregie und Low-Tier ist die zusätzliche Koordination inaktiv; bereits bestehende Sicherheitsgates gelten weiterhin.
- Konservative Reihenfolge: Regie-Cues planen → V850/V849-Dimmung → V823/V825-Performance → Foam-V843 → **V871-Dichte-Koordination** → vorhandener Stage-Renderer. Keine zusätzlichen `useFrame`, `setInterval` oder neuen WebGL-Pässe.

## Studio / Benutzung

Im **Concert FX Studio**, Abschnitt V844, befindet sich die V871-Steuerung. Sie zeigt pro simuliertem Songabschnitt den gewählten Schwerpunkt und eine Vorher-/Nachher-Dichte an. Die Vorschau benutzt Demo-Musikwerte; echte Live-Auswertung entsteht erst im Stage-Renderer.

## Prüfung

`npm run test:v871` und `npm run test:v871:types` prüfen Koordination, Eingabe-Unveränderlichkeit, deterministisches Zurückspulen, gültige Genres/Abschnitte, Sichtschutz, manual-authored V823-Priorität, sichere An/Aus-Fälle und Stage-/Studio-/CI-Verkabelung. Ältere Festival-/LED-/Vocal-Regressionen werden unverändert weiter ausgeführt.

**Freigabestatus:** ohne installiertes `node_modules` ist weder ein vollständiger React/Next-Typecheck noch der Next.js-Produktionsbuild möglich. Nach `npm ci` unter Windows und in Ubuntu-CI `npm run verify:production:v867` ausführen. Echte WebGL-Sichtprüfung auf Zielhardware steht aus.
