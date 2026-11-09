# V1136 – Kreativere lokale Choreografie

Die spätere Ganzkörper-Auswahl verwendet jetzt eine bewertende lokale Regie.
Bisher übernahm nach der intelligenten Vorauswahl häufig wieder derselbe
persönliche Standardtanz. Nach dem persönlichen Auftakt vergleicht die Regie
sechs tatsächlich vorhandene Ganzkörper-Motive nach Energie, Genre,
Persönlichkeit, Songkennung und Kontrasten zur jüngsten Bewegungsgeschichte.
Der zuletzt tatsächlich gespielte persönliche Move wird bei vorhandenen
Alternativen nicht direkt erneut gewählt. Ambient und Klassik vermeiden
kraftvolle Frontmann- und Roboter-Motive. Kräftige Drops verwenden
energetische Bewegungsfamilien und vermeiden das leiseste Fließmotiv.

Die Auswahl benutzt keine Zufallsuhr und keine zusätzlichen Netzwerkdienste.
Sie ist eine lokale Bewertungsheuristik, kein trainiertes Modell und keine
neue Audio- oder semantische Lyrics-Analyse. Dieselben Eingaben ergeben
dieselbe Entscheidung; unterschiedliche Songs erhalten unterschiedliche
Folgen. Die virtuelle Vorschaugeschichte umfasst höchstens vier Phrasen,
die tatsächlich gespielte Geschichte höchstens drei Clips.

Gemeinsame Höhepunkte ignorieren individuelle Bewegungsgeschichten und
Persönlichkeits-Seeds. So wählen gemischte Crews denselben gemeinsamen Move.
Fehlt dieser Clip, bleibt der vorhandene Fallback aktiv. Kanon, ruhige
Passagen, Refrain-Aufbau und Lesefokus behalten Vorrang. Die bewährten
Taktgrenzen, Haltezeiten und weichen Clipübergänge bleiben bestehen.

Bei späteren Refrains läuft die Antwortwelle in die Gegenrichtung. Solist,
Abstand von zwei Beats und begrenzte Körperreaktionen bleiben erhalten.
Die vorhandene Phasenglättung verhindert dabei rückwärts laufende Posen.
Bewusste Positionswechsel während einer pausierten Probe rekonstruieren den
Takt neu, damit kein alter Taktrest in die Zielpose gelangt. Die Toleranz für
Provider-Jitter bleibt auf die laufende Wiedergabe beschränkt.
Manuelle Bewegungen, Pause und Reduced Motion behalten ihre Schutzregeln.

## Bedienung und Tests

Settings → Avatar → **Intelligente Show aktivieren**. In der Show-Simulation
lassen sich Genre, Abschnitt und Energie ohne Spotify-Verbindung vergleichen.
Die neue Erklärung steht direkt bei den Crew-Einstellungen.

- `npm run test:v1136` enthält die bisherigen Show-/GLB-Tests und
  `tests/creative-choreography.cjs`: elf Persönlichkeiten × elf Genre-Gruppen,
  verschiedene Songs, Wiederholungsschutz, gemischte Gruppen, Lyrics-Vorrang,
  umgekehrte Antwortwellen und tatsächliche Takt-/Phasenplanung.
- Der neue Browserfall `tests/e2e/creative-show.spec.cjs` prüft tatsächlich
  abgespielte GLB-Clips, pausierte Zielzeiten und einen gemeinsamen Drop.
  Spotify und Lyrics werden gemockt; die vollständige CI prüft Desktop/Touch.

README und ARCHITECTURE führen dieses Update auf. Projekt-ZIPs enthalten
keine Playwright-Testberichte.
