# V547 – Feature Vocal Assignment Studio

## Bedienung

Öffne **Einstellungen → Rap Duet Studio → V547 Feature Vocal Assignment Studio**.
Wähle einen Track, aktiviere die Zeitmarken, und speichere explizite Sängerabschnitte.
Die Timeline zeigt vier Avatar-Spuren mit Verse, Feature, gemeinsamer Hook und Adlibs.
Balken lassen sich zum Bearbeiten antippen; der Zeitregler ist nur eine Vorschau und verändert Spotify nicht.
Mit **Start = aktuelle Zeit** / **Ende = aktuelle Zeit** lassen sich Grenzen der laufenden Wiedergabe übernehmen.
Pro Song werden maximal 120 Einträge im bisherigen V496-Speicherformat abgelegt.

## Regeln und Grenzen

- V385 manuelle Lyrics-Zuordnung und manuelle Choreografien bleiben vorrangig. Die V496/V547-Zeitmarken werden nur bei aktivem Schalter und passendem Track verwendet.
- Solo / Feature nimmt den markierten Avatar als visuelles Lead. Beim Duett singen zwei sichtbare Avatare visuell.
- Bei Hook wählt man explizit die visuell singenden Avatare (bis zu vier, soweit tatsächlich auf der Bühne vorhanden).
- Adlibs addieren lediglich einen Background-Sänger, wenn eine Hauptpassage aktiv ist, und nehmen dieser weder Lead noch Kamera weg. Ein isoliertes Adlib kann eine eigenständige Stimme darstellen.
- Überlappende Hauptpassagen sind orange umrandet; die zuletzt gespeicherte gewinnt. Adlibs sind separate additive Segmente.
- Alte V496-Zeitmarken bleiben unverändert lesbar. Keine Erkennung tatsächlicher Sänger, Sprechertrennung, neuen Phonem-Zeitpunkte oder verifizierte Sängerzuordnung aus Spotify/Genius.
- Alle Sängerzuordnungen sind künstlerische Regieanweisungen. Manuelle Gesangskorrekturen behalten Vorrang, ebenso bestehende Kamera-Keyframes.

## Prüfen

`npm run verify:v547` und anschließend für den echten Produktionsbuild `npm install && npm run build`.
Visuelle WebGL-Tests mit mehreren GLB-Avataren und Raspberry-Pi-Langzeitläufe sind gesondert erforderlich.
