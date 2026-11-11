# Ensemble, Lyrics-Lichtbilder und Song-Outfits

Die automatische Konzertshow verbindet die Crew enger mit der Lyrics-Zone und dem Raumlicht. Die neuen Einstellungen liegen unter **Show steuern → Bühne & Effekte**. Auf der eigentlichen Bühne bleiben die zwei bisherigen Bedienelemente.

## Crew als Ensemble

Partner beobachten den Auftakt einer Viererschlag-Phrase zunächst für 0,65 Beats und setzen ihre zusätzliche Antwortgeste danach. Kopfblicke wenden sich am Phrasenende wieder zum Publikum. Der gemeinsame Phrasentakt verhindert zufällige Versätze in diesen Gesten. Die Persönlichkeit bestimmt weiterhin Gestenstärke und Körpersprache. Bei Leseschutz oder hervorgehobenen Textstellen ruhen die zusätzlichen Blick- und Antwortgesten.

Die vorhandene Bühnenbewegung staffelt Solist, Partner und Begleitung deutlicher in der Tiefe. Unterstützende Tänzer bekommen etwas mehr seitlichen Raum. Wege bleiben in ihren vorhandenen Bahnen; nur beobachtete sichere Schritte dürfen die Position ändern. Abstandsprüfung, Tempo-Limit, Fußkontakte und manuelle Choreografien behalten ihre bisherige Autorität. Die kurzen Reaktionspausen betreffen zusätzliche Oberkörpergesten; die Füße der Tanzclips werden nicht angehalten oder versetzt.

Der Armschmuck der Tanzphrasen bleibt nun auch bei Persönlichkeitsgesten erhalten: Der bisherige abschließende Z-Wert überschreibt die vorherige Armvariation nicht mehr.

## Lyrics-Lichtbilder

Vier dekorative Motive variieren nach Song, Text und Refrain-Besuch: Halo, Lichtband, seitliche Klammern und Sternpunkte. Sie bleiben innerhalb des festen Lesebereichs. Schlüsselwörter mit echten Wortzeitstempeln können eine Unterstreichung bekommen; es werden keine Wortzeitmarken ergänzt und keine Textkopien erzeugt. Schnelle Rap-Passagen verwenden den ruhigen Lesemodus. Pause und reduzierte Bewegung entfernen die neue Dekoration, fehlende Lyrics ergeben keinen Effekt. Die neuen Motive lassen sich separat ausschalten. Wort-Spans bewahren im gesamten Konzertmodus ihre vorhandenen Leerzeichen; ein gemessener Browserabstand prüft, dass Wörter optisch nicht zusammenlaufen.

## Songabhängige Outfit-Looks

Fünf Stilfamilien verändern die **vorhandenen Kleidermaterialien**: Rock/Lederlook, Gala/Satinlook, Street/Sportlook, Festival-Farben und Club/Neonlook. Farbe, Rauheit, Metallanteil und vorhandene Mustermöglichkeiten schaffen unterschiedliche Looks; die Crew erhält drei aufeinander abgestimmte Farbvarianten. Die Auswahl bleibt pro Song, Genre und Crew-Platz stabil. Es werden keine neuen Jacken- oder Kleid-Geometrien und keine neuen Motion-Capture-Dateien mitgeliefert.

Nur als Kleidung erkannte Materialien werden auf der eigenen Avatar-Instanz geklont und verändert. Haut, Gesicht, Haare und der GLTF-Cache bleiben unberührt. Der Look ist an den Konzertmodus, das aktivierte Bühnenbild und den Garderobenmodus „Album“ gebunden. „Eigene Farbe“, „Aus“ und manuell ausgewählte Muster behalten Vorrang. Ausschalten führt sanft zu den bisherigen Materialwerten zurück. Texturen entstehen nur beim Musterwechsel und werden bei Wechsel oder Abbau freigegeben.

## Govee gemeinsam dirigieren

„Govee folgt Ensemble und Lyrics“ ergänzt ausschließlich den vorhandenen LAN-Musik-Sync. Voraussetzung sind eine konfigurierte Bridge, ausgewählte Lampen, aktiver Musik-Sync und der vorhandene Konzertdirektor. Die Einstellung verändert weder die Geräteauswahl noch diese Voraussetzungen und schaltet Lampen nicht ein oder aus.

Die tatsächlich eingeblendete Konzertbühne veröffentlicht intern ihre aktuelle Interaktion und Farbe. Der bestehende Sender übernimmt diese Information nur bei identischem Song, laufender Wiedergabe, einem höchstens 2,5 Sekunden alten Signal und höchstens 2 Sekunden Zeitabweichung. Soli dimmen Begleitlicht, gemeinsame Höhepunkte lösen diese zusätzliche Dimmung weitgehend, und Lyrics-Fokus dämpft das Raumlicht stärker. Die Farbe nähert sich sanft der Bühnenfarbe an; die Lampenrollen bleiben erhalten. Das sind geplante Show-Szenen, keine zusätzliche akustische Beat-Erkennung.

Es gibt keinen zweiten LAN-Sender und keine zusätzlichen Gerätebefehle pro Durchlauf. Der vorhandene Abstand von mindestens 900 beziehungsweise 1700 ms bleibt bestehen. Eigene Shows, manuelle Bühnenregie, priorisierte Lichtpläne, Sprachbefehle, Geräte-Recovery sowie reduzierte Bewegung verhindern den neuen Eingriff. Gruppen-/Helligkeitsgrenzen, abschließender Governor und die erneute Musik-Sync-Prüfung vor jedem Versand bleiben aktiv. Pausieren, Verlassen und ein Songwechsel verhindern die Verwendung alter Bühnensignale.

## Architektur und Prüfung

- `lib/concertEnsemble.ts`: Phrasengesten und kurzlebiges, rein lokales Bühnenlicht-Signal; pure Transformation der vorhandenen Lampen-Looks.
- `lib/songWardrobe.ts`: deterministische Stilfamilien ohne Netzwerkzugriff.
- `lib/ensembleLyrics.ts`: Auswahl der Lyrics-Dekoration mit Lese-, Pause- und Bewegungsschutz.
- Bestehende Besitzer bleiben zuständig: `sonicCrewReaction` für Oberkörper, `crewStagecraft` für sichere Bühnenwege, `avatarWardrobeV468` für Kleidermaterialien und `GoveeMusicSyncV909` für LAN-Versand.

`npm run test:concert:ensemble` prüft Planer, Schutzfälle, opt-outs und alle elf realen GLB-Dateien einschließlich Materialisolation, Wiederherstellung und unveränderter Hüft-/Fußpositionen. `tests/e2e/concert-ensemble.spec.cjs` prüft die Konzertoberfläche, persistente Schalter, Lyrics-Lesbarkeit, sichtbare Garderobenwahl und den echten Browser-Sendepfad gegen eine gemockte Govee-Bridge. Spotify und Lyrics bleiben vollständig gemockt. Die Tests gehören zu den aktiven `test:v1136`- und Browser-Skripten. Ein physischer Lampentest benötigt die Geräte des Nutzers.
