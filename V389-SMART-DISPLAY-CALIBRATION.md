# V389 – Smart Display Calibration Studio

## Ablauf
1. Touchmodus aktivieren, eine echte 3D-Szene aufrufen, eine möglichst repräsentative Songpassage starten.
2. `Mehr · Display → V389 · Kalibrieren` öffnen. Auf der Bühne zunächst 1, 2 oder 4 reale Avatare konfigurieren; nur die **tatsächlich aktiven** Avatare werden gezählt.
3. Ziel-Besetzung auswählen und nacheinander `Standard`, `Adaptiv`, `Energiesparen` und `Schärfer` testen. Die Einstellung ändert sich für die Messung vorübergehend und wird danach automatisch zurückgesetzt.
4. Jede Messung benötigt 2 Aufwärmwerte und 10 aktuelle **echte** WebGL-Messpunkte des laufenden AdaptivePerformanceController (ungefähr 13 Sekunden bei sichtbarem Tab), nicht synthetische Belastung und keine geschätzten Messwerte.
5. Die Ergebnisse (FPS, Minimum, P95-Framezeit, Anteil langsamer Frames) werden nach Bildschirmgröße, Pixel Ratio, Titel und Avatar-Anzahl gruppiert. Bei fehlendem Renderer, falscher tatsächlicher Besetzung oder wechselndem Display/Song keine falschen Daten speichern.
6. Die lokale Empfehlung nach mindestens zwei verglichenen Profilen bewusst übernehmen. Ergebnisse unter `sonic-display:v389:device-calibrations` lokal in browser-localStorage speichern / als JSON exportieren / löschen.

## Grenzen und Prioritäten
- Direkte FPS- und Framezeitmessung stammt aus dem tatsächlichen Bühnen-Renderer; GPU-Auslastung oder Displaydiagonale sind nicht messbar. WebGL-Telemetrie ist ungeeignet, um verschiedene Szenen, Songs oder Animationen ohne kontrollierte Bedingungen zu vergleichen. Das Studio prüft Fenstergröße und Songkennung; gleiche Kamera, Effekte und Choreografie müssen vom Nutzer eingehalten werden.
- 1, 2 und 4 Tänzer werden **nicht** automatisch installiert oder erfunden; unpassende `activeAvatars` führen zur Ablehnung. Andere Fenstergrößen und Songkennungen werden nicht miteinander verglichen.
- V388-Profile sind nur im Touchmodus wirksam. Es wird kein weiterer Canvas erzeugt und nicht an Spotify, Lyrics oder Dance Timing geschrieben.
- Beim Abbruch, Schließen, Fehler oder Unmount wird das vorherige Profil wiederhergestellt. Nur die explizite Schaltfläche „Empfehlung bewusst übernehmen“ persistiert die gewählte Empfehlung.
- Behält die V388-Optimierung, die V387-Konzertregie und sämtliche vorigen Dateien bei.

## Prüfungen
`npm run test:v389`, `npm run check:syntax`, `npm run verify:offline`. Vollständiges `npm run verify` und `npm run build` nach `npm install` auf dem lokalen Rechner.
