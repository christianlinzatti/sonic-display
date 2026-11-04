# V629 – Intelligent Song Dramaturgy

## Ziel
Ein durchgehender, abwechslungsreicher Konzertbogen über **mehrere Minuten** – weniger identische Refrains, erkennbare Ruhephasen und ein durch belegte Songstruktur getragenes Finale. Kein paralleler Regie-Timer, keine zufälligen Schnitte und kein zusätzlicher 3D-Effekt.

## Implementierung

- `components/visualizer/intelligentSongDramaturgyV629.ts`: `planIntelligentSongDramaturgyV629` kompiliert einmal pro Song den **vollständig V600/V604-verifizierten** Aktplan. Dabei werden Abschnitte, zeitliche Sortierung, Wiederholungen, Kapitel, Ende und Songidentität überprüft. Daraus entstehen nur **editoriale Etiketten**, keine neuen Audio-, Lyrics-, Sänger- oder Kamera-Cues.
- **Erster Hook**: Ensemblefokus. **Zweiter**: ruhigerer Performer-Fokus. **Dritter**: Dialog-/Kontrastschwerpunkt. Weitere Hooks wechseln konservativ und deterministisch. Identische Songs/Seeks erhalten dieselben Ergebnisse.
- **Release/Recovery** nach einem tatsächlich belegten Hook-/Drop-Abschnitt: weniger dekorative Bewegungen, ruhigeres Framing, bewusst reduzierte Lichtintensität. Builds und Breaks behalten ihre eigenen dramaturgischen Rollen.
- **Finale** nur dann, wenn der vorhandene V604-Plan ein tatsächlich bestätigtes letztes Songkapitel mit Ende-Evidenz enthält. Aus dem bloßen Erreichen der letzten Sekunden wird **kein Finale erfunden**.
- `sampleIntelligentSongDramaturgyV629` akzeptiert ausschließlich zum Live-Track und zur Live-Sektion passende V604-Cues sowie den aktiven V628-Score. Bestehende Multiplikatoren werden lediglich klein, begrenzt und mit einer Nullamplitude an jedem Abschnittsrand verändert.
- `VisualizerStage.tsx`: Vorberechnung `useMemo` über `fullSongPlanV604`, anschließende Abtastung im bereits vorhandenen Renderzyklus. Nur das Resultat `concertStoryV629.cue` wird als bisheriger gemeinsamer `concertDramaturgyV623` an die vorhandenen Tanz-, Kamera-, Lyrics- und Lichtverbraucher geliefert. Zusätzlich stehen reine Diagnoseattribute `data-v629-beat`, `data-v629-emphasis` und `data-v629-hook` zur Verfügung.

## Sicherheitsgrenzen

**Keine neuen** GLB-Animationen, Lichtquellen, Shader, Kamera-Rig, Audio-Erkennung, Phoneme, Beat-Schätzungen, Künstlerrollen, Bühnenmodelle, Zeitgeber oder Renderloops. Manuelle Tanz-, Kamera- und Beleuchtungsvorgaben werden unverändert durchgereicht. Bei geschützten Lyrics oder Vokalfokus werden Kamera, Tanz und dekorative Beleuchtung nur noch zurückhaltender; unbestätigte Drops gewinnen keine zusätzliche Tanzenergie. V351-Framing- und V621-Lichtbudgetprüfungen bleiben letzte Autorität. Pause, Reduced Motion, Low-Tier, Trackwechsel, Seek-Lücken und widersprüchliche Metadaten deaktivieren die neue Schicht.

## Verifikation

`npm run test:v629`, `npm run test:v629:types`, `npm run test:smoke:v629`, `npm run verify:v629`. Für echte Freigabe außerdem `npx tsc --noEmit` und `npm run build` auf einem Rechner mit installierten Abhängigkeiten sowie visuelle Ganzsong-Prüfungen mit realen GLB-Avataren, synchronisierten Lyrics und mehreren Genres. **Die synthetischen Regressionstests sind keine visuelle Qualitätsmessung**.
