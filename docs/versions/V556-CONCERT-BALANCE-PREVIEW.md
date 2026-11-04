# V556 – Gobo, LED-Wand und Lyrics-Projektion gemeinsam testen

**Basis:** V555, einschließlich V554-Lyrics-Provider-Qualitätsauswahl. Die V555-Optionen und die normale Lyrics-Zeile bleiben erhalten.

## Bedienung

1. Einstellungen öffnen → **Konzert-Bühneneffekte · V555** → **3D-Effektvergleich öffnen · V556**.
2. In der echten 3D-Bühnenvorschau zwischen **Strophe**, **Hook** und **Dichter Deutschrap** wechseln. Die Sampletexte sind ausdrücklich **Demo** und nicht aus Spotify oder Genius geladen.
3. Den Regler **Effektstärke** und die einzelnen Schalter im Settings-Panel anpassen; die Vorschau erhält die aktuellen Werte bei jedem Öffnen.
4. Bühne drehen/zoomen und Licht auf den zwei neutralen Darsteller-Silhouetten beurteilen. Der kontraststarke Beispiel-Lyrics-Streifen dient nur zum visuellen Lesbarkeitscheck; es wird **nicht** die echte Karaoke-Anzeige bewegt.

Die große 3D-Vorschau aus der normalen Bühnenauswahl unterstützt dieselben Vergleichsmodi.

## Gemeinsames Lichtbudget

- Ein einziger reiner `balanceConcertDetailsV556`-Planer liefert relative Effektpegel für den V555-Live-Renderer und die Vorschau. Das additive Gesamtbudget für Gobo + LED + Wortprojektion ist in Normal-/High-Tier auf 0,35 (normierte Steuerwerte) und im Low-Tier auf 0,12 begrenzt. Diese Normwerte sind **keine gemessenen Lux- oder Displayhelligkeiten**.
- **Hook**: Schriftprojektion nur bei vorhandener, aktueller V555-Hook-Autorisierung mit genügend ruhiger Zeile; die Wand wird um 32 % und Gobo um 25 % gegenüber ihrem jeweiligen Ausgangsfaktor abgesenkt.
- **Dichte Lyrics**: Die LED-Wand wird durch eine konservative Dichteheuristik gedimmt; zusätzliche Hook-Wortprojektionen bleiben aus. Die Anzeige der Hauptzeile ändert sich nicht.
- **Raspberry Pi / Low-Tier**: Gobo, zusätzliche Nebelfläche und Hook-Schrift aus, LED gedrosselt. Bei reduzierter Bewegung werden die Zeiten der Shader eingefroren, Projektionsschrift unterdrückt und die Restpegel reduziert.
- Der reale Bühnenstil, Duett-Lichtbogen, Adlib-Echos und Reim-Akzente bleiben ansonsten wie in V555. Sängerrollen werden weiterhin nicht geraten.

## Prüfungen und Grenzen

`npm run verify:v556` führt V556–V554, Quellsyntax und Architekturdokumentation aus. Ein vollständiger `npm run build` wird wegen hier nicht verfügbarer `node_modules` nicht als durchgeführt behauptet. Der Vorschau-Renderer wird syntaktisch geprüft und nutzt echte R3F-Module; ein automatisierter WebGL-Screenshot, eine optische Beurteilung auf 10 Zoll oder ein Raspberry-Pi-FPS-Test wurde nicht durchgeführt. In der Vorschau sind die beiden Figuren absichtlich einfache Silhouetten, keine echte GLB-Avatar-Animation.
