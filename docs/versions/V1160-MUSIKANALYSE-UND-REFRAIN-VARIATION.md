# Belastbarere Musikanalyse und abwechslungsreiche Refrains

## Messung statt Dauerbass-Fehltrigger

Die bereits freigegebene Mikrofonaufnahme liefert neben Frequenzbändern nun
auch einen wiederverwendeten Zeitbereichspuffer. `waveformRms` misst daraus die
Lautstärke und entfernt den Gleichanteil. Leise FFT-Schwankungen ohne
entsprechendes Audiosignal erzeugen keine Impulse. Die Anwendung aktiviert das
Mikrofon weiterhin ausschließlich über die vorhandene Benutzereinstellung.
Es werden keine Audiodaten gespeichert oder an einen Dienst übertragen.

`hooks/spectralMusicAnalyzer.ts` betrachtet positive Änderungen der tiefen,
mittleren und hohen Bandenergie. Eine anhaltend hohe Bassenergie ist dadurch
kein neuer Schlag. Adaptive Änderungsschwellen, ein Mindestabstand zwischen
tiefen Onsets und eine kurze Einlaufphase begrenzen Fehltrigger. Perkussive
mittlere und hohe Akzente bekommen eigene abklingende Hüllkurven; nur tiefe
Onsets werden an die bestehende Tempoerkennung übergeben. Das sind weiterhin
Frequenz-/Onset-Heuristiken, keine isolierten Instrumentenspuren oder
semantische Melodieerkennung.

Glättung und Abklingen verwenden die tatsächlich vergangene Frame-Zeit.
Die Prüfungen vergleichen 30, 60 und 120 Hz. Bei einer Aufnahmeunterbrechung
wird zunächst eine neue Messbasis aufgebaut. Die Lautstärkehüllkurve läuft
weich aus; kurze Lücken zwischen Schlägen setzen die Tempoerkennung nicht
zurück. Nach 650 ms anhaltender Ruhe werden Tempo, Phase, Kick-Akzent,
Rhythmusmuster und Lernzustand einmalig zurückgesetzt.

## Worker, Tempo und Regie

Tempo und Phase verwenden die AudioContext-Aufnahmeuhr. Frame-Glättung,
Worker-Alter und Latenzbeobachtung verwenden weiterhin die monotone Systemzeit.
Damit wird eine unter Last abweichende Audio-Uhr nicht als falsches Tempo
ausgegeben. Die Beat-Ereignisse für den bestehenden Anzeige-Latenzausgleich
behalten ihren `performance.now()`-Zeitbezug.

Worker-Antworten müssen einer tatsächlich offenen Anfrage entsprechen und
innerhalb von 250 ms eintreffen. Alte oder nach einem Reset eintreffende
Antworten dürfen kein früheres Tempo wiederherstellen. Auch zwischengespeicherte
Antworten laufen nach 250 ms ab. Die bestehende Grenze von einer offenen
Snapshot-Anfrage und der Worker-Ausfallpfad bleiben erhalten. Ein Reset setzt
jetzt alle fünf Rhythmus-Tracker im Worker zurück.

Sechs konsistente neue Intervalle können bei einer deutlichen, nicht harmonischen
Tempoänderung das alte Zeitfenster ersetzen. Ein 120→150-BPM-Wechsel muss somit
nicht warten, bis die gesamte alte Historie verschwunden ist. Exakte Halb- und
Doppeltempo-Verhältnisse bleiben musikalisch mehrdeutig; die bestehende
Kontinuität wird dabei beibehalten. Unregelmäßige Einzelimpulse reichen nicht
für diesen Neustart aus.

Die Tanzregie nutzt die neuen Onset-Hüllkurven. Als gemessene musikalische
Evidenz gelten weiterhin nur aktive Mikrofonwerte mit ausreichender Tempo-/
Phasenkonfidenz. Eine leise Passage und der geschätzte Songtakt werden nicht
als gemessene Musik ausgegeben.

In der geöffneten **Show steuern**-Bedienfläche steht unter **Musikanalyse**, ob
der Songtakt verwendet wird, das Mikrofon noch Tempo ermittelt, ein stabiler
Takt gemessen wurde oder eine leise Passage vorliegt. Auf der Bühne entsteht
keine zusätzliche Anzeige. Auf schmaleren Bildschirmen liegt der vorhandene
Mikrofonknopf unterhalb der Kiosk-Leiste, damit er frei erreichbar bleibt. Das interne, höchstens einmal pro Sekunde gesendete
Ereignis `sonic:music-analysis` enthält nur normalisierte Diagnosewerte,
Tempo/Konfidenz und den Worker-Status, keine Samples, Texte oder Aufnahme.

## Wiederkehrende Refrains

Der erste Refrain stellt das Bühnenmotiv vor; der zweite nutzt ein kontrastierendes
LED-Muster, der dritte greift das Motiv mit begrenzt gesteigerter Helligkeit
wieder auf. Das Finale behält seine vorhandene Motiv-Rückkehr. Die Richtungen
der Crew-Wellen wechseln mit dem Refrain-Besuch. Geeignete Kontrastclips
variieren ebenfalls; Song-Gedächtnis und Tanzdialog behalten ihren Clip-Vorrang.
Rap, Wortfokus, reduzierte Bewegung und manuelle Lichtregie behalten ihre
bisherigen Schutzregeln. Hand-/Fußspuren starten bei einem Lead-/Partnerwechsel
mit einer neuen Messbasis und verbinden keine verschiedenen Avatare.

## Prüfungen

- `npm run test:music:analysis`: konstante Basspegel, RMS-Rauschgrenze,
  DC-Korrektur, getrennte Akzente, Bildraten, Aufnahmeunterbrechung,
  Ruhe-/Worker-Schutz, ungültige Zahlen, 120→150 BPM sowie Refrain-Kontrast.
- `tests/e2e/music-analysis-quality.spec.cjs`: echter Web-Audio-Oszillator
  speist einen Test-MediaStream mit 120 BPM in die tatsächliche Mikrofonanalyse,
  jeweils mit und ohne Worker. Anschließende Stille muss den gemessenen Takt
  freigeben. Spotify/Lyrics sind gemockt; kein reales Mikrofon wird verwendet.
- Bestehende Crew-, Rig-, Lyrics- und Bühnenprüfungen bleiben im aktiven
  `test:v1136`-Pfad. Die neuen Prüfungen gehören ebenfalls dazu.

Die vollständige Projekt-ZIP enthält Quellcode, Avatare, Tests und Dokumentation,
aber keine Playwright-Berichte, Videos, Traces oder installierten Abhängigkeiten.
