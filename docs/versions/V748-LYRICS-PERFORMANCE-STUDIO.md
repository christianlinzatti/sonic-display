# V748 – Lyrics Performance Studio

Erweiterung von V747 (Cinematic Camera Director), ohne Änderungen an den Kamera-, Audio-, Vocal- oder IK-Algorithmen.

## Funktionen

- Gemeinsamer, deterministischer `lyricsPerformanceStudioV748.ts`-Planner für DOM-/2D-Karaoke und Drei.js-Lyrics.
- Verifizierte Wortzeitstempel lösen kurze, begrenzte zusätzliche Wortakzente aus. Ohne valide `words` entstehen **keine künstlichen wortgenauen Markierungen**. Die vorhandenen Füllstände und Zeitmarken werden nicht verändert.
- Hook-/Drop-Akzente nur bei bereits bekannter Songabschnitt-Zuordnung. Keine Ableitung aus willkürlichen Textwörtern und keine neuen Timings.
- Kontrast-/Lesbarkeitsschutz durch zusätzliche Mindest-Plate-Deckkraft, begrenzte Textbreite und einen sanften Outline-Bonus im 3D-Modus. Bei Mehrpersonen-Bühne und aktivem Sängerfokus wird vorsichtiger begrenzt. Der tatsächlich gerenderte Kamerablick wird nicht neu vermessen; die finale Kamera-/Lyrics-Schutzfunktion von V747 bleibt unverändert.
- Einstellung `Anzeige → Lyrics Performance Studio V748`: Aktivierung, Gesamtstärke, Lesbarkeit, Wortakzente, Hook-/Drop-Akzente. Ausgeschaltet bleiben ursprüngliche Breiten und Textplatten unverändert.
- `reducedMotion` und Pause unterdrücken neue Bewegungseffekte; statischer Lesbarkeitsschutz darf erhalten bleiben.
- Keine weiteren Server, externen APIs, Audio-Heuristiken oder Avatar-Dateien erforderlich.

## Wichtig für die Abnahme

V748 ist eine visuelle Ergänzung der vorhandenen Lyrics-Darstellung. Ein echter Browser- und GLB-Test sowie ein vollständiger Projekt-Typcheck und Next.js-Produktionsbuild sind weiterhin erforderlich, bevor dieser Stand als produktionsverifiziert gelten kann. Für V748 liegen reine Quellcode-/Mathematiktests und isolierte TypeScript-Typprüfung vor.
