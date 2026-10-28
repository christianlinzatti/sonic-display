# V642 – Sonic Display Concert Edition

## Ziel

V642 ist ein vorsichtiger gemeinsamer Feinschliff für die **bereits bestehende** Konzertregie.
Das Release stellt **keine** neue Kamera, Vocal-Erkennung, Bühne, Motion-Library oder
Abspieluhr bereit. Es verhindert, dass drei automatische Effektspuren an derselben
Stelle gleichzeitig dominieren, und verbessert die Prüfbarkeit einer kompletten Show.

## Neue Regie `concertEditionV642.ts`

- Quelle: ausschließlich verifiziertes, an aktuellen Track und Songposition gebundenes
  `V600 → V604 → V623 → V628 → V629`-Material.
- Der neue Coordinator hängt **nach V629** und **vor dem gemeinsamen V623-Score** im
  bestehenden `VisualizerStage.tsx`. Alle bisherigen Verbraucher bekommen deshalb
  dieselbe vorsichtig korrigierte Cue statt vier voneinander abweichender Zusatzsignale.
- Wiederholte **bestätigte** Hooks wechseln den Schwerpunkt zwischen Tanz, Kamera
  und Lichtdekoration. Die jeweils anderen Spuren werden minimal zurückgenommen;
  es werden weder Kamerawechsel befohlen noch neue GLB-Clips ausgewählt.
- Eine nach V385/V416/V496 bestätigte V528-Sängerszene oder geschützte Lyrics hat
  Vorrang. Beleuchtung und Tanz werden moderat reduziert, ohne Rollen, Text oder
  Silben-Zeitstempel zu verändern. Die bereits vorhandene V623-Vocal-Priorität ist
  ein allgemeiner Schutzhinweis und *keine* Ermittlung der real singenden Person.
- Breaks, ruhige Verse und Builds bleiben gestalterisch zurückhaltend. Ein Drop
  wird nur als Drop behandelt, wenn die vorgelagerte V623-Regie ihn bestätigt.
- Alle zusätzlichen Werte verschwinden an echten Abschnittsgrenzen und bei Seek;
  fehlende Quellen oder Low-Tier-/Reduced-Motion-/Pausen liefern die unveränderte Cue.
- Manuelle Kamera-, Licht- und Tanzvorgaben bleiben bytegenau unverändert.

## V641 → V642: QA-Handlungsempfehlungen

`concertEditionReviewV642.ts` wertet **nur** die tatsächlich im V641-QA-Panel
aufgezeichneten Findings aus. Ein read-only Hinweisbereich empfiehlt beispielsweise:

- Bei niedrigen FPS zuerst Dekoration reduzieren und GLB-Profile vergleichen.
- Bei geometrischen Lyrics- oder Avatar-Framing-Warnungen die entsprechenden
  Stellen visuell prüfen (keine automatischen Korrekturen).
- Bei langen Kameramotiven die Aufnahme prüfen; dies ist **kein** Beweis für ein
  schlechtes Bild.
- Fehlende Songabdeckung oder GLB-Nachweise erneut aufnehmen.

Maximal acht unterschiedliche Empfehlungen; keine Fernübertragung, kein Auto-Fix
und keine Freigabe. V641 JSON-Export und die gesammelten Rohdaten bleiben unverändert.

## Dateianpassungen

- `components/visualizer/concertEditionV642.ts` – deterministischer Coordinator.
- `components/visualizer/concertEditionReviewV642.ts` – read-only Review-Hinweise.
- `components/visualizer/VisualizerStage.tsx` – gemeinsame V642-Cue im Runtimepfad;
  anonyme `data-v642-*`-Werte für lokale Diagnose.
- `components/visualizer/FullConcertQualityAuditPanelV641.tsx` – zusätzliche Hinweise
  im bestehenden, vom Nutzer gestarteten QA-Recorder.
- `tests/v642-concert-edition-regression.cjs` und
  `tests/tsconfig.v642-core.json` – Simulation, Integration, Schutz.

## Was das Release nicht beweist

Die Tests prüfen deterministische Auswahl, Grenzen und Rückfallpfade. Sie beweisen
nicht, dass ein GLB-Performer optisch natürlich wirkt, dass Lyrics im WebGL-Bild
wirklich lesbar sind oder dass eine reale GPU schneller geworden ist. Ein vollständiger
Next.js-Build braucht installierte npm-Abhängigkeiten und bleibt separat zu prüfen.
