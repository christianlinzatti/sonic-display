# V593 – Concert Quality Auto-Improvement 2.0

## Messbasierte Verbesserungsvorschläge statt blindem Autotuning

V592 erfasst die **echte Spotify-`VisualizerStage`** bei laufender Wiedergabe und lokalem Chromium. V593 verarbeitet nur einen erfolgreich und nachweisbar gemessenen V592-Bericht. Es nimmt **keine** Änderungen an Spotify, gespeicherten Einstellungen, Kamerakeyframes, GLB-Clips, Gesangstimestamps oder Fuß-IK vor. **Auto** bedeutet die automatische *Erstellung der Vorschläge*, nicht eigenmächtige Änderungen der Show.

Neu sind:

1. Pro echtem Screenshot werden die gemessenen GLB-Bounds, DOM-Lyrics-Rechtecke und Bühnen-Rechtecke in `report.json` gespeichert.
2. Der Advisor (`scripts/v593-concert-quality-advisor.cjs`) erstellt Empfehlungen nur bei **mindestens zwei** betroffenen Aufnahmen und bei **mindestens der Hälfte** der Fotos. Vorhandene Labels wie `Avatar möglicherweise angeschnitten` werden durch die GLB-Bounds ergänzt.
3. Ein vermeintlicher Lyrics-/Avatar-Konflikt wird nur gemeldet, wenn ein **verhältnismäßig kleines echtes DOM-Lyrics-Rechteck** wiederholt mit einer projizierten GLB-Box überlappt. Große transparente Fullscreen-Overlays oder fehlende Text-Rechtecke sind **nicht messbar**, nicht automatisch fehlerhaft.
4. Bei tatsächlich langsamen Browser-rAF-Intervallen (Orientierung: weniger als 27 Durchschnitts-FPS oder p95 größer als 40 ms) wird ein kleiner, reversibler *manueller* Testschritt bei optionalen Effekten empfohlen. Es wird **kein** FPS-Gewinn zugesichert. GLB-LOD und hohe Draw-Call-/Triangle-Last liefern nur heuristische Hinweise, keine GPU-Messung.
5. Einmalige Auffälligkeiten werden nicht überinterpretiert. Weitere Hinweise: möglicherweise zu kleine Avatare, **stark überlappende GLB-Darsteller-Projektionen**, nicht bestätigte synchronisierte Lyrics und nahezu einfarbige Screenshots.
6. Der Benchmark legt neben den V592-Dateien `advice-v593.json` (maschinenlesbar) und `report-v593.html` (Aufnahmen + konkrete Maßnahmen + Belege + Schutzregeln) ab. Ohne erfolgreichen echten Live-Benchmark werden diese Dateien nicht erzeugt.

## Bedienung

Vollständige lokale Live-Messung zuerst nach `V592-LIVE-CONCERT-STAGE-QUALITY-VALIDATION-4.md` vorbereiten. Danach:

```bash
npm run benchmark:v592:live -- --debug-port=9222 --seconds=15 --min-glb=1
```

Bei Erfolg entstehen im Ordner `artifacts/v592/live/`:

- `report.json`, `report.html`, `live-00.png` usw. (wie bisher)
- `advice-v593.json`, `report-v593.html` (**neu**)

Ein **bereits vorhandener echter** V592-Bericht kann auch **ohne** laufenden Browser analysiert werden:

```bash
npm run benchmark:v593:advise -- --report=artifacts/v592/live/report.json
```

Der optionale Parameter `--out=artifacts/v593/review` legt die beiden V593-Berichte dort ab (die HTML-Bildpfade werden relativ zum Ordner der ursprünglichen Bilder gesetzt). Ein geblockter oder unvollständiger V592-Bericht führt zu einem Fehler und **nicht** zu einem Fake-Erfolgsbericht.

## Empfehlungen – Schutz und Nachvollziehbarkeit

| Anlass | Messbeleg | Vorsichtiger Vorschlag |
|---|---|---|
| Avatar abgeschnitten | Wiederholt auffällige GLB-NDC-Bounds oder echte V592-Warnung | Kameraausschnitt manuell erweitern; Beispiel *1,08-facher Abstand* nur als Ausgangspunkt für eine Sichtprobe |
| Avatar-Formation überlappt | Wiederholt >45 % Überlappung der kleineren GLB-Projektionsbox zweier Darsteller | Formation/Kameraachse manuell prüfen; absichtliche Duett-Nähe möglich |
| Avatar zu klein | Wiederholt zu kleine NDC-Box | Kameraausschnitt manuell verengen; Beispiel *0,94-facher Abstand* nur als Ausgangspunkt, **nicht** bei gleichzeitiger Beschneidung |
| Lyrics-Überlagerung | Mind. 8 % einer Avatar-Projektion werden von einem begrenzten Lyrics-Rechteck überdeckt, wiederholt | Lyrics/Layout manuell prüfen bzw. versetzen; Fullscreen-Overlay => nicht messbar |
| Lyrics-Timing nicht bestätigt | Warnung in mehreren Aufnahmen | Originalquelle der Wort-/Zeilentimestamps prüfen; nichts erfinden |
| Browser-rAF langsam | Tatsächliche FPS + p95 aus V592-Frame-Messung | Optionales Licht/VFX um z. B. 15 % **testweise** reduzieren und neu messen |
| Hohe Geometrielast | Wiederholt mehr als 450 Draw Calls **und** mehr als 650.000 Dreiecke | Existierendes LOD/Performance-Profil vergleichen; hardwareabhängige Schwellen |
| Fast einfarbige Szene | Eckpixel-Bildheuristik über mehrere Bilder | Screenshot manuell auf Beleuchtung/Sichtbarkeit prüfen |

Der automatische Vorschlagsbericht enthält `humanReviewRequired:true`, `autoApplied:false`, nachvollziehbare Screenshot-Indizes, die jeweilige Einschränkung und `status:'suggested-not-applied'`. **Keine der Empfehlungen wird direkt auf die reale Show angewandt.** Ein Null-Vorschlags-Bericht ist **keine** künstlerische Freigabe.

## Datenqualität und Grenzen

- V592 speichert keine OAuth-Tokens im Bericht. Die Track-ID ist bereits Bestandteil des lokalen V592-Berichts; V593 schreibt sie nicht erneut in die Vorschlagdatei.
- In reinen Offline-Regressionen werden **synthetische Test-Fixtures** verwendet; diese gelten ausdrücklich nicht als echte Browser-Messungen.
- DOM-Rechtecke können Hintergrundflächen statt Buchstaben umschließen. NDC-Boxen liefern keine Pose-, Gesichts-, Fußkontakt- oder Kontrastgarantie.
- Kein vollständiger Next.js-/Chromium-/Raspberry-Pi-Test, solange reale Dependencies, Spotify-Wiedergabe und GLB-Dateien fehlen.
- `report-v593.html` ist eine Offline-HTML-Datei ohne JavaScript oder automatische Aktionen; nach Änderungen an der Bühne muss der Benchmark neu ausgeführt werden.

## Tests

```bash
npm run test:v593
npm run test:v593:types
npm run test:smoke:v593
npm run verify:v593
```
