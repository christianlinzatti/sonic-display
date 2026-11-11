# Konzertmodus, körperbezogene Tanzwahl und räumliche Crew

## Konzertmodus

**Konzertmodus starten** öffnet eine Ansicht innerhalb des Browserfensters mit
hoher 3D-Bühne, näherer automatischer Kamera und fester Lyrics-Zone darunter.
Entdecken-, Einstellungs- und Player-Flächen verschwinden. **Konzertmodus
verlassen** und Escape führen zurück. Browser-Vollbild wird nicht angefordert.

Die Ansicht aktiviert vorübergehend Avatar-Darstellung, sichtbare Cinematic-Lyrics
und adaptive Crew-Regie. Seit [V1156](V1156-AI-SHOW-INSZENIERUNGEN.md) wird
zusätzlich die Show-Planung aktiviert, sofern sie nicht ausdrücklich abgeschaltet wurde.
Generische Gruppen erhalten eine automatische Crew mit
bis zu vier Figuren; songgebundene Gruppen werden erhalten. Beim Verlassen
werden die eigenen Anzeigeänderungen und unveränderte temporäre Gruppen
zurückgesetzt. Vorlieben und neu gesammelte Show-Erfahrung bleiben bestehen.
Manuelle Clips und Kameraaufnahmen behalten ihre Priorität. Reduzierte Bewegung
schaltet keine neue Reisebewegung ein. Seit [V1155](V1155-KONZERT-SITZUNG-UND-MOBILANSICHT.md) wird der Modus
im aktuellen Browser-Tab auch nach einem Reload fortgesetzt. Fehlende Lyrics bekommen einen ruhigen Hinweis in derselben Zone.

Kamera und Licht nutzen weiterhin denselben Song-Score: freie Passagen erhalten
ein näheres Bühnenbild und eine kleine Lichtverstärkung; Schlüsselwörter und Rap
behalten ihre Ruhe. Die feste Lyrics-Fläche verhindert ein Überlagern der Bühne.

## Auswahl nach tatsächlichen Körperkurven

Die Option **Körperhaltung bei freien Tanzwechseln berücksichtigen** ist im
Konzertmodus aktiv und auch separat in den Crew-Einstellungen verfügbar.
Der Planer vergleicht an einem erlaubten Taktwechsel tatsächliche Hüft-, Knie-
und Fußkurven des laufenden Clips mit möglichen Ganzkörper-Clips am nächsten
Musikzeitpunkt. Vorhandene Standkontakte gewichten die Beinabweichung; die
horizontale Hüftrichtung liefert einen zusätzlichen Bewegungsvergleich.

Der gewählte Musikzeitpunkt wird nicht verschoben. Song-Motive, Dialogpartner,
Kanon und gemeinsame Höhepunkte bleiben geschützt; die Optimierung gilt freien
individuellen Entscheidungen und begleitenden Crew-Mitgliedern. Ruhige Genres
schließen kraftvolle Robot-/Frontmann-Moves weiterhin aus. Fehlende oder nicht
verwertbare Tracks behalten die vorherige Auswahl. Es gibt kein neues Retargeting
und keinen zweiten Live-IK-Solver. Vorlieben und Song-Gedächtnis bleiben bei der
Vorauswahl wirksam; die körperliche Passung verfeinert flexible Wechsel.

## Räumliche Regie

Die temporäre Gruppe mit Cue `concert-auto` erlaubt räumliche Bühnenregie. Der
Solist erhält einen vorderen Zielpunkt, der Partner eine leicht vorgestellte
Position, die Begleitung Tiefe. Gemeinsame Passagen bilden einen flachen Bogen.
Die Links-rechts-Reihenfolge bleibt erhalten; die Figuren laufen nicht durch
die Nachbarspur. Die vorhandene Gruppensteuerung bleibt alleiniger Positions-
Besitzer und setzt höchstens acht Zentimeter Weg pro Sekunde um.

Bewegung wird nur bei bestätigtem einzelnem Standbein mit ausreichender
Kontakt-Sicherheit und geringer Drift zugelassen. Der bestehende IK-Solver
stabilisiert dabei den Standfuß. Bei angeforderter Reisebewegung hebt derselbe
IK-Solver das wechselnde Schwungbein rhythmisch an (höchstens 16 cm). Erst die
tatsächlich gemessene Einzelstütze erlaubt die Root-Bewegung; Kontaktmeldungen
werden dafür nicht künstlich umgeschaltet. Doppelkontakt, fehlende Messungen, Fuß-Lock,
Kollisionsrisiko, Pause, schnelle Lyrics und reduzierte Bewegung halten die
Position. Manche Passagen bleiben deshalb länger in ihrer alten Formation.
Manuelle Song-Gruppen, Vocal-Zuweisungen, Timelines und Choreografien werden
nicht überfahren. Bestehende andere Gruppen behalten ihre Positionssteuerung.
Es wird keine physikalische Kollisionsfreiheit beliebiger Körperteile behauptet.

## Prüfung

- `tests/concert-stagecraft.cjs`: Wegtempo, Abstände, blockierte Kontakte,
  ungültige Werte, fehlende Pose-Daten und geschützte Kameras.
- `tests/concert-pose-motion.mjs`: tatsächliche Clip-Wahl auf allen elf GLBs
  bei wechselnden Beinposen.
- `tests/e2e/concert-mode.spec.cjs`: Bühne und feste Lyrics-Zone auf Desktop und
  Touch, versteckte Bedienfelder, Escape/Rückkehr sowie reale Crew-Zielpunkte,
  Abstände und Halt bei Pause. Spotify und Lyrics werden gemockt.

README und ARCHITECTURE verweisen auf diese Beschreibung. Die ZIP enthält keine
Playwright-Berichte, installierten Abhängigkeiten oder Build-Ausgaben.
