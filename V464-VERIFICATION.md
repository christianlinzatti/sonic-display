# V464 – Prüfbericht

## Erfolgreich

- `npm run test:v464`: deterministische vierteilige visuelle Dramaturgie aus der V446-Timeline, wiederholte Hook-Kandidaten, ruhige Zwischenphrasen, V457-Qualitätsstufen, V460-Feature-Integration, Lyrics-Priorität, Pause, Reduced Motion, Timeline-Fehler/Seek, manuelle Overrides, Licht-/Gesten-Grenzen und Energie-Floor.
- Langzeit-Simulation der **reinen Show-Logik**: 30 Minuten mit wiederholten Titelpositionen/4 Bühnen-Slots, Grenzwert- und Reproduzierbarkeitsprüfungen. Es wird kein WebGL gerendert und keine tatsächliche FPS gemessen.
- `tsc -p tests/tsconfig.v464-core.json --noEmit`: isolierte TypeScript-Kernprüfung.
- `npm run verify:v464`: V464, V463–V451, V446 sowie Syntax-, Import- und Modul-Casing-Prüfungen. Ältere V457-Testannahme angepasst: V457 liefert weiterhin den Score, V464 ergänzt erst danach automatische Akzente.
- Archivvergleich mit V463 (Dateipfade) und ZIP-CRC-Test.

## Nicht nachgewiesen

- Vollständiger Next.js-Produktion-Build und `npm run typecheck` mit allen installierten UI-Abhängigkeiten: `node_modules` ist im Quellbaum nicht vorhanden.
- Tatsächliches visuelles Zusammenspiel installierter GLB-Avatare, Spotify und verschiedenen Lyrics-/Kamerastilen auf Raspberry Pi. Performancewerte brauchen einen Praxistest auf der Zielhardware.
