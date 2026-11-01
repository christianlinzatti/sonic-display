# V800 – Concert Experience Milestone (31.10.2026)

## Umfang

Das Milestone bündelt die bisherigen Konzertverbesserungen V790–V799, **ohne** eine
zweite Show-Engine einzuführen. Der bestätigte V790-Szenenplan ist weiterhin die
einzige Quelle für die zeitliche Struktur; live geschätzte Verse/Hooks werden
nicht als bestätigte Songmarken ausgegeben.

### Whole-Song-Audit

`auditConcertExperienceV800` prüft bereits beim Song-/Planwechsel:

- Wie viel der Songlaufzeit tatsächlich durch bestätigte Storyboard-Szenen
  abgedeckt ist; Lücken bleiben Lücken.
- Ob der V790-Haupthöhepunkt überhaupt repräsentiert ist und welche sekundären
  Hooks vorhanden sind.
- Wie oft derselbe Kamera-Intent unmittelbar hintereinander erscheint.
- Ob der Showplan Atempausen und mindestens drei unterschiedliche Bildabsichten
  enthält; bei geringerer Vielfalt gibt es eine Diagnose statt Fantasie-Cues.

Die Warncodes sind `timeline-gap`, `under-covered`, `repeated-camera-intent`,
`weak-section-variety`, `no-breath`, `no-secondary-peak`. Ein ungültiger oder
veralteter Storyboard-Plan wird nicht genutzt.

### Szenenlokale Kontinuität

`sampleConcertExperienceV800` bildet aus der tatsächlich aktiven Szene einen
zurückhaltenden, begrenzten Ausgleich:

- Aufeinanderfolgende identische Kamera-Intents: weniger zusätzliche automatische
  Kameraunruhe, keine erzwungenen neuen Kameraperspektiven.
- Haupt-Peak: eine minimale zusätzliche, abgestimmte Anhebung der bereits
  vorhandenen automatischen Tanz-, Kamera- und Lichtkanäle.
- Neben-Hook: ein kleinerer Akzent als beim Haupthöhepunkt.
- Break: zusätzliche automatische Akzente werden reduziert; die ursprünglichen
  Bühnenobjekte oder Lichter werden nicht abgeschaltet.

Alle Ein- und Ausblendungen verwenden den originalen Song-Zeitstempel und laufen
am Szenenrand auf exakt den vorherigen Gain zurück – auch wenn der vorherige Gain
kleiner als 0,88 oder größer als 1,12 ist. V791-/V792-/V794-/V795-
Cues dürfen einer aktiven Szene nicht widersprechen. Bei Songwechsel, Seek in
nicht bestätigte Lücken, pausierter Wiedergabe, Low Tier, Reduced Motion oder
fehlender Evidenz fällt die V800-Schicht vollständig auf die bestehende
Regie zurück. Für manuelle Tanz-, Kamera- und Lichtsteuerungen bleiben die
zugehörigen Gain-Werte unverändert. Lyrics, Lip-Sync- und Vocal-Zuordnungen
werden nicht modifiziert. Der bestehende `ShowQualityGuardV670` begrenzt
anschließend weiterhin alle automatischen Gains.

### Diagnose und Leistung

Die Bühne erhält `data-v800-state`, `data-v800-moment`,
`data-v800-coverage`, `data-v800-issues` und `data-v800-scene` zur Laufzeitdiagnose.
Der Audit läuft nur bei geänderten bestätigten Showplänen; das Playback-Sampling
ist reine Arithmetik ohne neue WebGL-Objekte, Timer, Audio-Requests oder
AnimationMixer. Es gibt keine zusätzlichen Renderpässe.

## Grenzen

V800 misst keine subjektive Konzertqualität oder echte GPU-FPS und erzeugt keine
fehlenden Songszenen, Kamerapresets, Vocal-Zuordnungen, Viseme oder GLB-Clips.
Die sichtbare Wirkung ist erst nach installierten Projektabhängigkeiten und
praktischen Tests mit echten Songs und Avataren zuverlässig abnehmbar.
