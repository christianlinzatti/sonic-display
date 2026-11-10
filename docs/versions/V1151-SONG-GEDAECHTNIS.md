# Song-Gedächtnis, Finale und persönliche Vorlieben

## Ganze Songs inszenieren

Die lokale Regie verwendet ein reproduzierbares Grundmotiv und ein dazu
passendes Antwortmotiv. Das frühe Motiv erscheint in einer geeigneten
Strophenphase ab Sekunde 16. In Refrains greifen ausgewählte Planphrasen
abwechselnd Motiv und Antwort auf; andere Phrasen behalten Raum für Fußarbeit
und die vorhandene Genre-Auswahl. Der Oberkörperausdruck steigert sich mit
wiederholten Refrains, ohne zusätzliche Sprünge auf die gebackene Beinarbeit
zu legen.

Bei bekannter Songdauer verbindet das Finale drei Teile: Motiv-Rückgriff,
Antwort und gemeinsamen Abschluss. Die Regie plant diese Abschnitte aus der
letzten Zehntelstrecke des Songs. Ihre Clipwechsel bleiben an musikalische
Taktgrenzen gebunden; diese Finale-Übergaben dürfen die übliche lange Haltezeit
verkürzen. Bei einem sehr kurzen Ende oder sehr langsamem Tempo können dadurch
weniger Abschnitte tatsächlich ausgespielt werden. Ruhe, Aufbau und schnelle
Lyrics behalten ihre Priorität. Ein ausdrücklich vorgegebenes oder energiearmes Outro wird nicht künstlich
zu einem Drop umgedeutet. Ein höchstens drei Sekunden langer Ausklang zwischen
der letzten gültigen Lyrics-Endzeit und dem bekannten Songende darf den
geplanten Abschluss noch halten; längere Textlücken bleiben ruhig.

Das Gedächtnis rekonstruiert einen Plan aus Songkennung, Genre, vorhandenen
Lyrics-Zeitmarken, Position und Vorlieben. Es speichert keine gehörte Musik
oder komplette Sitzungsverläufe. Dieselben Eingaben liefern nach einem Seek
denselben Plan. Spät eintreffende oder geänderte Genredaten und ausdrücklich
geänderte Vorlieben können die Auswahl beeinflussen; der tatsächliche Tänzer
wechselt weiterhin erst an erlaubten Übergängen. Die Genre-Datenquelle und der
Motivstatus sind an der bestehenden Regieanzeige prüfbar.

## Bewegungsqualität

Die Probenüberblendung verwendet eine Kurve mit verschwindender erster und
zweiter Ableitung an beiden Enden. Sie beginnt weiter aus der tatsächlich
angezeigten Pose, auch wenn eine Überblendung unterbrochen wird.

Auf der Live-Bühne bewertet die vorhandene Bein-/Fuß-Übergangsplanung nun die
tatsächlich vorgesehene Musikphase des nächsten Crew-Clips. Eine zuvor nur für
die Pose gesuchte Einstiegszeit wird nicht mehr als Messgrundlage verwendet,
wenn der gemeinsame Musik-Takt sie direkt danach ersetzen würde. Bestehende
Fuß-IK, Bodenkontakte, manuelle Timelines und importierte Clips behalten ihre
Zuständigkeit. Es gibt keinen zusätzlichen Fuß- oder Hüft-Schreiber.

Dies verbessert Übergänge und vermeidet unnötige Phasenfehler; es ersetzt keine
hochwertigen Motion-Capture-Aufnahmen und garantiert kein vollständiges
Eliminieren von Fußrutschen. Eigene passend lizenzierte Mixamo-Motions können
anschließend über die vorhandene Motion-Bibliothek ergänzt werden. Für dieses
Update wurden keine fremden Motion-Capture-Dateien heruntergeladen.

## Lyrics, Kamera und Licht

Die seitliche automatische Kamerakomposition verwendet eine weiche Hüllkurve
über die vorhandenen acht Sekunden langen Planphrasen. Die Bewegung beginnt
und endet mit flacher Kurve. Das sind Planblöcke, keine neue Erkennung echter
musikalischer Phrasen oder Taktarten.

Ein hervorgehobenes Refrain-Schlüsselwort mit vorhandenen gültigen Wortzeiten
hält den aktuellen automatischen Ausschnitt kurz fest und nimmt Strahlen
zurück. Der bestehende Rap-Lesefokus bleibt vorrangig. Ohne Wortzeitmarken
werden keine Schlüsselwort-Zeitpunkte erfunden. Manuelle Kameras und Reduced
Motion bleiben geschützt.

Eine mindestens zehn Sekunden lange, beidseitig durch synchronisierte Lyrics
begrenzte Textlücke darf bei ausreichender vorhandener Energie ein größeres
Bühnenbild bekommen. Vor dem nächsten Texteinsatz wird dieses Bild wieder
zurückgenommen; eine Refrain-Vorschau hat Vorrang. Eine solche Lücke ist nur
ein Strukturhinweis und kein gemessener Nachweis einer Instrumentalpassage.
Fehlende oder unsynchronisierte Lyrics lösen diese Heuristik nicht aus.

## Vorlieben auf diesem Gerät

Settings → Avatar → **Intelligente Show aktivieren**. Für gemeinsame Szenen
mindestens zwei Sonic-Figuren verwenden, zum Beispiel über **Trio auf der Bühne
einrichten**. In der Show-Simulation erscheinen bei tatsächlich ausgewerteten
Ganzkörper-Motiven die Schaltflächen **Mehr davon** und **Weniger davon**.

Jeder bewusste Klick verändert eine der sechs Motiv-Vorlieben um einen Schritt
zwischen −3 und +3. Die kleine Bewertungstabelle wird in der bestehenden lokalen
Crew-Einstellung gespeichert. Sie enthält weder Songtext noch Audiodaten und
wird nicht an Spotify, Alexa oder einen Modelldienst gesendet. Die Gewichtung
beeinflusst individuelle Auswahl, Dialogpaare und das Song-Grundmotiv; sie kann
ruhige Genre-Regeln oder andere Schutzregeln nicht aushebeln. Während einer
Pause bleibt die Pose ruhig; neue Entscheidungen greifen bei der nächsten
geeigneten Auswertung beziehungsweise am nächsten erlaubten Übergang.
**Vorlieben zurücksetzen** stellt die neutrale Auswahl wieder her.

Das ist explizites lokales Präferenzlernen mit bewertender Planung, kein
trainiertes Sprachmodell und keine zusätzliche Audioanalyse.

## Tests und Auslieferung

- `npm run test:v1136`: bisherige Show-/GLB-Regressionen, Song-Rückgriffe,
  tatsächlich ausgespielte Finale-Phasen, Vorlieben und ihre Schutzgrenzen,
  Instrumental-Heuristik, Kamera-Halten sowie reale Bewegungsprüfungen aller elf
  GLB-Rigs mit der korrekten Eingangsphase.
- `tests/e2e/song-memory.spec.cjs`: tatsächliche Crew-Clips von Strophe bis
  Finale nach Seeks, lokale Bewertung samt Reload/Reset und lange Textlücken.
  Spotify und Lyrics werden gemockt; Desktop und Touch werden geprüft.
- Die bestehenden Regressionen und die mit dem Pull geholten Alexa-/Govee-Tests
  bleiben Teil der Überprüfung. Die neuen Vorlieben verändern keine Geräte-
  oder Voice-Einwilligungen.
- Der gesamte serielle Playwright-Prozess erhält wegen des gewachsenen Umfangs
  60 Minuten. Einzeltest-Limits, fehlende automatische Wiederholungen und strikte
  Prüfungen auf Fehler, übersprungene und instabile Fälle bleiben erhalten.

README und ARCHITECTURE sind erweitert. Die Projekt-ZIP enthält den aktuellen
Quellstand einschließlich der geholten Alexa-/Govee-Erweiterungen und Tests,
aber keine Playwright-Berichte, Build-Ausgabe oder installierten Abhängigkeiten.
