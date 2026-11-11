# Zusammenhängende Bühnenräume und neue Effekte

Die Konzertregie ergänzt die bestehende LED-Wand um einen großen Bühnenhintergrund
und einen gemeinsamen Lichtboden. Beide folgen derselben Szene, Farbpalette,
Songposition und Effektstärke. Die feste Lyrics-Zone und die zwei sichtbaren
Schaltflächen des Konzertmodus bleiben erhalten.

## Vier Motive, eine Gesamtshow

- **Aurora**: zwei langsam fließende Lichtbänder für einen offenen, atmosphärischen Raum.
- **Prisma**: weiche Lichtfächer, die sich beim Spannungsaufbau öffnen.
- **Sternenraum**: ein ruhiger Sternenhintergrund mit langsamen Helligkeitsverläufen.
- **Halo**: ein leuchtender Bogen als wiedererkennbarer Rahmen der Crew.

Die vier vorhandenen Showkonzepte beginnen mit unterschiedlichen Motiven.
Der Auftakt bleibt klein und gedimmt. Vor dem Refrain baut sich ein Lichtfächer
auf. Wiederkehrende Refrains öffnen nacheinander kontrastierende Räume.
Instrumentalpassagen erlauben ein breiteres Bild. Das Finale greift das Motiv
des Auftakts auf und mischt ein zweites Motiv hinzu, statt unvermittelt ein
fremdes Bühnenbild zu zeigen.

Auf dem Boden werden passend zum Raummotiv Lichtbahnen, Rauten, ein Punktraster
oder ein Ring gezeichnet. Der Boden läuft im selben Zeitbezug wie der Hintergrund.
Bestehende gezielte Refrain-/Finale-Akzente und die beobachteten Tanzspuren bleiben
die bewegungsgebundenen Höhepunkte. Die neue Ebene erzeugt keine zusätzlichen
Explosionen, Strobes oder vermeintlich gehörten Drops.

## Bedienung und Lesbarkeit

**Show steuern → Raum- und Bodeneffekte** schaltet die neue Ebene gemeinsam an
oder aus. Die Auswahl bleibt im Browser gespeichert und wird auch von der
bestehenden Avatar-Einstellungsansicht verwendet. Die übergeordnete Option
**Konzert-Bühnenbilder und Effekte** und der vorhandene Stärkeregler behalten
Vorrang. Die neue Option erzeugt keine zusätzliche schwebende Bedienfläche.

Der Hintergrund liegt hinter der LED-Wand und allen Darstellern. Seine Mitte
bleibt schwächer als die Ränder, damit Gesichter und Körper erkennbar bleiben.
Die Bodenfläche ist transparent, tiefengeprüft und auf den Bühnenradius begrenzt.
Beide Flächen liegen innerhalb des vorhandenen Bühnen-Canvas; der separate
Lyrics-Bereich wird nicht überzeichnet.

Bei dichtem Rap und wichtigem Wortfokus bleibt nur ein dunkler, statischer
Hintergrund. Das bewegte Lichtfeld und der Boden gehen sofort zurück. In Pause
bleibt die zeitliche Raumkomposition stehen und wird gedimmt; der Lichtboden
wird ausgeblendet. Reduzierte Bewegung verwendet einen statischen, stark gedimmten Hintergrund.
Auf der niedrigen Effektstufe bleibt das statische Motiv mit klarerem Kontrast
erkennbar; die Bodenanimation bleibt dort ebenfalls aus. Manuelle
Licht-Timelines, Blackouts und die vorhandenen Besitzregeln sperren die ganze
neue Ebene gemeinsam mit der Konzertbühne.

## Umsetzung und Budget

`lib/concertAtmosphere.ts` plant Szene, Motivgewichte, Öffnung, Intensität und
Bodenfreigabe deterministisch aus dem gemeinsamen Konzert-Score.
`components/visualizer/ConcertAtmosphere.tsx` stellt höchstens zwei zusätzliche
Shader-Flächen dar. Die Motive werden in denselben beiden Draws gemischt; es
gibt keine vier unabhängigen Effekt-Systeme, zusätzlichen Spotlights, Schatten,
Videos oder Medienabrufe. Auf niedriger Stufe bleibt nur der Hintergrund.

Die Aktualisierung kommt direkt aus dem bestehenden `ConcertScenery`-Frame-Takt.
Songzeit, Pause und reduzierte Bewegung besitzen damit denselben Zeitbezug wie
die übrige Bühne. Wiederverwendete Farb-/Gewichtsobjekte verhindern unnötige
Frame-Allokationen. Three/Fiber verwaltet die deklarativen Geometrien und
Materialien beim Abbau. Die vorhandene gemessene FX-Druckregelung begrenzt auch
diese Ebene; sie verspricht keine feste Bildrate.

Das bestehende Ereignis `sonic:concert-scenery` ergänzt unter `atmosphere` die
Szene, das Motiv und den Bewegungsstatus sowie tatsächlich gesetzte Shader-
Gewichte, Zeit, Intensität und Flächensichtbarkeit. Es werden keine Audio- oder
Lyrics-Daten hinzugefügt.

## Prüfungen und ZIP

`npm run test:concert:atmosphere` prüft Dramaturgie und Motiv-Rückkehr,
Refrain-Abwechslung, begrenzte Gewichte/Intensitäten, Pause, Textschutz,
reduzierte Bewegung, Leistungsstufen und gespeicherte Abschaltung.
`tests/e2e/concert-atmosphere.spec.cjs` prüft die tatsächlich kompilierten Shader,
Motivmischung, getrennte Lyrics-Zone, Pause/Finale, die Option nach Neuladen sowie
Rap-, OS-Bewegungs- und manuelle Lichtregeln auf Desktop und Touch. Spotify und
Lyrics sind gemockt. Die Prüfungen gehören zum aktiven Node-/Browserpfad.

Die vollständige Projekt-ZIP enthält diese Dokumentation und die Tests, aber
keine Playwright-Berichte, Screenshots, Videos, Traces oder Abhängigkeiten.
