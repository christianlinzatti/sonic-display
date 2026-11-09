# V1135 – Natürlichere Bühnenpräsenz

## Ausprobieren

`npm ci`, Konfiguration nach `.env.example`, dann `npm run dev`. Unter **Settings → Avatar → Sonic Stage Crew → Intelligente Show aktivieren** einschalten. Das Trio lässt sich auf der Live-Bühne oder in der Show-Simulation vergleichen. Für Lyrics Cinematic, Kinetic oder Neon verwenden.

## Sichtbare Verbesserungen

### Figuren stehen auf der Bühne

Die eingebauten Sonic-GLBs besitzen ihre Sohlen bei Modell-Y −1,0; der sichtbare Bühnenboden liegt bei −1,95. Die automatisch geführte Crew erhält nun eine zur gewählten Avatargröße passende Platzierung. Dadurch steht sie auf dem Boden statt darüber zu schweben.

Diese Korrektur gilt ausschließlich für die elf eingebauten Figuren in der aktivierten adaptiven Show mit automatischer Bewegungssteuerung. Eigene/importierte Avatare, manuelle Bewegungsquellen und explizite vertikale Avatar-Offsets werden nicht umplatziert. Gruppenpositionen bleiben relative Bühnenpositionen; bewusst erhöhte Gruppenpositionen können Figuren weiterhin anheben.

Wenn ein gebackener Crew-Clip läuft, ergänzt der Renderer keinen weiteren vertikalen Root-Bounce und keine zusätzliche Root-Drehung. Die bereits enthaltene Gewichtsverlagerung und Beinarbeit bleibt maßgeblich. Die bestehenden manuellen und externen Bewegungsmodi behalten ihre bisherige Steuerung.

### Weiche Kontaktschatten

Zwei kleine, analytisch gezeichnete Kontaktflächen folgen den Fußpositionen. Ein angehobener Fuß bekommt einen breiteren, schwächeren Schatten; bei größerem Abstand verschwindet er. Auf der Live-Bühne bleiben die Flächen am Bühnenboden, auch wenn eine Gruppenposition angehoben wird. Die Probe hat jetzt ebenfalls einen matten Boden mit Kontaktschatten.

Das sind Näherungen für Bodenkontakt, keine vollständigen lichtabhängigen Schlagschatten. Pro Figur kommen zwei einfache Flächen hinzu; es werden keine Shadow-Maps, Textur-Downloads oder zusätzlichen Renderpasses eingeführt. Bei vier Figuren sind es höchstens acht zusätzliche Kontaktflächen.

### Vorbereiten und Nachlaufen

Kopf, Brust und Arme erhalten kleine vorbereitende Bewegungen und eine gedämpfte Rückbewegung. Die Brust hebt sich leicht; Rollen und Persönlichkeiten unterscheiden die Reaktionsstärke. Fließende Figuren laufen weicher nach, mechanische Charaktere reagieren präziser. Begleitfiguren und schnelle Textpassagen bleiben zurückhaltender.

Eine kritisch gedämpfte Federfunktion steuert die Reaktion. Sie arbeitet mit der bestehenden integrierten Tanzuhr und ist bei 30/60/120 FPS konsistent. Der Akzent ist aus einem Acht-Beat-Raster inszeniert und behauptet keine neu erkannte Bassdrum oder Audio-Vorhersage. Ohne gemessenes Tempo bleibt der vorhandene 120-BPM-Fallback aktiv.

Es werden nur die bereits vorhandenen Oberkörper-Bones ergänzt. Becken, Knie und Fußketten erhalten keine neuen Overlays. Pause, reduzierte Bewegung oder eine andere Steuerung geben die eigenen Werte wieder frei.

### Licht und Kamera

Bei Soli und Duellen wird das Verhältnis zwischen vorhandenem Haupt- und Fülllicht kontrastreicher. Antizipation nimmt das Fülllicht zurück; Refrains und Finale erhalten etwas mehr modellierendes Hauptlicht. Lichtwerte bleiben begrenzt und geglättet. Manuelles Licht, bestehender Vocal-Fokus, Blackout und reduzierte Bewegung haben Vorrang.

Die automatische Kamera öffnet den Bildausschnitt von wiederkehrenden Refrains bis zum Finale schrittweise. Vor einem Refrain sammelt sie die Crew etwas zentraler. Wortweise synchronisierte Refrains behalten sichtbare Wortabstände auch bei vergrößerter Schrift. Die bestehenden Überblendungen bleiben aktiv; es gibt keinen zusätzlichen Kamera-Schreiber. Bei schnellen Lyrics wird weiterhin die Kamerapose gehalten. Manuelle, gespeicherte und Timeline-Kameras bleiben vorrangig.

## Architektur

- `lib/stagePresenceV1135.ts`: Platzierung, Fußabstand/Schattenstärke und geschützte Lichtkontraste.
- `lib/performerDynamicsV1135.ts`: begrenzte vorbereitende Bewegungen und analytische kritische Dämpfung.
- `components/visualizer/sonicCrewReaction.ts`: Einbindung in die vorhandene Overlay-Schicht mit sauberer Rückgabe der eigenen Rotationen und Skalierungen.
- `components/visualizer/GltfDancerAvatarV492.tsx`: konstante Bühnenplatzierung und Vorrang gebackener Root-Bewegungen.
- `components/visualizer/SonicFootContactV1135.tsx`: zwei wiederverwendete Kontaktflächen pro Figur; Fußpositionen werden aus den tatsächlich wiedergegebenen Bones gelesen.
- `components/visualizer/SonicCrewRehearsal.tsx`: gleiche Ausdrucksbewegungen, Probenboden und gemessener Sohlenabstand für die Browserprüfung.
- `lib/concertScoreV1134.ts` und `DynamicStage.tsx`: zunehmender Kameraausschnitt und geschützte Kontraste in den bereits vorhandenen Regiepfaden.

## Prüfen

```sh
npm run test:v1135
SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:v1135:browser
```

Der direkte Build führt den Next-Produktionsbuild mit Typprüfung aus und umgeht die umfangreiche historische `prebuild`-Kette. Alternativ einen passenden von Playwright installierten Browser verwenden.

Die neuen Prüfungen decken Dämpfung bei unterschiedlichen Bildraten, wechselnde Zielwerte, manuelle Priorität, Lichtschutz sowie tatsächliche geskinte Fußsohlen aller elf GLBs ab. Drei Größen (0,6/1/1,8), drei reale Clips und 120 Abtastungen pro Clip prüfen Bodenkontakt und unveränderte Fußpositionen trotz Oberkörperreaktionen. Die Browserprüfung verwendet weiterhin ausschließlich gemockte Spotify-/Lyrics-Daten. Sie prüft die echte Drei-Figuren-Probe, Bodenkontakt, Pause und die Live-Refrain-Darstellung; die bisherigen Show-, Rap-, Tempo- und Fehlerfälle bleiben Teil der Suite.

## Grenzen und Paket

Die elf stilisierten Figuren und ihre 306 prozeduralen Animationen bleiben erhalten. Diese Version ergänzt keine Mixamo- oder Motion-Capture-Dateien, keine photorealistischen Figuren, keine Physiksimulation und keinen externen generativen KI-Dienst. Der Gewinn liegt in Platzierung, Reaktionsverhalten, Beleuchtung und Inszenierung.

README und ARCHITECTURE bleiben im Projektstamm, ausführliche Dokumentation unter `docs/versions/`. Die Projekt-ZIP enthält Quellcode, Testquellen und Assets, aber keine generierten Playwright-Berichte, Traces, Testergebnisordner, Abhängigkeiten, Build-Caches oder eingebetteten älteren Release-ZIPs.
