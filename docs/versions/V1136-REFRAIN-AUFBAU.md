# V1136 – Weicher Refrain-Aufbau und gemeinsame Lyrics-Zeitleiste

Die adaptive Regie bereitet innerhalb der letzten drei Sekunden vor einem
Refrain bereits dessen kommenden Solisten vor. Die Führung bleibt beim
Refrain-Einsatz erhalten. Licht, Strahlen, Bewegung und automatische
Kamerakomposition wachsen über eine weiche Kosinuskurve. Im Aufbau gibt es
keinen zusätzlichen Blitzakzent. Dichte Rap-Lyrics behalten ihren Lesefokus;
explizite Drops, manuelle Kameras und Reduced Motion behalten ihre Regeln.

Eine gemeinsame, schwach referenzierte Lyrics-Zeitleiste indiziert jeden
Lyrics-Datensatz einmal. Binäre Suche ersetzt wiederholtes Durchlaufen und
Normalisieren aller Zeilen für Regie, Lyrics-Dichte, Spotlight und Crew.
Wiederholte Textzeilen bleiben ein struktureller Hinweis und sind keine
Audioanalyse oder semantische KI. Provider-Updates müssen wie bisher neue
Lyrics-Objekte liefern; nachträgliche In-place-Änderungen sind nicht unterstützt.

Die Zeilenintervalle sind am Ende exklusiv. Lücken halten keinen veralteten
Rap-/Refrain-Fokus. Fehlt eine Endzeit, begrenzt die nächste Zeile oder ein
Vier-Sekunden-Fenster die Anzeige. Ungültige Startzeiten werden beim Indexieren
verworfen; der vorhandene Eingangsvalidator bleibt zuständig für Wortzeiten.
Trackwechsel verwenden getrennte Indizes; alte Datensätze können vom Garbage
Collector freigegeben werden. Es entstehen keine Timer oder Netzwerkanfragen.

## Bedienung und Prüfung

Settings → Avatar → Intelligente Show aktivieren. Die Refrain-Hinweise setzen
synchronisierte Lyrics mit wiederholten Zeilen voraus. Ohne solche Daten bleibt
die vorhandene Regie aus Genre, Energie und Phrasen aktiv.

- `npm run test:v1136`: bestehende Show-/GLB-Regressionen und neuer Timeline-Test.
- `node tests/concert-lyric-timeline.cjs`: Grenzen, Lücken, Seeks, 1.200 Zeilen,
  einmalige Indexierung, Track-Isolation, monotone Builds bei 55–210 BPM
  und tatsächliche Oberkörper-Reaktionen aller elf Avatare.
- Nach einem Produktionsbuild: `playwright test --config=config/playwright.production.cjs tests/e2e/refrain-build.spec.cjs`.
  Spotify und Lyrics werden vollständig gemockt, Desktop und Touch geprüft.

Projekt-ZIPs enthalten weiterhin keine Playwright-Testberichte.
