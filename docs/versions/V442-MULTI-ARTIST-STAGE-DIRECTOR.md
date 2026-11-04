# V442 – Multi-Artist Stage Director

Auf V441 aufbauende, nicht-destruktive automatische **Drei-/Vierer-Besetzung** für Titel mit drei oder mehr eindeutigen Spotify-Künstler-Credits.

## Verhalten

- `automaticMultiArtistStageV442.ts` ermittelt aus den Spotify-Künstlerlisten maximal vier Bühnenplätze. Doppelte Namen (auch bei unterschiedlicher Groß-/Kleinschreibung) werden zusammengefasst. `rapMultiArtistMaxV442` begrenzt die Anzahl auf zwei, drei oder vier. Unter drei Künstlern bleibt V440 zuständig.
- Die vorhandene `GroupDancersV326`-Engine rendert die drei/vier Schauspieler auf sicheren, räumlich getrennten Positionen. Die automatische Besetzung erzeugt zur Laufzeit einen zeitlich begrenzten Song-Plan mit Aufstellungen (`line`, `stagger`, `arc`, `wide`) und einem visuell rotierenden Fokus nach vier Lyrics-Zeilen. Wiederholte zusammenhängende Zeilen können eine Gruppenszene auslösen. Ohne synchronisierte Lyrics bleibt eine sichere Grundaufstellung bestehen.
- Die V441-Sprechblasen erscheinen in **allen** automatisch sichtbaren Slots und behalten Comic-/Neon-/Minimal-Stile, Intro-/Fokus-/Immer-Modus und vorhandene manuell gesetzte V416-Zuordnungen.
- Die V438/V439-Motion-Bibliothek wählt bis zu vier Clip-Verläufe unabhängig. Nicht-fokussierte Tänzer bekommen im Verse-Abschnitt einen zurückhaltenderen Abschnittsvorschlag; beim Hook werden sie gemeinsam aktiviert. Neue Clips sind nur dann wirksam, wenn die vorhandene Motion-Library-Automatik aktiv ist, passende Clips installiert sind und keine manuelle Choreografie die Automatik blockiert.
- In der Benutzeroberfläche lässt sich die Gruppenautomatik aktivieren/deaktivieren, die Höchstzahl begrenzen sowie für Avatar 3/4 optional ein anderes verfügbares Modell auswählen. Ohne Auswahl werden vorhandenes Haupt- und Partnermodell wiederverwendet. Das Studio zeigt ebenfalls bis zu vier Kamera-/Lyrics-Slots.
- Für die optionale automatische Rap-Kamera werden nur **inferenzbasierte** V436-Zuordnungen um die Slots 2 und 3 erweitert. Eine begrenzte seitliche Kameraausrichtung passt das Bild an den automatisch ausgewählten Bühnenplatz an. V430-Shot-Edits, V432-Keyframes und höhere manuelle Kameraprioritäten bleiben geschützt.

## Vorrang und Einschränkungen

Eine selbst gewählte Multi-Avatar-Formation, gespeicherte V326-Gruppenregie, ausdrücklich ausgewählte Tanzclips/Timelines, V416-Rapper-Rollen oder manuelle Kameraeinstellungen werden nicht überschrieben. Reduzierte Bewegung deaktiviert die automatische zusätzliche Gruppenbesetzung. Die Höchstzahl liegt bei **vier**; bei mehr Künstlern werden nur die ersten vier eindeutigen Credits verwendet. Keine Stimmen-Segmentierung, keine automatische Gesichtszuordnung zu realen Künstlern und keine echte Feststellung, wer welche Lyrics singt. Vier gleichzeitig geladene GLBs benötigen mehr Grafikleistung.

Die Szenen werden zur Laufzeit aus Songdaten berechnet und **nicht** als neue V326- oder V416-Bearbeitungen gespeichert. Spotify-Playback, Seek, externe Netzwerkzugriffe und vorhandene Projekteinstellungen werden nicht verändert. Gruppenmodelle lassen sich für zusätzliche Plätze optional auswählen; wenn das Modell auf dem Zielgerät fehlt, gelten weiterhin die bestehenden Renderer-Fallbacks.

## Tests

`npm run test:v442` prüft reine Besetzungs- und Group-Planung, Zeit-/Fokusauswahl, manuelle Priorität, Sprechblasen über vier Slots, konservatives Kameraframing sowie Quellcodeintegration. `npm run verify:v442` ergänzt die älteren V441–V437-Checks, Syntax-, Import- und Modulnamenprüfung und die Motion-Library-Regressionen. Ein vollständiger Next.js-Produktionsbuild und der praktische WebGL-Test mit mehreren echten GLB-Dateien sind weiterhin erforderlich.
