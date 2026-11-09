# V1130 – Intelligent Headliner Show

## Ausprobieren

1. `npm ci`, dann `npm run dev` starten. Konfiguration wie bisher anhand `.env.example` übernehmen.
2. **Settings → Avatar → Sonic Stage Crew → Intelligente Show aktivieren** wählen.
3. Elf Figuren stehen zur Auswahl. Neu: **Atlas Prism**, **Aurora Synth**, **Rio Carnival**, **Quantum Bass**. Alle vier enthalten 22 eingebettete Animationsclips mit eigener Arm-Phrasierung und vier zusätzlichen Moves: Power Hit, Ripple, Turnout und Stomp.
4. Die frei besetzbare Trio-Vorschau funktioniert ohne Spotify. Nach **Trio auf der Bühne einrichten** wird die Besetzung übernommen; diese bestehende Schaltfläche setzt zunächst Unisono. Danach **Intelligente Show aktivieren** wählen, um die neue Regie auf der Bühne zu verwenden.
5. Für Lyrics **Cinematic**, **Kinetic** oder **Neon** wählen. Wiederkehrende Textzeilen erhalten eine Refrain-Betonung. Der neue Show-Halo und die Regie-Anzeige erscheinen bei aktivierter intelligenter Show auch in der normalen Wiedergabeansicht.

## Was intelligenter geworden ist

Die lokale Regie bewertet tatsächlich geladene Clips nach Genre, Bewegungsenergie, Songabschnitt und den drei zuletzt gespielten Moves. Dichte synchronisierte Lyrics reduzieren die Bewegungsintensität in Strophen; Solo-Fokus und Antwortbewegungen geben dem Text Raum. Ruhige Stellen schaffen Kontrast, Aufbauten verwenden Kanon, Refrains wechseln zwischen Gruppenformen, Drops gemeinsame Hits. Ein verfügbarer später Songabschnitt mit hoher Energie kann ein Finale auslösen.

Gemischte ursprüngliche/Encore/Headliner-Gruppen verwenden für Unisono und Kanon gemeinsame vorhandene Clips. Dadurch bleibt eine Gruppe kompatibel, auch wenn einzelne Figuren mehr Animationen mitbringen. Neue Spezialclips stehen für individuelle Performances zur Verfügung. Mindestens acht Sekunden Haltezeit und vorhandene weiche Übergänge verhindern hektische Clipwechsel.

Die Regie ist ein lokales, nachvollziehbares Bewertungssystem, kein trainiertes generatives Tanzmodell. Sie ruft keinen externen KI-Dienst auf. Vorhandene Abschnittsdaten haben Vorrang; fehlende Abschnitte können aus synchronisierten Lyrics vorsichtig als Strophe, wiederkehrender Refrain oder Textpause eingeordnet werden. Das ist eine Dramaturgie-Heuristik, keine Audio- oder Drop-Erkennung. Ohne gemessene Energie verwendet die zusätzliche Show-Anzeige eine neutrale Energieannahme. BPM-Fallback: wie bisher 120. Das Bewegungs-Gedächtnis bleibt kurzlebig und wird bei Song-/Figurwechseln oder größeren Sprüngen zurückgesetzt.

## Spotify und Lyrics mocken

`tests/fixtures/concertMocksV1130.cjs` stellt steuerbare Browser-Mocks bereit:

- Spotify: verbundener Account, Track-Metadaten, Songposition, Pause und Trackwechsel.
- Lyrics: eigens geschriebener Testtext mit Zeilen- und Wortzeitmarken, wiederkehrender Refrain und Instrumentalpause; optional fehlende Lyrics.
- Genre: kontrollierte Genre-Antwort.
- Weitere externe API-Aufrufe im Test werden ebenfalls abgefangen. Es sind keine Spotify-Anmeldung und keine echten Songtexte nötig.

Die Mocks existieren ausschließlich im Testcode; die produktiven Spotify- und Lyrics-Routen bleiben unverändert. `setPlayback(...)` steuert den nächsten Playback-Abruf. Mit `advancing:true` läuft zusätzlich die Mock-Serverposition weiter; standardmäßig bleibt sie für reproduzierbare Tests fest, während die Oberfläche ihre normale lokale Fortschreibung nutzt.

## Prüfungen

- `npm run typecheck`
- `npm run test:v1130`
- Produktionsbuild: `SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build`
- Danach `npm run test:v1130:browser`. Lokal kann `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` vorangestellt werden. In anderen Umgebungen den dort installierten Browser verwenden oder `npx playwright install chromium` ausführen.

Die gezielten Tests prüfen echte GLB-Verformung, unterschiedliche Clips, Loop-Nähte, Bodenkontakt, Übergänge, Genres, Bewegungs-Gedächtnis und gemeinsame Gruppenclips. Die Browser-Tests prüfen die normale Spotify/Lyrics-Kette mit Mocks sowie die neue 3D-Besetzung.

Neue Original-Assets regenerieren: `blender -b -t 2 --python scripts/generate-sonic-avatars.py -- --headliners`. Die bisherigen Optionen ohne Zusatzargument und mit `-- --encore` bleiben verfügbar.

Die ZIP enthält Quellcode, Assets, Tests, Lockfile und Prüfbericht; keine Abhängigkeiten, Build-Caches oder Zugangsdaten.
