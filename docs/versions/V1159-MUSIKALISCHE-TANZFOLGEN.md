# Musikalische Tanzfolgen und bewegungsgebundene Effekte

Der Konzertmodus verbindet die vorhandenen Ganzkörperclips mit vier- oder
achttaktigen Bewegungsbögen. Die aufgeräumte Ansicht mit zwei Schaltflächen und
festem Lyrics-Bereich bleibt bestehen. Die Option **Musikalische Tanzfolgen und
Crew-Wellen** unter **Show steuern** schaltet die neue Tanzebene einschließlich
Handspuren und Fußakzenten ab; die Auswahl bleibt lokal gespeichert.

## Musik als Bewegungsquelle

`measuredMusic` übernimmt zusätzliche normalisierte Bass-, Snare-, Höhen- und
Attack-Werte ausschließlich aus der bereits aktiven Mikrofonanalyse. Eine
verriegelte Beatphase und mindestens 0,7 Konfidenz sind erforderlich. Die
Anwendung aktiviert weder Mikrofon noch Gerätefreigaben selbstständig.

Bass zusammen mit einem gemessenen Onset betont Körpergewicht und kann bei der
nächsten geeigneten Clip-Auswahl Heel-Toe-Fußarbeit bevorzugen. Der vorhandene
Snare-/Attack-Schätzer setzt kurze Arm-/Kopfakzente und kann präzise Stopps
bevorzugen. Höhen ohne starken Attack erhalten fließende Schulter-/Armbewegung.
Diese Band- und Onset-Heuristiken trennen keine Instrumentenspuren und erkennen
keine Melodie. Ohne belastbare Messung laufen die Phrasen im bestehenden
Songtakt weiter; die Telemetrie kennzeichnet sie als nicht gemessen.
Ungültige Zahlen werden neutralisiert, gemessene Stille beruhigt diese Ebene.

## Tanzdramaturgie

`lib/concertDancePhrases.ts` plant vier Phasen: Motiv vorstellen, entwickeln,
kontrastieren und auflösen. Neon und Groove verwenden vier Takte, Lichtkino
und Festival acht. Die Phasen folgen dem integrierten Crew-Beat, einschließlich
der vorhandenen Tempoglättung. Beim Springen im Song lässt sich derselbe Plan
rekonstruieren. Die Inszenierung und ihre gespeicherte Variante beeinflussen
den Clip-Kontrast; dafür kommen nur tatsächlich vorhandene Clips infrage.

Eine vollständige Song-Erinnerung oder ein laufender Tanzdialog behält seinen
gewählten Clip. Die neue Ebene ergänzt diese Szenen mit ihren Bewegungsbögen.
Ansonsten können Fußarbeit, Ganzkörpermotiv und Drehphrase aufeinander folgen.
Wechsel erfolgen weiterhin an Taktgrenzen und mit einer Mindesthaltezeit von
zwei Takten, mindestens 2,5 Sekunden. Bestehende Übergänge und Fußkontakt-IK
bleiben aktiv. Es entstehen keine zufälligen Clip-Wechsel bei jedem Onset.

Der Lead führt, Partner spiegeln oder antworten in einer räumlich geordneten
Welle. In der Auflösungsphase bekommt die ganze Crew eine gemeinsame Antwort.
Die Additionen nutzen nur die bereits begrenzten Oberkörperkanäle. Becken,
Beine, Fußkontakte und Bühnenwege behalten ihre bisherigen Besitzer.
Manuelle Clips, Pause und reduzierte Bewegung haben Vorrang. Dichte Rap-Zeilen,
wichtige Wörter, Aufbauphasen und Atempausen unterdrücken die neue Tanzebene.

## Beobachtete Bewegungseffekte

`lib/concertMotionEffects.ts` beobachtet die tatsächlichen Weltpositionen der
Hände und Füße des Leads und Partners. Kurze Handspuren erfordern messbare,
begrenzte Geschwindigkeit. Pro Hand werden höchstens sechs Positionen behalten.
Ein gemeinsamer LineSegments-Draw stellt maximal 20 Segmente dar; auf der
mittleren Effektstufe sind es acht. Es werden keine neuen Renderer oder Timer
angelegt. Die dynamische Geometrie wird beim Abbau freigegeben.

Der bekannte Knöchel-/Sohlenabstand der enthaltenen Rigs und ihre Welt-Skalierung
werden berücksichtigt. Ein Fuß muss zuerst sichtbar über den Bühnenboden schwingen und danach wieder
nahe dem Boden abwärts eintreffen, bevor ein kleiner Ring erscheint. Statische
Füße erzeugen keine Schläge. Ein Mindestabstand von 1,2 Sekunden begrenzt die
Akzente; es gibt höchstens einen Ring. Ein geplanter Refrain-/Finale-Akzent hat
Vorrang vor diesem Ring. Dies beobachtet Fußbewegung und simuliert keine
Kollisionsphysik.

Große Orts-/Zeitänderungen, fehlende Knochen, schlechte Abtastrate, Pause,
Rap-/Wortfokus, reduzierte Bewegung, manuelle Lichtregie und eine niedrige
Effektstufe löschen die Spuren. Beim Wiedereinstieg wird zuerst eine neue
Messbasis aufgebaut. Dadurch gibt es keine Spuren über die gesamte Bühne und
keine nachgeholten Landungen nach einem Seek. Die Effekte bleiben innerhalb
der bestehenden Bühnenfläche, außerhalb der festen Lyrics-Lesezone.

## Clips und Mixamo

Die elf enthaltenen Avatare und ihre ursprünglichen, selbst erzeugten
Ganzkörperclips werden weiterverwendet. In dieser Erweiterung sind keine neu
heruntergeladenen Motion-Capture-Clips enthalten. Lizenzierte Mixamo-Dateien
können über den vorhandenen Avatar-/Animationsimport ergänzt werden; dieser
behält bei manueller Wahl Vorrang. Die neuen Phrasen behaupten keine
Motion-Capture-Qualität und keine zusätzliche automatische Mixamo-Verbindung.

## Prüfungen und Diagnose

- `npm run test:concert:musical`: Phrasen, Wiederaufnahme, gemeinsame Rollen,
  Messkonfidenz, Bandantworten, Stille, ungültige Daten, echte beobachtete
  Hand-/Fußfolgen und Seek-/Pausenschutz.
- `tests/concert-musical-rigs.mjs`: alle elf echten GLBs; messbar unterschiedliche
  Oberkörperposen, finite Quaternionen, unveränderte Becken-/Fußpositionen und
  Freigabe beim Stoppen. Echte Handspuren und Fußlandungen werden zusätzlich
  in 0,6-, 1- und 1,8-facher Größe geprüft.
- `tests/e2e/concert-musical-dance.spec.cjs`: tatsächliche aktive Crew,
  gespeicherte Abschaltung, aufgeräumtes Layout, Pause/Seek und reduzierte
  Bewegung. Spotify und Lyrics werden im Browser gemockt.
- `sonic:crew-performance` meldet die tatsächlich dominante Aktion mit
  Phrasenphase, Rolle, Taktzahl und Messstatus. `sonic:concert-scenery` ergänzt
  die Anzahl sichtbarer Handsegmente und den beobachteten Fußakzent. Die
  Ereignisse enthalten weder Audio noch neue Lyrics-Daten.

Die Prüfungen sind in `test:v1136` und dessen Browserpfad eingebunden. Die
Projekt-ZIP enthält die Dokumentation und Tests, aber keine Playwright-Berichte,
Screenshots, Videos, Traces oder installierten Abhängigkeiten.
