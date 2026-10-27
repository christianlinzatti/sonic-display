# V603 – Complete Concert Experience Validation 4.0

**Ziel:** Evidenzbasierte Prüfung der **gesamten** Sonic-Display-Konzertshow als Vorbereitung der dramaturgischen V604-Ausbaustufe. Kein weiterer Animationscontroller, keine automatische Show-Freigabe.

## Datengrundlage

V592 zeichnet **echte** lokal authentifizierte Spotify-/Three.js-VisualizerStage-Screenshots, sichtbare GLB-Projektionen, Stage-Labels und Browser-rAF-Zeiten auf. Ab V603 wird zusätzlich `trackDurationMs` aus dem **bereits vorhandenen Spotify-Trackzustand** erfasst. Es gibt keine aus Screenshots abgeleitete oder erfundene Musikdauer. Auch der Vorher-/Nachher-Vergleich V594 und die V595-Bildregression bleiben unverändert.

## Aufnahme mehrerer Segmente

Jeweils denselben Track, dieselbe Browser-/WebGL-/Fensterkonfiguration und dieselbe GLB-Anzahl verwenden. Für jeden Live-Durchlauf einen **eigenen** Ausgabeordner angeben. Das Tool manipuliert **nie** die Wiedergabeposition; fehlende Songstellen müssen vom Benutzer in echter Wiedergabe aufgenommen werden.

```bash
npm run benchmark:v592:live -- --debug-port=9222 --seconds=120 --out=artifacts/v603/run-01
npm run benchmark:v592:live -- --debug-port=9222 --seconds=120 --out=artifacts/v603/run-02
npm run benchmark:v592:live -- --debug-port=9222 --seconds=120 --out=artifacts/v603/run-03
npm run benchmark:v603:review -- --run=artifacts/v603/run-01/report.json --run=artifacts/v603/run-02/report.json --run=artifacts/v603/run-03/report.json --out=artifacts/v603/review
```

**Voraussetzung:** V592 benötigt eine **tatsächlich** laufende Spotify-Wiedergabe mit mindestens einem sichtbaren echten GLB-Darsteller und einem lokal erreichbaren Chromium mit Remote-Debugging. Kein neuer Browser erhält heimlich Cookies. Das Beispiel mit `--debug-port=9222` setzt eine vom Nutzer bereits gestartete Chromium-Instanz an diesem Port voraus. Die Laufzeit eines einzelnen V592-Durchlaufs ist auf 180 Sekunden begrenzt. Bei Songs über 180 s mehrere reale Segmente messen, deren Enden sich sinnvoll überlappen.

## V603-Ausgabe

- `review-v603.json`: sortierte Song-Timeline, Fenster/Gaps, Belege für vorhandene Story-Labels, grobe GLB-/Lyrics-/Kamera-Warnungen, rAF-Laufwerte und die noch erforderlichen manuellen Prüfungen.
- `review-v603.html`: statische, escaped HTML-Ansicht mit Originalbildern, Songabschnittsübersicht und offenen Lücken.
- `images/run-X-live-YY.png`: nur vorhandene, **inhaltlich decodierbare** Original-PNGs; keine generierten Konzert-Screenshots.

**Abdeckung:** Eine fortlaufende Messstrecke zählt nur, wenn `frameTiming.elapsedMs` die zeitliche Differenz der echten Song-Screenshots innerhalb konservativer Toleranz bestätigt. Einzelbilder alleine ersetzen kein Video. `broad-coverage-needs-human-review` ist lediglich ein Hinweis auf breit verteilte echte Messfenster (mindestens 92 % Fensteranteil, keine große zeitliche Lücke, mindestens 12 Aufnahmen und drei verschiedene beobachtete Stage-Abschnitte). Es bedeutet weder gute Kameraregie noch synchronen Mund/Tanz. Sind zugehörige Original-PNGs unvollständig oder ungültig, kennzeichnet der CLI-Bericht selbst zeitlich breite Messfenster als `partial-evidence-needs-human-review`. Die tatsächliche Freigabe muss ein Mensch vornehmen. Bei alten V592-Berichten ohne Trackdauer ist nur `partial-evidence-needs-human-review` möglich, sofern die Dauer nicht aus einem anderen kompatiblen aktuellen Lauf belegt ist.

**Quellenkritik:** Hook-/Drop-/Verse-Labels stammen ausschließlich aus tatsächlich von der Stage angezeigten Cues, nicht aus Songanalyse, Genius-Sängerzuordnung oder Wortzeitstempel-Interpolation. Gleichartige Kamera-Cues können gewollte Motive sein. Die FX-Kategorie wird ausdrücklich *nicht gemessen*, da der bestehende Probe-Report keine Stage-FX-Parameter archiviert. Browser-rAF ist keine echte GPU-Zeit oder Raspberry-Pi-Temperatur. Automatische Videofreigabe gibt es nicht.

## Tests

```bash
npm run test:v603
npm run test:v603:types
npm run test:smoke:v603
npm run verify:v603
```

Der Test nutzt ausschließlich synthetische **Testfixtures**, die niemals als reale Aufnahmen in die eigentliche Auswertung eingeschleust werden. Kein automatisches Überschreiben von Quellen, keine Video-Uploads und keine Kopie von Spotify-Zugangsdaten.
