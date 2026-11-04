# V627 – Automated Concert Quality Inspector

## Ziel

Aus vorhandenen, **realen** Live-Messungen und menschlichen Sichtprüfungen einen nachvollziehbaren, priorisierten Qualitätsbericht für Sonic Display bilden – ohne eine neue, ungetestete automatische Bild-/Audioerkennung zu behaupten.

## Bedienung

1. Auf Windows nach `npm install` und `npm run build` Sonic Display mit der echten Spotify-/GLB-Bühne starten. Im vorhandenen Performance-Studio drei V522-Messungen für jedes der drei definierten Szenarien unter jeweils gleicher Rendering-Konfiguration aufzeichnen; optional unter V626 je drei 2-/3-/4-Avatar-Varianten vergleichen.
2. Die Szenen tatsächlich **ansehen und anhören**. In der vorhandenen V543-Prüfung die vier Kriterien je Szene bewusst und getrennt abhaken; fehlende Bestätigung bleibt „offen“, niemals „Fehler erkannt“.
3. Optional den bereits existierenden **V592-Live-Screenshot-Benchmark** am lokal angemeldeten Browser ausführen (`npm run benchmark:v592:live` mit den dort dokumentierten Parametern). Den durch V593 erzeugten Datei-**Hinweisbericht** `advice-v593.json` im V627-Bereich importieren; keine PNG/HTML-Datei hochladen. Nur gültige V593-Livehinweise werden angenommen.
4. V627 gruppiert FPS-/P99-/Stotterwarnungen, wiederholte Bildheuristiken (Cropping, Layout, Formationen etc.) und offene manuelle Prüfungen. Schwere Befunde zuerst bewerten; keine Einstellung wird automatisch verändert.
5. Den V627-Bericht als JSON exportieren. Messergebnisse und importierte Hinweise bleiben wie die bestehenden V522-Läufe **nur in der aktuellen Sitzung**, bis exportiert.

## Herkunft und Schutz

- FPS, Worst-Window-P95/P99 und Ruckler sind **Browser-/WebGL**-Messwerte aus V518/V522, keine GPU-Auslastung, kein Pi-Benchmark und keine objektive Bildqualitätswertung. Gemischte Qualität/DPR/Renderauflösungen werden nicht zu einem bestandenen Vergleich zusammengefasst.
- V593 basiert auf im Browser erfassten lokalen V592-Screenshots und benutzt heuristische Bildgrenzen. Im V627-Browser-Import wird die JSON-Struktur streng geprüft; die **Authentizität** der Datei, identische Songs und gleiche Prüfhardware können nicht kryptografisch nachgewiesen werden. Die importierten Bildbefunde sind ausdrücklich nur Hinweise.
- Manuelle V543-Häkchen sind Aussagen des Bedieners. Besonders Lippen-, Sänger- und Fußkontaktsynchronität lässt sich **nicht** aus FPS ableiten.
- Die V522-Langzeitszene erfasst 180 Sekunden und V592 höchstens 180 Sekunden. **Auch ein vorläufig erfolgreicher Report ist keine lückenlose Ganzsongprüfung** oder Produktionsfreigabe. Die getrennte V553-Prüfung bleibt unverändert.
- V627 darf weder Kamera/Choreografie/Lyrics/Spotifystatus noch LOD, Lichtbudgets oder manuell gesetzte Ziele ändern. Keine zusätzlichen Shader, Meshes, GPU-Queries, Dateiuploads oder Timer.

## Tests

`npm run test:v627` (25 Gruppen, 3000 synthetische Prüfszenarien); `npm run test:v627:types`; `npm run test:smoke:v627`; `npm run verify:v627`; `npx tsc --noEmit`; `npm run build`. Die 3000 Prüfszenarien sind synthetische **Test-Fixtures**, keine reale Konzertmessung.
