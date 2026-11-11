# Abwechslungsreiche Konzertshows mit Lyrics

Die lokale Regie wählt jetzt ein zusammenhängendes Show-Konzept für den Song.
Die Auswahl bewertet Genre-Familie, gemessene Wiederholungen und Zeilendichte
der synchronisierten Lyrics, Motiv-Vorlieben und den bisherigen Show-Verlauf.
Es handelt sich um lokale Kandidatenbewertung mit vier gestalteten Konzepten,
ohne externes Sprachmodell, zusätzliches Audioverfahren oder behauptete
Erkennung von Textbedeutung und Stimmung.

## Bedienung

Der **Konzertmodus** aktiviert die Show-Planung, solange sie nicht ausdrücklich
abgeschaltet wurde. Unter **Settings → Avatar → Abwechslungsreiche Konzertshows**
kannst du die **AI-Show-Planung aktivieren**, die automatische Auswahl verwenden
oder ein Konzept vorgeben. Außerhalb des Konzertmodus schaltet
**Intelligente Show aktivieren** die benötigte adaptive Crew-Regie ein:

| Konzept | Charakter |
| --- | --- |
| Neon-Pulse | Kühle Cyan-/Violett-Akzente, präzise Motive, Wechsel von Dialog und Gruppenbild |
| Lichtkino | Warme, ruhige Lichtbilder, weichere Körpersprache, mehr Portrait-Szenen |
| Groove-Session | Warme Amber-/Mint-Akzente und häufigere Antwort-Szenen |
| Festivalbogen | Rosa-/Lavendel-Akzente, kräftigere Ausdruckskurven und größere Gruppenbilder |

**Neue Show-Version** variiert die Motivauswahl und die Szenenfolge. Bei
automatischer Auswahl wird ein anderes als das zuletzt tatsächlich gespielte
Konzept dieses Songs gewählt. Ein manuell gewähltes Konzept bleibt erhalten;
seine Variante ändert sich. Bestehende sichere Tanzübergänge bleiben zuständig.
Beim Verlassen des Konzertmodus wird der vorherige Aktivierungszustand
wiederhergestellt. Eine zwischenzeitliche Abschaltung bleibt erhalten.

## Gemeinsame Dramaturgie

`lib/showProduction.ts` erstellt den Plan ohne eigene Timer. Alle Beteiligten
verwenden die bestehende Songposition und dieselbe Song-Kennung: Die Crew
bekommt einen gemeinsamen Motiv-Seed und abgestimmte Ausdrucksstärke, die
automatische Kamera leichte Szenenvarianten, die vorhandenen virtuellen Lampen
eine sanfte Farbgebung und die Lyrics eine dezente Rahmenfarbe. Die Ausgabe
der Show-Regie zeigt den Konzeptnamen.

Das frühe Motiv und seine Antwort bleiben innerhalb einer Variante über den
Song hinweg verbunden; das Finale greift dieses Motiv wieder auf. Die Auswahl
ändert sich nicht mit jedem Energieausschlag. Verse erlauben Portraits,
Dialoge und Gruppenbilder; Aufbau, Refrain und Finale erhalten eigene Szenen.
Schneller Rap und hervorgehobene wichtige Wörter haben Vorrang: ruhige
Leseszene, keine zusätzlichen Kamera-, Licht- oder Bewegungsgains. Refrains
bekommen einen etwas stärkeren Rahmenakzent, ohne Schriftgröße, Position oder
Zeilentiming durch das Konzept zu verändern. Wortakzente bleiben an tatsächlich
vorhandene Wortzeitmarken gebunden. Fehlende Lyrics lassen die Tanzshow weiterlaufen.

Manuelle/geschützte Kameras, eigene Lichtshows, Blackouts, Pausen und reduzierte
Bewegung behalten ihre bestehenden Regeln. Die Farbgebung ergänzt ausschließlich
die virtuellen Bühnenlampen. Sie sendet keine zusätzlichen Govee-Befehle.
Ambient/Klassik bleibt bei einer neuen automatischen Auswahl bei den ruhigeren Konzepten.
Es werden die bestehenden Figuren und Clips verwendet, keine neuen Mocap-Dateien.

## Lokales Gedächtnis

Bei tatsächlicher adaptiver Wiedergabe speichert der begrenzte Verlauf optional
`production` und `take` zusätzlich zu Song-Kennung, Motiven und Kameravarianten.
Dadurch bleibt die gespielte Variante nach Reloads, Seeks und später eintreffenden
Genre-Metadaten erhalten. Der aktuelle Song bestraft seine eigenen Motive nicht.
Die letzten acht anderen Songs beeinflussen die Abwechslung; maximal 24 Songs
werden gespeichert. Die Variantenummer ist auf 0–999 begrenzt. Vorschau und
pausierte Auswahl schreiben keine gespielte Inszenierung in den Verlauf.

**Abwechslung über mehrere Songs merken** schaltet diese Speicherung ab;
**Show-Verlauf löschen** entfernt sie unabhängig von Motiv-Vorlieben.
Ohne Verlauf bleibt die Auswahl reproduzierbar, kann aber nach einem Reload bei
veränderten Metadaten neu ausfallen. Lyrics, Audiodaten, Titel und Zeitstempel
werden nicht im Verlauf gespeichert. Alte Datensätze bleiben kompatibel.

## Prüfung und Projekt-ZIP

- `tests/show-production.cjs`: 32-Song-Folge, vier Konzepte, gespeicherte
  Varianten, neue automatische Variante, tatsächliche Konzept-Motive für alle elf
  Figuren, sanfte Genres, identisches Finale-Motiv,
  Text-/Kameraschutz, validierte Einstellungen und ältere Datensätze.
- `tests/e2e/show-productions.spec.cjs`: vier echte UI-Auswahlen und abgestimmte
  Lyrics-Farben, Reload und Abschaltung, tatsächlich spielende Drei-Avatar-Crew
  mit gespeichertem Konzept sowie schnelle Rap-Lyrics ohne erfundene Wortzeiten.
  Spotify und Lyrics sind gemockt, externe Browser-Anfragen werden abgefangen.
- Beide Prüfungen sind in den aktiven `test:v1136`-Prüfpfaden eingebunden.
  Die neue Browser-Suite kann zusätzlich mit dem Touch-Projekt laufen.

Die ZIP enthält das vollständige Projekt einschließlich Figuren, Quellcode,
Tests und Dokumentation. Playwright-Testberichte, installierte Abhängigkeiten
und Build-Ausgaben sind ausgeschlossen.
