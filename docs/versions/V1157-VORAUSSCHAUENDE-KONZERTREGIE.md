# Vorausschauende Konzertregie und überprüfbare Shows

Die vier lokalen Show-Konzepte planen jetzt kommende Szenen, entwickeln
wiederkehrende Crew-Paare und geben Refrains ein wiedererkennbares Textbild.
Die Erweiterungen laufen bei aktiver **AI-Show-Planung** mit der adaptiven Crew.
Der Konzertmodus aktiviert sie, sofern sie nicht ausdrücklich abgeschaltet wurde.

## 1. Höhepunkte vorbereiten

`lib/concertScenePlan.ts` schaut bis zu 16 Sekunden voraus, entsprechend zwei
bestehenden Regie-Phrasen von je acht Sekunden. Es hält höchstens zwei nächste
Szenen bereit. Mehrere wiederholte Textzeilen desselben Refrains gelten als eine
Szene. Ohne aktives Mikrofon nutzen alle Regiepfade denselben Planungs-Energiewert;
ruhige Ersatzwerte der Audioanzeige werden nicht als Songmessung ausgegeben.
Bei synchronisierten Lyrics nutzen die Live-AI-Pfade deren gemeinsame
Abschnittsgrundlage statt eines zweiten automatischen Abschnitts-Fallbacks.
Die frei wählbaren Szenen-/Energiewerte der Probe bleiben erhalten.
Die Refrain-Termine stammen aus vorhandenen Lyrics-Zeitmarken, der
vorgesehene Finale-Termin aus 90 % der bekannten Songdauer. Das ist eine lokale
Inszenierungsplanung, keine Erkennung noch ungehörter Musik oder Textbedeutung.

In den letzten acht Sekunden vor dem nächsten Ziel steigt eine Kurve mit
weichem Anfang und Ende an. Automatische Kamera und virtuelles Licht bauen
zurückhaltend Spannung auf. Die automatische Konzert-Crew bereitet die Position
des nächsten Solisten vor: Der Zieltiefenwechsel wird mit maximal 65 %
vorweggenommen. Die bestehenden festen Laufspuren, Abstandskontrollen,
Standkontakt-Regeln und die Geschwindigkeitsgrenze bleiben zuständig.

Schneller Rap, aktuelle Wortakzente und ruhige Atempausen stoppen diese
Vorbereitung. Manuelle Kameras, Clips und Lichtshows behalten Vorrang. Eigene
Govee-Freigaben und Befehle werden durch diese Erweiterung nicht geändert.

## 2. Natürlichere Tanzwechsel

`lib/crewTransitionEvidence.ts` ergänzt den Körperhaltungsvergleich um die
unmittelbar folgende Beinpose, die Hüftgeschwindigkeit und die Drehrichtung.
Die kurze Vorschau wird an das vorhandene Tempo angepasst. Standbein-Gewichte
stammen weiterhin aus tatsächlich beobachteten IK-Kontakten. Bei stark
unpassenden Posen und zwei belasteten Füßen darf ein freier Wechsel warten.

Die Auswahl läuft nur an bereits freigegebenen Wechselpunkten. Gemeinsame Hits,
Motiv-Rückkehr und geschützte Textpassagen behalten ihre Regeln. Clips, Rig und
Musikzeit werden nicht verändert. Fehlende brauchbare Posen ergeben den
bisherigen Fallback. Die Entscheidung verbessert eine Übergangswahl; sie ist
keine Behauptung, dass jede Fußbewegung bereits Motion-Capture-Qualität erreicht.

Neue Mixamo-Dateien sind nicht enthalten. Vorhandene externe Motion-/GLB-
Importwege bleiben verfügbar; ausdrücklich ausgewählte externe Clips behalten
Vorrang. Für eigene Mixamo-Clips gelten weiterhin die Importhinweise unter
[Natürliche Crew und Showqualität](V1152-NATUERLICHE-CREW-UND-SHOWQUALITAET.md).

## 3. Wiederkehrende Crew-Beziehungen

Zwei bis vier Figuren bilden reproduzierbare Paare aus Song, Konzept und
Variante. Ein Paar bleibt über drei Dialog-Szenen verbunden: Kennenlernen,
Antworten und Wiederfinden. Danach kommt ein anderes Paar an die Reihe.
Innerhalb einer Szene wechseln Motiv, Antwort und gemeinsamer Abschluss weiter
im bestehenden Phrasenraster. Im Finale kehrt das erste Paar zurück.

Die Motivauswahl verwendet innerhalb dieses Bogens denselben Themen- und
Antwort-Seed. Vertraute Antworten bekommen etwas kleinere, persönlich
abgestimmte Kopf-/Schulterreaktionen. Füße und Laufwege bleiben beim bestehenden
Bewegungssystem. Seeks rekonstruieren den Bogen direkt; ein im Hintergrund
laufender Gesprächsverlauf wird nicht benötigt oder gespeichert.

## 4. Lyrics als wiederkehrendes Bild

`lib/concertLyricIdentity.ts` gibt einer wiederholten Zeile dieselbe kleine
grafische Signatur und im Refrain eine feste Konzeptfarbe. Damit erscheint eine
bekannte Textstelle auch bei späteren Refrains wiedererkennbar. Strophen haben
einen zurückhaltenderen Rahmen. Die Signatur ist rein dekorativ, belegt keinen
Platz im Textfluss und verändert keine Zeilenpositionen oder Schriftgrößen.

Rap bekommt keine Signatur und bleibt bewegungsarm. Bestehende Wortakzente
nutzen ausschließlich geprüfte Wortzeitmarken. Ohne Lyrics oder gültige Zeiten
wird kein erfundener Textablauf dargestellt. Reduzierte Bewegung und Pausen
behalten ihre bisherigen Schutzregeln.

## 5. Show-Check über den Song

Unter **Settings → Avatar → Show-Check · Live-Messung** stehen die bisher
beobachteten Sekunden und Hinweise für den aktuellen Song. Die Messung nutzt
die bestehenden Wiedergabe-Updates; sie legt keinen eigenen Timer an.

- Lyrics: tatsächlich gemessene sichtbare Zeile, Lesezone und im Konzertmodus
  die Überschneidung mit der Bühnenfläche. Dies ist keine Erkennung verdeckter
  Körperteile oder eine Auswertung des Liedinhalts.
- Kamera: tatsächliche automatische Kamerapositionen aus dem vorhandenen
  Statusbericht. Manuelle und geschützte Kamerawege werden nicht bewertet.
- Tänze: ausschließlich geladene, ausgewählte und überwiegend gewichtete
  Animationen des Live-Mixers. Eine Planungsvorschau zählt nicht als Wiedergabe.

Der Check meldet Text außerhalb der Lesezone, Überschneidungen mit der
Konzertbühne, deutliche Kamerasprünge, anhaltende Kamerabewegung bei Rap,
sehr schnelle Tanzwechsel und lange unveränderte Motive. Bewusste Motiv-Rückkehr,
Dialoge, Refrains, Finale und ruhige Passagen gelten nicht als festgefahrener Tanz.

Nur zusammenhängende laufende Wiedergabe zählt zur Song-Abdeckung. Pausen,
versteckte Tabs, geöffnete Dialoge, reduzierte Bewegung und Seeks unterbrechen
diesen Zusammenhang. Wiederholt betrachtete Abschnitte werden nicht doppelt
gezählt. Erst mindestens 95 % Abdeckung einschließlich Anfang und Ende ergibt
**Ganzer Song erfasst**. Sonst steht dort **Ausschnitt erfasst**. Kamera-, Text-
und Tanz-Messzeiten werden getrennt gezeigt; fehlende Daten sind keine bestandene
Qualitätsprüfung. Ein Hinweis betrifft ausschließlich die erfassten Daten.

Der Check bleibt im Arbeitsspeicher für den aktuellen Song. Er speichert keine
zusätzlichen Lyrics, Audioaufnahmen oder Diagnosen im lokalen Show-Verlauf.
Beim Trackwechsel beginnt eine neue Messung. Fußrutschen und Hüftsprünge können
weiterhin über die vorhandene gemessene Bewegungsqualität in der Crew-Probe
geprüft werden; der neue Live-Check behauptet dafür keine vollständige Messung.

## Tests

- `npm run test:concert:whole`: Vorschau und Schutzregeln, wiederkehrende Paare,
  stabile Lyrics-Signaturen sowie gezielt injizierte Kamera-, Layout- und
  Wechsel-Fehler. Vier vollständige Mock-Shows laufen mit drei echten
  GLB-Mixern/IK-Rigs einschließlich Tempoänderungen und Pause. Kamera-Zielwerte
  werden dabei als Planung geprüft; ohne Browser werden keine gerenderten
  Kamera- oder Textmessungen behauptet.
- `tests/concert-pose-motion.mjs`: Posenwahl und reale Standkontakte aller elf
  Figuren; die vorhandenen Bewegungsprüfungen bleiben erhalten.
- `tests/e2e/concert-scene-direction.spec.cjs`: frühzeitige Vorbereitung,
  wiederkehrende Refrain-Bilder, Rap-Schutz, tatsächliche Crew-Motive und Partner
  über mehrere Kapitel sowie Live-Messung von Kamera, Lyrics und Tanzaktionen.
  Spotify und Lyrics sind vollständig gemockt.
- Beide neuen Node-Prüfungen und die neue Browser-Suite sind in die aktiven
  Prüfpfade eingebunden. Der Browser-Test kann zusätzlich auf Touch laufen.

Die vollständige Projekt-ZIP enthält Quellcode, Figuren, Tests und Dokumentation,
aber keine Playwright-Berichte, Videos, Traces, Build-Ausgaben oder Abhängigkeiten.
