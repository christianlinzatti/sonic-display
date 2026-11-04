# Sonic Display V437 – Automatic Rap Performance Director

**Ziel:** Möglichst viel musikalische 3D-Rapper-Performance ohne pro Song einzurichtende Choreografie. V437 ergänzt die V436-Kameraregie, ersetzt sie aber nicht und ist von der Live-Kamera-Aktivierung unabhängig.

## Automatik im Betrieb

- Sobald ein Titel **synchronisierte Lyrics** liefert und ein Avatar-Modus läuft, erstellt V437 einmal pro Lyrics-Dokument und Song eine begrenzte Performance-Planung. Der Feature-Schalter ist standardmäßig an; seine Intensität steht auf 70 %.
- Erkennung von Textwiederholungen als mögliche **Hook-Passagen**, ansonsten Verse; explizite V416-Rapper-Zuordnungen liefern präzisere Szenen (Reply, Duett, Hook). Solo-Avatare benötigen keine V416-Zuordnung.
- Für jede Zeile wird aus Dauer und optionalen Wortmarken eine **ungefähre Silbendichte/Flow-Geschwindigkeit** abgeleitet (tatsächlich nur Wortanzahl pro Zeit). Während der Wiedergabe beeinflussen Audioenergie und Kick-Akzente die Dynamik. Der Beat ist ein Live-Energiesignal, kein verifizierter Phonem-/Beat-Tracker.
- **Tanz:** Animationsintensität, Aggressivität, Bewegungsvariation und bei Hooks ggf. schärferer Bewegungsstil. Wird die bestehende automatische Motion-Library genutzt, markiert V437 erkannte Hooks auch als eigene musikalische Abschnitts- und Wechselpunkte für deren vorhandenen Clip-Selektor. Die V437-Motion-Library bietet dafür zusätzlich den Songabschnitt `hook` bei jeder installierten Animation an. Die vorhandenen Bewegungs- und Smart-Dance-Engines übernehmen die eigentlichen verfügbaren Tanzclips und ihre Übergänge. V437 lädt oder erzeugt **keine eigenen Tanzanimationen**.
- **Gestik/Mimik:** maßvolle positive Verstärkung des bestehenden V371-Körper-Gesten- und V368-Gesichtsausdrucksystems. Der vorhandene Lippen-Sync bleibt die Basis. Bei sicheren Wortmarken oder ausreichender Textdichte darf V415-Rap-Lip-Sync aktiviert werden, sofern Vocal-Automatik nicht von einer manuellen Zuordnung verdrängt wird.
- **Automatische Rap-Artikulation:** Wenn der Vocal-Stil auf `auto` steht, wählt V437 für aktive Rap-Lyrics den bereits unterstützten Stil `rap`. Manuell ausgewählte Vocal-Stile bleiben unverändert.
- Mit bekanntem Nicht-Rap-Genre (z. B. Hardstyle, Pop, Techno) bleibt V437 inaktiv. Bei unbekanntem Genre sind synchronisierte Lyrics ausreichend. Ein ausgeblendeter Lyrics-Text darf weiterhin die Timestamps liefern; die Wiedergabe erfordert aber eine reguläre, aktive Lyrics-Datenquelle.

## Manuelle Prioritäten und Leistung

- Deaktivierte Automatik, Pause, reduzierter Bewegungsmodus oder ein Songwechsel entfernen den Effekt sofort; Änderungen am Song, den Lyrics und den Nutzerpräferenzen werden **nicht gespeichert**.
- Manuell festgelegte Choreografien (`avatarMotionMode=choreography`), eine aktive Timeline, das manuelle Überblenden von Clips, explizite Smart-Dance-Overrides oder ein manuell gewähltes Tanz-Preset erhalten die Tanzregie.
- Manuelle Vocal-Rollen (`avatarManualVocalEnabledV385`) und manuell bearbeitete Silben-Keyframes (`rapSyllableEditsEnabledV420`) sperren die automatische Gesichts-/Gesten-Verstärkung. Globale Lip-Sync-Deaktivierung wird respektiert.
- Stärken bleiben begrenzt; kein direkter Eingriff in Three.js-Objekte, kein neuer Canvas, keine zusätzlichen Web-APIs, keine Spotify-Seeks.
- Song-Planung ist auf 5000 Lyrics-Zeilen beschränkt. Der Live-Sampler nutzt binäre Suche in den Zeitstempeln und wertet nicht pro Frame die gesamte Lyrics-Liste aus.

**Einschränkung:** Die Erkennung beruht auf Textzeitpunkten und vorhandener Musikanalyse. Sie identifiziert keine tatsächlichen Stimmen, keine emotionalen Inhalte und keine Phoneme. Da keine neuen Animationen erzeugt werden, hängt die Vielfalt der Tanzwechsel von installierten Bewegungen und den bisher aktivierten Motion-Library-Einstellungen ab. Vollständige Browser-/GPU-Validierung bleibt nötig.

## Einstellungen

Im Rap Performance Editor unter **V425 – Expressive Rap Performance Director → V437 – Automatic Rap Performance Director**. Dort Automatik ein-/ausschalten, Intensität ändern und erkannte Lyrics-/Hook-Zeilen samt Live-/Vorschau-Werten sehen. Die Vorschau hat keine Spotify-Seeks.

## Prüfen

```powershell
npm install
npm run verify:v437
npm run typecheck
npm run build
```
