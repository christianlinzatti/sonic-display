# Sonic Display V1129 – Encore Music Performance

## Neu

- Sieben lokal enthaltene 3D-Figuren. Neu: Ember Rock (Flammenkamm), Luna Flow (Orbit-Headset), Sol Groove (Disco-Look) und Velvet Jazz (Jazzhut).
- Jede neue Figur hat 18 eingebettete Animationen: die zehn Grundclips, zwei Signaturtänze und sechs neue Genre-Moves (Rock Drive, Latin Sway, Jazz Swing, Liquid Wave, Afro Pulse, Waltz). Eigene Arm-Phrasierung unterscheidet die neuen Figuren auch bei gemeinsamen Clips.
- Lokale Musikregie mit elf Genre-Familien und einem universellen Fallback. Bewegung wechselt über 16-Beat-Phrasen, mit mindestens acht Sekunden Haltezeit, Taktwechseln und weichen Übergängen. Ruhige Abschnitte bleiben ruhig. Manuelle Clip-Steuerung hat Vorrang.
- Genreabhängige Lyrics-Einblendungen in der normalen Anzeige und auf der 3D-Bühne: weich für Ambient/Klassik, akzentuiert für Rock/Rap/Hardstyles. Echte Wortzeitmarken und vorhandene Karaoke-Effekte bleiben erhalten. Ohne synchronisierte Lyrics keine erfundenen Wortzeiten.
- Frei besetzbares Trio für Vorschau und Bühne. Unisono/Kanon nutzen gemeinsame Clips, auch mit gemischter alter/neuer Crew.

## Ausprobieren

1. Wie bisher installieren und starten: `npm ci`, dann `npm run dev`.
2. **Settings → Avatar → Sonic Stage Crew** öffnen.
3. Bei **Figur 1–3** die Besetzung auswählen. **Show-Simulation öffnen** zeigt die tatsächlichen GLBs ohne Spotify-Anmeldung.
4. Genre, Tempo und Abschnitt einstellen, dann **Show-Simulation starten**. Zum Beispiel Latin, Jazz oder Rock mit den neuen Figuren ausprobieren.
5. Mit **Trio auf der Bühne einrichten** die gewählte Besetzung übernehmen. Den Modus **Auto-Choreografie** für abschnittsabhängige Solo-, Kanon- und Gruppenwechsel wählen. In der Avatar-Bibliothek ist jede Figur auch einzeln auswählbar.
6. Für Lyrics einen animierten Stil (Kinetic, Cinematic oder Neon) wählen. Die Einblendung passt sich dem verfügbaren Genre an. Bei Bewegungsreduktion bleiben die zusätzlichen Animationen aus.

## Was „AI“ hier bedeutet

Die Musikregie läuft lokal und regelbasiert. Sie nutzt die vorhandenen Genre-, Energie-, Tempo- und Abschnittsdaten sowie die Songposition. Es ist kein trainiertes generatives Tanzmodell und kein externer KI-Dienst eingebaut. Fehlen BPM, verwendet die vorhandene Crew-Steuerung 120 BPM; unbekannte Genres bekommen einen universellen Tanzmix. Live-Synchronität hängt von den verfügbaren Musikdaten ab. Die Vorschau ist ausdrücklich eine Simulation.

## Entwicklung

- `npm run typecheck`
- `npm run test:v1129`
- Neue Original-Assets reproduzieren: `blender -b -t 2 --python scripts/generate-sonic-avatars.py -- --encore`
- Original-Crew reproduzieren: gleicher Befehl ohne `-- --encore`.

Die ZIP enthält Quellcode, Lockfile, GLBs und gerenderte Vorschaubilder. Abhängigkeiten, Build-Cache und Zugangsdaten sind nicht enthalten. Bestehende Konfiguration anhand `.env.example` übernehmen.
