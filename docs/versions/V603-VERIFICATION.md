# V603 Verifikationsprotokoll – 26.10.2026

## Tatsächlich erfolgreich ausgeführt

- `npm run test:v603` – **PASS, 50 neue Testgruppen**, inklusive Multi-Segment-/Track-/Browser-/GLB-Konsistenz, echten Songpositionsintervallen gegen rAF-Laufzeit, ungemessenen Lücken, fehlenden Abschnitten, wiederholten Kamera-Cues und GLB-/Lyrics-Warnungen, HTML-Escaping, gültigen/defekten PNGs und Schutz vor Überschreiben der Quellberichte. **Testfixtures sind künstliche Prüfdaten, nicht echte Spotify-Aufnahmen.**
- `npm run test:v603:types` – PASS, isolierte TypeScript-Prüfung der v592/v601/v602-Kernfunktionen.
- `npm run check:architecture` – PASS, 442 referenzierte aktuelle Quelldateien bei 10 Systemabschnitten.
- `npm run verify:v603` – **PASS**: V603-Smokekette inklusive V592-Quellen-/Livebenchmarkschutz, V602-Pi, V601-FX, V600-Songdramaturgie, V599-Duetten, V598-Lyrics, aktuelle Architekturreferenz. Weiterhin V597 Deutschrap-Lip-Sync, V596-Fußarbeit, V595-Bildregression, V572-Mundbewegungen, V589-GLB-Quellprüfung mit V588 Langsong-Integration und Quellcode-Scan.
- `npm run check:syntax` – PASS, **827 TypeScript-/TSX-Quelldateien** mit Syntax-/Importprüfungen.

Die neue Aufnahmequelle `LiveStageDomProbeV592` gibt `durationMs` aus dem bestehenden Spotify-Trackzustand weiter; die V592-CDP-Messung archiviert diesen Wert nur bei tatsächlich vorhandener positiver Dauer. Alte V592-Berichte ohne diese Angabe bleiben unterstützt, können aber nicht allein eine umfassende zeitliche Abdeckung belegen.

## Warum keine visuelle Vollabnahme behauptet wird

- Es erfolgte **keine echte Spotify-/Chromium-WebGL-Aufnahme** mit den konkreten GLB-Avataren des Nutzers. Im Arbeitscontainer sind keine authentifizierten Spotify-Messläufe vorhanden.
- Das Verhältnis zeitlich abgedeckter Bereiche ist eine Auswertung von **V592-Messfenstern**, kein lückenloser Videobeweis. Kamerafahrten, Fußkontakte, Rap-/Phonemsynchronisierung und V601-Lichteffekte werden nicht automatisch als korrekt bewertet.
- Ein Bericht über breit gemessene Songzeit bleibt immer `*-needs-human-review` mit `approved:false`. Fehlende oder beschädigte PNGs werden ausgewiesen und führen im CLI zu `partial-evidence-needs-human-review`.
- rAF-/Framezeitmetriken des Browsers sind **keine** tatsächlichen GPU-Zeiten, Raspberry-Pi-FPS, Temperaturen oder Stromverbräuche.
- `npm run build`, globale Next.js-Typprüfung und echter Raspberry-Pi-Langzeittest wurden **nicht ausgeführt**, da hier keine installierten `node_modules` oder Zielhardware verfügbar sind.

## Schutz

Ausschließlich lokale, schreibgeschützte V592-Berichtsquellen. Kein automatischer Spotify-Seek, keine Kamera-/Lyrics-/GLB-Modifikation, keine Veränderung manuell definierter Regie, keine zusätzlichen Renderloops. Für gespeicherte Berichte werden Track-ID nur als gekürzter SHA-256-Hash und tatsächlich vorhandene lokale PNG-Kopien ausgegeben. Ausgabeverzeichnis muss von jedem Quellaufnahmeordner getrennt sein.
