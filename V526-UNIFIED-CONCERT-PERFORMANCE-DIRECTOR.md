# Sonic Display V526 – Unified Concert Performance Director

## Ziel

Auf Basis des vollständigen V525-Projekts werden drei bereits vorhandene visuelle Rap-Kanäle mit **derselben validierten Wortuhr** koordiniert, statt neue unabhängige Beats, Avatar-Stimmen oder Animationsschleifen zu erzeugen.

## Implementierung

- **Wortquelle:** `sampleUnifiedWordV526` nimmt ausschließlich `rapLipWordAtV415` mit echten Wortstart-/Endmarken. Für Deutschrap/Rap/Trap/Drill mit verifiziert aktivem Wort wird eine auf 0–1 begrenzte Impulskurve berechnet; ohne Zeitstempel, bei Pausen, Reduced Motion, anderen Genres oder ungültigem Zeitstempel: neutral.
- **Gesicht:** `coordinateRapFaceV526` folgt nach V523 im bestehenden GLB-Facial-Rig (`VocalRigV368`) und beim prozeduralen Avatar. Nur `brow`/`cheek` erhalten eine sehr kleine zusätzliche Ausdrucksgeste (höchstens 0,004). Weder Kiefer noch Lippenverschlüsse/-breite/-rundung, Blinzeln, Audio-Priorität, kalibrierte Morph-Targets oder manuelle Preview-Aktionen werden geändert.
- **Tanz:** `coordinateRapDanceV526` dämpft kleine automatische rapbezogene Armimpulse und bindet sanfte Kopf-/Oberkörper-Zusatzakzente an eine langsame Phrasenphase; stets innerhalb der V472-Kanäle, nach V516 und vor dem V515-Limiter. Ein trackgebundener authentifizierter Mehrpersonen-Cast ist zwingend: keine Stimme wird aus Lyrics erraten. Der prozedurale Mehrpersonenpfad verzichtet ohne sichere Rollenübergabe auf V526-Gesten.
- **Lyrics:** `coordinateConcertLyricsV526` dämpft ausschließlich die in V525 bereits begrenzte **Wortbewegungsstärke** bei schnellem Rap weiter. Die Wortfarbfüllung und Synchronisation beruhen weiterhin auf `lyricPlaybackFractionV477`. DOM und 3D-Text verwenden denselben Plan; keine Änderungen am Layout oder am Lyrics-Provider.
- **Performance:** Weiterverwendung bestehender `useFrame`-Aufrufe; keine Web Worker, Timer, Renderer oder zusätzlichen npm-Abhängigkeiten.

## Manuelle Qualitätsprüfung

1. Dieselbe verifizierte Deutschrap-Passage in der DOM- und 3D-Lyrics-Ansicht abspielen; Karaoke-Füllstände müssen übereinstimmen.
2. Solo-GLB mit Gesichtsmorphs und prozeduralem Avatar testen; Wort-Anfang/-Ende, Pausen, Seek und B/P/M-Schlüsse vergleichen.
3. Zwei bis vier echte GLB-Avatare testen; ohne bestätigte Singer-Zuordnung dürfen Begleitavatare keine neue V526-Rap-Sängerbewegung bekommen.
4. An vier Tänzern V522-Pi-Benchmark und einen mehrminütigen Genrewechsel durchführen: FPS/P99, Beine, Kontakte, Kamera und Lyrics-Lesbarkeit bewerten.

## Geltungsgrenzen

Wortzeitstempel beweisen weder korrekte Phoneme noch Künstler-/Stimmidentitäten. Die MIDI-/Audio-/Lyrics-Uhren werden nicht neu synchronisiert; nur bereits verifizierte Wortzeit wird gemeinsam genutzt. Tests prüfen reproduzierbare Logik und strukturelle Integration; ohne echte Avatare, Bildschirm und vollständige Installation kein Beweis visueller oder Raspberry-Pi-Qualität.
