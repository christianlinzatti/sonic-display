# V1134 – Songregie und Crew-Dialog

## Ausprobieren

Wie bisher `npm ci`, Konfiguration nach `.env.example` und `npm run dev` verwenden. Unter **Settings → Avatar → Sonic Stage Crew → Intelligente Show aktivieren** einschalten und optional das Trio einrichten. Für die Lyrics Cinematic, Kinetic oder Neon auswählen.

Die Show-Simulation verwendet dieselbe Tanzplanung wie die Live-Bühne. „Aktuelle Songposition übernehmen“ bezieht vorhandene Lyrics ein; alternativ Abschnitt, Genre, Energie und Tempo vorgeben. Auch während der laufenden Probe lassen sich Tempo und Position ändern oder die Show pausieren.

## Dramaturgie

- **Auftakt:** Ein kurzer ruhiger Einstieg gibt der Crew Raum. Der Abschnitt richtet sich weiterhin nach vorhandenen Signalen.
- **Strophe:** Soli, Duelle und Antworten wechseln. Die Führung rotiert in 16-Sekunden-Blöcken; die Variantenplanung verwendet 8-Sekunden-Blöcke. Diese aus der Songposition abgeleiteten Rollen bleiben bei neuen BPM-Schätzungen stabil. Clipwechsel berücksichtigen weiterhin Takte, Mindesthaltedauer und Überblendungen.
- **Vor dem Refrain:** Bis zu drei Sekunden vor einer kommenden wiederholten Lyrics-Zeile nimmt die Regie Intensität und Strahlen zurück. Das ist eine Vorschau auf bereits vorhandene Zeitmarken, keine Audio-Vorhersage.
- **Refrain:** Große Lyrics, ein weiter gefasstes automatisches Bild und kurze, weiche Lichtakzente. Spätere Refrains wechseln die Führung; ab dem dritten Refrain und im Finale stehen gemeinsame Bewegungen im Vordergrund.
- **Schnelle Texte:** Ein Solist bleibt im Fokus. Die Begleitung verwendet zurückhaltenden Groove und weniger Körperakzente. Die automatische Kamera hält ihre aktuelle Position, Blickrichtung und Brennweite; zusätzliche Strahlen werden reduziert. Die Textzeile bleibt ruhig und lesbar.
- **Pause:** Die Tanzplanung behält ihre letzte gültige Uhr. Wiederaufnahme an derselben Position startet nicht mit einer neu berechneten Phase. Die automatische Kamera hält ihre Pose; manuelle Einstellungen und gespeicherte Kameras bleiben vorrangig.

Eine fehlende Lyrics-Quelle blockiert die Show nicht: vorhandene Abschnitts-, Genre-, Energie- und Tempowerte bleiben nutzbar. Ohne Tempo wird wie bisher 120 BPM verwendet. Ein Seek rekonstruiert die Rollen aus der Zielposition; bereits abgespielte Historie wird dafür nicht benötigt.

## Zusammenspiel

Duellpartner schauen zueinander. Die Antwort des Partners erhält zwei Beats Versatz, weitere Crew-Mitglieder richten sich zum Solisten. Bei Ruf und Antwort ordnet sich der Versatz relativ zur aktuellen Führung an. Ausdrucksbewegungen und Phasenversatz werden weiterhin geglättet. Die elf Avatare und 306 Animationen aus V1133 bleiben enthalten; diese Version fügt keine neuen Bewegungsdateien oder Mixamo-Aufnahmen hinzu.

## Gemeinsame Regie

`lib/concertScoreV1134.ts` erweitert die bestehende Concert Story um Spannungsphasen, Rollen, Kameraausschnitt und Licht-/Strahlenakzente. Live-Anzeige, Crew-Planung, Kamera, Licht, Lyrics und Probenbeleuchtung beziehen diesen Score über die vorhandene Integration. Die Rap-/Refrain-Darstellung und Wortmarkierung verwenden weiterhin denselben Lyrics-Spotlight-Planner aus V1133.

Die automatische Kamera wird am Ende der bisherigen Komposition angepasst und anschließend mit der vorhandenen Glättung geschrieben. Es gibt keinen zweiten Kamera-Schreiber. Explizite manuelle, gespeicherte oder Timeline-Kameras und Reduced Motion haben Vorrang. Die Lichtregie wirkt auf die virtuellen Bühnenlichter; sie sendet keine neuen Hardwarebefehle. Blackout und manuell gesetztes Licht bleiben geschützt.

Akzente sind kurze begrenzte Hüllkurven statt ständig wiederholter Blitze. Eine vorhandene Wortzeit kann den bestehenden Refrain-Schlüsselwortakzent begleiten. Die Auswahl des Schlüsselwortes ist eine Textheuristik, kein semantisches Verständnis der Lyrics.

## Fehlerhafte Zeitmarken

`lib/lyricTimingV1134.ts` prüft Daten am Lyrics-Client-Eingang, bevor sie angezeigt, gecacht oder an die Bühne gegeben werden:

- Negative, nicht numerische oder außerhalb der Songdauer liegende Zeilenstarts werden verworfen.
- Zeilen werden zeitlich sortiert; doppelte Starts werden auf die erste Zeile begrenzt.
- Überlappende Zeilenenden werden an der nächsten Zeile gekürzt. Fehlende oder ungültige Enden erhalten ein begrenztes Zeilen-Lesefenster.
- Nicht monotone, überlappende oder zur Zeile unpassende Wortzeiten werden vollständig für diese Zeile entfernt. Es werden keine Wortzeitmarken erfunden.
- Bleiben keine gültigen synchronisierten Zeilen übrig, bleibt vorhandener Text als unsynchronisierter Text verfügbar.

Die Validierung kann formal falsche Zeiten erkennen. Plausible, aber musikalisch falsch verschobene Zeitmarken kann sie ohne Referenz nicht zuverlässig erkennen oder korrigieren. Die Show bleibt lokal und regelbasiert; es wurde kein externer KI-Dienst und keine automatische Vollsong-Audioanalyse ergänzt.

## Prüfen

```sh
npm run test:v1134
SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:v1134:browser
```

Der direkte Build umgeht die umfangreiche historische `prebuild`-Kette und führt den Next-Produktionsbuild mit Typprüfung aus. Lokal kann stattdessen ein von Playwright installierter Chromium verwendet werden.

Die neuen Stress-Fixtures unter `tests/fixtures/concertStressV1134.cjs` enthalten Tempoereignisse, dichte Testtexte und defekte Lyrics. Die Score-Prüfung umfasst 60-Hz-Uhrkontinuität bei Sprüngen zwischen 65/90/120/170/210 BPM, ungültiges Tempo, Pause/Wiederaufnahme, Seeks, Rollenrotation, vorgemerkte Tanzwechsel bei 55/93/170 BPM, gegenseitige Blicke, Kamerahalten, manuelle Priorität und fehlende Texte. Die Browser-Suite prüft echte UI- und 3D-Pfade mit vollständig gemockten Spotify-/Lyrics-Daten, einschließlich Kamera-Status und Darstellung nach kaputten Zeitmarken. Bestehende Asset-, Tanz-, Persönlichkeits- und Showtests bleiben dabei aktiv.

## ZIP

README und ARCHITECTURE bleiben im Projektstamm; ausführliche Dokumentation liegt unter `docs/versions/`. Das ZIP enthält Testquellen und Konfigurationen, aber keine generierten Playwright-Testberichte, Traces oder Testergebnisordner. Abhängigkeiten, Build-Caches und Zugangsdaten sind ausgeschlossen.
