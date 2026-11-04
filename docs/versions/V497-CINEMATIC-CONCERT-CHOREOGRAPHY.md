# Sonic Display V497 – Cinematic Concert Choreography

## Durchgehende Gesangsregie ohne neue Renderer

V497 nimmt explizit vom Benutzer gepflegte Sänger-Zeitmarken aus V496 als Ausgangspunkt. Die deterministische, reine Funktion `planCinematicConcertV497` erzeugt gemeinsam verwendbare Regiehinweise für Solo, Duett und Hook. Sie **erkennt keine Sänger** und erzeugt keine unbekannten Zeitmarken. Ist V496 deaktiviert oder existiert kein gültiges Segment, bleibt das Verhalten von V496 erhalten.

- **Kamera**: der bestehende `StageCameraDirectorV289` wendet am Ende des automatischen Planungswegs einen dezenten FOV-/Z-Akzent auf die vorhandene Sängerfokussierung an. Manuell editierte Shots, Timeline-V354/-V400, Presets und Live-Edits haben Vorrang. Bestehende Lyrics-Schutzregeln werden anschließend weiter angewendet.
- **Beleuchtung**: `DynamicStage` verstärkt die vorhandenen Key- und Beam-Leuchten geringfügig (maximal +11%/+13%) und kann die *vorhandene* Spotlight-Position zum tatsächlichen aktiven Solo-/Duett-Tänzer verschieben. Handgeschriebene Licht-Timelines, Blackout und reduzierte Bewegung behalten Vorrang. Keine neuen Lampen/Schattentexturen.
- **Lyrics**: vorhandenes Smart Stage Composition V351/V354 wird genutzt; bei aktiver V496-Regie und Lyrics werden automatische Glow-/Beam-Werte etwas begrenzt. Keine neuen Texte, 3D-Meshes oder Lyrics-Kopien.
- **Tänzer**: V496/V495 schicken dieselben Sängerrollen bereits an Avatar-Gesten und Formation Directors. Diese bleiben zuständig; V497 schafft keine konkurrierende IK-/Choreografie-Engine.

## Schutz und Grenzen

Ohne aktive Track-ID, bei Seek außerhalb der Segmente, pausiertem Song oder unbekanntem Avatar-Slot wird die Ergänzung deaktiviert. Bei `reducedMotion` bleiben Zeitmarken semantisch erhalten, die automatischen Kamera- und Lichtakzente werden aber vollständig neutralisiert. Ein gesetztes manuelles V385-Sängerassignment verhindert die V497-Regie; die vorhandene manuelle Regie läuft unverändert. Die bestehenden V496-Live-Entscheidungen bleiben maßgeblich. Der Live-Editor aus V496 wird weiterverwendet.

## Tests

`npm run test:v497`, `npm run test:v497:types`, `npm run typecheck`, `npm run build`.

Die isolierte TypeScript-Kernprüfung ersetzt keine vollständige Next.js-Buildprüfung. Ein Sichttest mit echten GLB-Tänzern und gespeicherten Licht-/Kameracues bleibt sinnvoll.
