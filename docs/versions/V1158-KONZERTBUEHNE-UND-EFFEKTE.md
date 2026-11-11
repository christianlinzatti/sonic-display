# Aufgeräumte Konzertbühne mit Lyrics und gezielten Effekten

Der Konzertmodus bündelt LED-Bühnenbilder, geführte Spots, gezielte Akzente und
Refrain-Projektion. Der feste Lyrics-Bereich bleibt die primäre Lesezone. Alle
neuen Elemente nutzen den vorhandenen Song-Score und den bestehenden
Renderer-Takt. Ein externer AI-Dienst, zusätzliche Audiodaten oder neue
Motion-Capture-Dateien sind dafür nicht erforderlich.

## Bedienung und Bildschirm

**Konzertmodus starten** aktiviert die Bühne und die adaptive Crew. Auf dem
Bildschirm bleiben Bühne, Lyrics, eine kleine Titelzeile und zwei Schaltflächen:
**Konzertmodus verlassen** und **Show steuern**. Entdecken-, PWA-, Sprach- und
andere schwebende Bedienflächen werden währenddessen ausgeblendet, auch wenn
sie außerhalb des Hauptbildschirms liegen. Die laufenden Hintergrunddienste
werden dadurch nicht umkonfiguriert. Offene Einstellungen werden geschlossen.
Die Regie-Diagnose bleibt für Hilfstechnologien zugänglich und verschwindet aus
dem sichtbaren Bühnenbild. Künstler-Schilder über den Figuren werden ausgeblendet.

**Show steuern** öffnet eine kleine Bedienfläche mit drei Optionen:

- **Konzert-Bühnenbilder und Effekte**: gemeinsame Bühnenebene ein-/ausschalten.
- **Refrain zusätzlich auf LED-Wand zeigen**: dekorative Textprojektion steuern.
- **Effektstärke**: 0–100 %, standardmäßig 65 %. Null blendet die neue Ebene aus.

Escape schließt zuerst die geöffnete Show-Steuerung und setzt den Tastaturfokus
zurück. Ein weiteres Escape verlässt den Konzertmodus. Die gleichen Optionen
stehen auch unter Settings → Avatar. Bühnenbilder werden ausschließlich im
Konzertmodus angezeigt; der Regler allein startet keine Show außerhalb davon.

Die neue Bühne ist beim Eintritt standardmäßig an. Eine ausdrückliche
Abschaltung bleibt erhalten. Beim Verlassen wird der vorherige eigene
Aktivierungszustand wiederhergestellt; neue Regler- und Projektionsvorlieben
bleiben erhalten. Sitzungsspeicher und ältere Konzert-Sitzungen bleiben
kompatibel. Eine wiederaufgenommene ältere adaptive Konzert-Sitzung kann die
neue Bühne einmalig aktivieren, sofern keine ausdrückliche Auswahl vorliegt.

## LED-Bilder und Refrain-Wand

`lib/concertStageShow.ts` plant vier grafische Motive passend zum gewählten
Show-Konzept. Strophen beginnen mit einem Grundmotiv, Refrains öffnen ein
anderes Bild, Instrumentalpassagen können einen weiteren Kontrast zeigen.
Das Finale greift das Grundmotiv wieder auf. Der Shader mischt die Bildgewichte
weich, statt das Bild hart umzuschalten. Helligkeit, Öffnung und Farbe folgen
der gemeinsamen Songphase. Schnelle Lyrics und wichtige Wortakzente beruhigen
die Bühne. Pausen halten die Bildbewegung an; reduzierte Bewegung bleibt statisch.

Die optionale Refrain-Projektion verwendet dieselbe aktuell gültige,
zeilensynchronisierte Textzeile wie die vorhandenen Lyrics. Sie wird im oberen
Bereich einer einzigen LED-Fläche hinter den Figuren gezeichnet. Lange oder
nicht sinnvoll umbrechbare Zeilen werden dort weggelassen. Der feste Lesebereich
bleibt vollständig erhalten. Rap und fehlende beziehungsweise unsynchronisierte
Lyrics erhalten keine zusätzliche Projektion. Es werden keine Wortzeiten erfunden.

Die Projektion verwendet eine eigene wiederverwendete Canvas-Textur mit
768 × 432 Pixeln. Sie wird nur bei einem Zeilenwechsel neu gezeichnet und beim
Abbau freigegeben. Es gibt keine externen Fonts, Videos oder Medienabrufe.

## Licht und Höhepunkt-Effekte

Bis zu zwei schattenfreie, weiche Spotlights folgen den tatsächlichen
Crew-Wurzeln im bestehenden Three.js-Szenengraphen. Solist und Partner werden
gezielt beleuchtet. Ohne beobachtbare passende Bühnenwurzel wird kein Ziel
erfunden. Bei Rap oder Pause stoppt die Zielbewegung. Die vorhandene Grundbeleuchtung
bleibt bestehen. Die neue Szene übernimmt nur nicht manuell belegte dekorative
Standard-LEDs, Standard-Projektion, Standard-Bodenpuls und den Standard-Mittelspot,
damit diese nicht doppelt übereinander liegen.

Refrain-Eintritte können einen einzelnen Bodenring oder aufsteigende
Lichtpartikel auslösen. Für das Finale ist ein kleiner Konfetti-Akzent vorgesehen.
Wenn ein kurzer bekannter Schluss nach der letzten Textzeile verfügbar ist,
bekommt er Vorrang; andernfalls dienen der letzte passende Refrain oder ein
aus der bekannten Songdauer geplanter Schluss als Termin. Das ist eine
Inszenierung aus vorhandenen Zeitmarken, keine Vorhersage eines gehörten Drops.

Ein Effekt wird nur beim tatsächlich beobachteten Überqueren seines Termins
ausgelöst. Laden mitten im Song, deutliche Zeitsprünge, Wiederaufnahme oder spätes Eintreffen
von Daten holen keine versäumte Explosion nach. Bereits ausgelöste Akzente
werden innerhalb derselben Song-/Show-Variante nicht durch Zurückspringen
wiederholt. Die Liste bleibt auf 16 Einträge begrenzt; eine zusätzliche numerische
Zeitgrenze verhindert auch die Wiederholung älterer, bereits entfernter IDs. Gleichzeitig läuft
höchstens ein neuer Akzent. Rap, Wortfokus, Pause und reduzierte Bewegung
unterdrücken oder beenden bewegte Akzente.

Die Partikel bleiben hinter der Crew und oberhalb des Bühnenbodens. Sie werden
mit einer einzigen Instanz-Geometrie dargestellt, nicht als einzelne unabhängige
Meshes. Am Songende kann das Licht vier Sekunden weich nachklingen. Das startet
keinen eigenen Timer und keine weitere Avatarbewegung nach der Pause.

## Auftritt, Solo-Vorbereitung und Schluss

Die adaptive Crew begrüßt das Publikum mit kleinen, persönlich abgestimmten
Kopf-, Brust- und Armbewegungen. Der als Nächstes vorgesehene Solist erhält eine
vorbereitende Oberkörperbewegung. Gegen Ende gibt es einen gemeinsamen ruhigen
Abschluss. Das ergänzt die vorhandenen Schrittfolgen und Bühnenwege.

Die Eingriffe bleiben in den bereits begrenzten Oberkörper-Kanälen. Becken,
Beine, Fußkontakte und die Musikzeit werden nicht umgeschrieben. Pause,
reduzierte Bewegung, deaktivierte Reaktionen und manuelle Clips behalten Vorrang.

## Effektbudget und Besitzregeln

| Effektstufe | Zusätzliche Spots | Partikel | Bodenring |
| --- | ---: | ---: | --- |
| Hoch | bis 2 | bis 32 | möglich |
| Ausgewogen | bis 1 | bis 14 | möglich |
| Niedrig | bis 1 | 0 | aus |
| Reduzierte Bewegung | 0 | 0 | aus |

Die neue Ebene übernimmt die bestehende Geräte-Stufe als Obergrenze und
berücksichtigt den vorhandenen FX-Druck. Zusätzlich kann anhaltend langsame
gemessene Bildfolge sie nach jeweils 1,5 Sekunden um eine Stufe reduzieren.
Eine Erholung benötigt zwölf Sekunden schnelle Bildfolge pro Stufe. Das misst
Frame-Takt, nicht GPU-Millisekunden, und macht keine FPS-Garantie.

Manuelle Lichtsteuerung, gespeicherte Licht-Timelines, Blackouts und bestehende
eigene FX-Besitzer verhindern die Übernahme. Physische Lampen und Govee-/Alexa-
Freigaben werden nicht verändert; die neue Bühne sendet keine Gerätebefehle.

## Prüfungen und ZIP

- `npm run test:concert:stage`: Bildwechsel und Motiv-Rückkehr, Projektion,
  Rap-/Pausenschutz, adaptives Budget, einmalige Akzente, Seek-/Resume-Verhalten
  sowie validierte und wiederherstellbare Einstellungen.
- `tests/concert-stage-ceremony.mjs`: alle elf echten GLB-Rigs, unterschiedliche
  Oberkörperposen bei Auftritt/Solo/Finale, unveränderte Fußposen, sauberes
  Freigeben der Additionen und begrenzte Partikelpositionen.
- `tests/e2e/concert-stage-show.spec.cjs`: tatsächlicher Konzertbildschirm und
  Shader, kleine Steuerung, getrennte Lyrics-Zone, Refrain-Projektion, Finale,
  dichter Rap, reduzierte Bewegung und manuelle Licht-Timeline. Spotify und
  Lyrics sind gemockt; keine externen Browser-Anfragen sind erlaubt.
- Die neuen Prüfungen sind in den bestehenden aktiven Testpfad aufgenommen.
  Die Browser-Suite kann auf Desktop und Touch ausgeführt werden.

Die Projekt-ZIP enthält Figuren, Quellcode, Tests und Dokumentation. Playwright-
Berichte, Screenshots, Videos, Traces, Build-Ausgaben und installierte
Abhängigkeiten werden ausgeschlossen.
