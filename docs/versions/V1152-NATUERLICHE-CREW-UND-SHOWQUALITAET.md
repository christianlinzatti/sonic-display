# Natürlichere Crew, Musiksignale und überprüfbare Showqualität

Diese Erweiterung ergänzt das Song-Gedächtnis aus V1151 in fünf Bereichen. Die
Regie bleibt lokal: Kandidatenbewertung, gemessene Signale und gespeicherte
Vorlieben werden kombiniert. Ein externes Sprachmodell wird nicht aufgerufen.

## 1. Bewegungsqualität und Gewichtswechsel

Die adaptive Live-Crew nutzt die bereits vorhandenen temporären Fußanker im
bestehenden Zwei-Knochen-IK-Solver. Ein bestätigter Standkontakt hält die Position
begrenzt fest; bei Abheben, unplausibler Reichweite, Pause oder Zeitsprung wird
losgelassen. Es gibt keinen zusätzlichen Live-Solver, keine neue Hüftverschiebung
und keinen Eingriff in manuell ausgewählte Animationen. Die vorhandenen
Ganzkörper-Clips liefern Kniearbeit und Gewichtsverlagerung.

Auch die Probe nutzt nun diesen Solver. Ihr Clip-Übergang berücksichtigt die
realen Beinkurven beider Clips und verlängert die Überblendung bei einem
ungünstigen Haltungswechsel. Der Musikzeitpunkt bleibt erhalten. Explizite
Zeitsprünge zeigen direkt die gewählte Pose und übernehmen keine alten Anker.

`tests/show-realism-motion.mjs` prüft alle elf realen GLB-Rigs mit einer kleinen,
kontrollierten Hüftstörung in Idle_Breathe. Gemessen wird der horizontale
Restweg des Fußes vor und nach IK. Das ist ein reproduzierbarer Test der
Stabilisierung, keine Zusage von fehlerfreiem Bodenkontakt in jeder Choreografie.

## 2. Persönliche Antworten innerhalb der Crew

Zusätzlich zur bestehenden Übergabe von Ganzkörper-Motiven variieren nun
Antwortgesten und Blickkontakt nach Persönlichkeit: präzise Stopps, fließende
Antworten oder federnde Reaktionen. Kopf und Brust reagieren zeitlich geglättet;
Fußknochen und manuell gesetzte Formationen bleiben bei ihren bisherigen
Steuerungen. In Rap-Lesepassagen, Pausen und Ruhephasen entfallen diese Akzente.
Die Motive aus der Strophe und der gemeinsame Finale-Abschluss bleiben erhalten.

## 3. Tatsächliche Musiksignale

Nur die aktive Mikrofonanalyse mit bestätigter Phasenbindung und mindestens
0,7 Tempo-/Phasensicherheit darf zusätzliche Beat-Akzente liefern. Onset und
Beatphase erzeugen einen kleinen Licht- und Ausdrucksakzent; die gemessene
Vorbereitung kann den Oberkörper sanft vorausnehmen. Sehr geringe gemessene
Energie reduziert Bewegung und Licht. Ungültige oder unsichere Werte fallen
auf die vorhandene Planung zurück.

Die Mikrofonfunktion wird dadurch nicht eingeschaltet. Spotify-Schätzwerte
werden nicht als gemessene Beats ausgegeben. Gemessene Akzente überschreiben
keine Lyrics-Struktur, manuelle Kamera oder reduzierte Bewegung. Schlüsselwörter
und schnelle Lyrics behalten ihren ruhigen Kameraraum. In der Show-Probe bleiben
die simulierten Daten maßgeblich; dort wird das Live-Mikrofon nicht eingemischt.

## 4. Lokales Gedächtnis gegen Wiederholungen

**Abwechslung über mehrere Songs merken** speichert bis zu 24 Song-Kennungen
mit höchstens sechs tatsächlich gewählten Ganzkörper-Motiven und vier
angewendeten automatischen Kameravarianten. Seit [V1156](V1156-AI-SHOW-INSZENIERUNGEN.md)
kommen bei aktiver Show-Planung optional Konzept und Variantenummer hinzu.
Titel, Lyrics, Audiodaten und
Zeitstempel werden nicht gespeichert. Die letzten acht anderen Songs erhalten
abgestufte Wiederholungsabzüge. Explizite Motiv-Vorlieben bleiben wirksam;
ruhige Genre-Regeln werden nicht umgangen.

Ein Song bestraft seine eigenen Motive nicht. Dadurch bleibt sein roter Faden
bei Seeks und im Finale bestehen. Kameraabwechslung nutzt kleine seitliche
Phrasenfahrten oder ein leicht weiteres Bild. Lyrics-Halten, gemeinsame Bilder
und manuelle Aufnahmen behalten Vorrang. Kameraeinträge werden nur bei aktiver,
automatischer Wiedergabe gesammelt, außerhalb des Renderaufrufs und ohne
Speicherzugriff pro Bild. Probeclips werden nicht als Live-Erfahrung gespeichert.

Der Verlauf überlebt einen Reload. Die Checkbox schaltet Lernen und Einfluss
aus, **Show-Verlauf löschen** entfernt die Einträge. Die separat bewerteten
Motiv-Vorlieben bleiben beim Löschen erhalten. Bei laufender Show können neue
Beobachtungen wieder einen aktuellen Eintrag anlegen; die Checkbox stoppt dies.
Alle Werte nutzen den vorhandenen
lokalen Crew-Speicher; es gibt keinen Upload.

## 5. Messung und Tests

Die laufende Probe zeigt Pose-Proben, Sekunden mit bestätigtem Standkontakt,
Sekunden mit möglichem Fußrutschen und abrupte Hüftwechsel. Fußrutschen wird aus
der tatsächlichen horizontalen Fußbewegung bei ausreichend sicherem Standkontakt
geschätzt. Fehlende Kontakte werden nicht als gute Messung gewertet. Pausen,
Seeks und fehlende aufeinanderfolgende Bilder unterbrechen die Messreihe.
Grenzwerte sind technische Hinweise, keine physikalische oder ästhetische Note.

Die Hauptkamera und die automatische Basiskamera ergänzen den Kamera-Statusbericht um gemessene Proben und
auffällige große Positionswechsel. Vier solche Wechsel innerhalb von zehn
Sekunden markieren eine auffällige Schnittfolge. Die Messung läuft im vorhandenen Frame-Ablauf;
bei manueller Kontrolle, Pause und reduzierter Bewegung wird sie unterbrochen.
Die bestehenden Qualitätsinspektoren bleiben für Körperprojektion und mögliche
Lyrics-Überlappung zuständig. Geometrische Überlappung misst keine Pixelverdeckung
und keine Textkontraste.

- `tests/show-realism.cjs`: wirksame Wiederholungsabzüge, Grenzen/Normalisierung,
  Genre-Schutz, Mikrofon-Vertrauen und Rückfall, persönliche Antworten sowie
  absichtlich injizierte Fehler für Fußrutschen, Hüftsprung, Kameraschnitt und
  abgeschnittene/überlappende Lyrics.
- `tests/show-realism-motion.mjs`: elf echte GLBs, kontrollierte Störung,
  nachgewiesene Standkontakte, begrenzte Stabilisierung und Freigabe bei Pause.
- `tests/e2e/show-realism.spec.cjs`: Verlauf samt Reload/Abschalten/Löschen,
  reale Crew-Probe mit Messwerten und unterschiedlichen Antworten, tatsächliche
  Live-Erfahrung, Kameramessung und Lyrics-Geometrie auf Desktop und Touch.
- Die bisherigen Tests für Song-Gedächtnis, Finale, Rap-Kamera, Tempoänderungen,
  fehlende Lyrics und ungültige Zeitmarken bleiben bestehen.

Spotify und Lyrics werden in den Browserprüfungen vollständig gemockt. Der
Projekt-Download enthält Quellcode und Tests, keine Playwright-Berichte,
installierten Abhängigkeiten oder Build-Ausgaben.

## Eigene Mixamo-Clips ergänzen

Die bestehende Bewegungsbibliothek unterstützt eigene Motion-Dateien und eine
Prüfung ihrer Knochenzuordnung, Bewegungskurven und Übergänge. Für Mixamo:

1. Einen zur eigenen Figur passenden Tanz auswählen und selbst herunterladen.
2. Für den vorhandenen GLB-Motion-Import gegebenenfalls mit Blender in GLB
   umwandeln; die bestehende FBX-Funktion ist unter
   [FBX-Import](../features/avatars/FBX_IMPORT_V65.md) beschrieben.
3. Den Clip in der Bewegungsbibliothek prüfen, auf dem Ziel-Avatar ansehen und
   erst dann zuweisen. Abweichende Restposen oder Achsen können Retargeting
   erfordern; Root Motion wird bewusst nicht ungeprüft übertragen.
4. Vor dem Weitergeben der Projekt-ZIP die geltenden Rechte zur konkreten
   Einbettung/Weitergabe prüfen. Download und Weiterverteilung sind verschiedene
   Nutzungsarten.

Es wurden keine Mixamo-Dateien aus einem fremden Konto heruntergeladen oder in
diese ZIP eingebaut. Weitere Rig-Hinweise:
[Avatar-Retargeting](../features/avatars/AVATAR_RETARGETING_V88.md).
