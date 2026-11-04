# Sonic Display V600 – Ultimate Concert Director 5.0

## Ziel

Ein Konzert soll vom ersten bis zum letzten Takt kohärent wirken. V600 baut deshalb auf bestehenden V502-/V568-/V577-Dynamik-Kanälen auf. Neue, separate Kamera-/Tanz-/Audio-Engines wären für ein Raspberry-Pi-Display zu teuer und würden vorhandene Autoren-Entscheidungen übergehen.

## Real integriert

1. **Konzertbogen:** Aus der bestehenden lokal importierten V318-Songstruktur erstellt `planUltimateConcertV600` pro Track höchstens 160 ausdrücklich beschriftete Abschnitte (Verse/Hook/Build/Drop/Break). Die Songabschnitte brauchen plausible positive Länge, identische Track-ID und Konfidenz ≥0,65. Sie werden nicht neu erkannt oder als solche ausgegeben, wenn keine Labels vorliegen.
2. **Dramaturgie pro Akt:** Opening → Develop → Peak → Release erzeugt zeitlich stabile, sanfte Steigerungs-/Beruhigungswerte, die auf das vorhandene automatische Kamera-, Tanz- und Lichtniveau aufmoduliert werden. Ein importiertes Label muss auch mit dem tatsächlich aktiven V318-Abschnitt übereinstimmen, sonst bleibt die Wirkung stark gedämpft.
3. **Abwechslung:** Wiederholte Abschnitte variieren deterministisch ihre Regie-Motive (`establish`, `lead`, `side`, `ensemble`); unmittelbar aufeinanderfolgende Akte nutzen unterschiedliche Motive. Diese Shot-Namen sind **Planungsinformationen**, keine neue Festlegung einer realen Kamerapose. Tatsächliche 3D-Kameraentscheidungen verbleiben bei den bestehenden V287/V306-/Rap-Kamera-Modulen. V600 ändert deren *Intensität*, nicht ihre Shot-Auswahl.
4. **Deutschrap, Hardstyle, Hardtekk:** Genreabhängige Motivfolge und unterschiedliche kleine Intensitätsmodulationen. Keine zufälligen Beat-Effekte, keine erfundenen Musikabschnitte.
5. **Automatische Formationen:** Ausschließlich trackgebundene, automatisch erzeugte V442-/V446-Gruppen aus drei oder vier Avataren dürfen an ihren **schon existierenden** Cue-Zeitpunkten die V326-Geometrie `line`, `arc`, `stagger`, `wide` wechseln. Keine zusätzlichen Cues, keine Verschiebung der Zeitmarken, keine Änderung der Sänger-/Kamerazuweisung. Explizite Drop-/Gruppen-Foki und manuell erzeugte Cues werden nicht überschrieben.
6. **Lyrikpriorität und Pi-Schutz:** Bei lesewichtigen Lyrics werden Zusätze gesenkt, im Low-Tier oder mit Reduced Motion ausgesetzt. Manuelle Choreografien, Kamerakeyframes und deaktivierte Lichtautomatik haben immer Vorrang. Wort-, Lippen-, Skelett-, Motion- und Foot-IK-Daten bleiben wie bisher.

## Begrenzt und absichtlich nicht behauptet

- V600 hat noch **keinen echten automatischen Kamerashot-Editor**: Shot-Motive stehen nur in der Planberechnung; sichtbar wirken vorhandene Regiekamera und sanfte Modulation ihrer Intensität.
- Kein automatisch erkannter Verse/Hook/Drop, keine verifizierte Sängeridentität, kein künstliches Lyrics-Wort-Timing.
- Bei unbekannter Songstruktur werden keine Formationswechsel ausgedacht.
- Es gibt keine neuen React-Komponenten, Renderloops, GLB-Clips, API-Requests, dauerhafte Nutzerprofile oder zusätzlichen WebGL-Shader.
- „Schöneres Konzert“ kann nur ein Vergleich echter Browser-Screenshots mit den V592–V595-Benchmarks und manueller Sichtprüfung belegen.

## Prüfen

```bash
npm run test:v600
npm run test:v600:types
npm run test:smoke:v600
npm run verify:v600
```

Zum visuellen Vergleich dieselbe Passage vor und nach der Änderung mit dem bestehenden `benchmark:v592:live` aufnehmen und `benchmark:v594:compare` bzw. `benchmark:v595:regress` verwenden. Für die volle Wirkungsprüfung eigene, mit Hook/Verse/Break/Drop beschriftete lokale V318-Analyse importieren. Ohne validierte Labels bleiben nur sehr schwache Intensitätsänderungen. Die tatsächliche Spotify-Livewiedergabe, ein vollständiger Next.js-Build und ein Raspberry-Pi-Benchmark wurden hier nicht durchgeführt.
