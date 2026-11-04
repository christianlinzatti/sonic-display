# Sonic Display V542 – Intelligent Concert Lighting & Stage FX

## Änderungen

- Neuer reiner `refineConcertLightingV542`-Planer. Die V462-Licht-/Nebelbudgets werden in den vorhandenen `DynamicStage`- und `ConcertAtmosphereRenderer`-Callback ergänzt, ohne eine weitere Renderer-Schleife.
- Deutschrap-Vocals bekommen ruhigere Scheinwerfer-Schwenks, etwas mehr Fill-/Key-Licht und weniger Bühnennebel.
- Gemeinsame Hooks ab zwei Avataren erhalten kleine kollektive Licht-Akzente; Cast-Größe stammt aus der tatsächlichen V539-Bühnenkonfiguration.
- Hardstyle-/Hardtekk-Drops verstärken Beam und Spot nur bei Kick- und Energie-Evidenz, ohne Strobo-Effekte.
- Bestehende V541-Lyrics-Aktivität begrenzt Nebel, Lichtstrahlen und Sweeps, damit Worte und Gesichter lesbar bleiben.
- Benutzerdefinierte Licht-Timelines, bewusst gesetzte Blackouts, Pausen, deaktivierte Reaktivität, Reduced Motion und Low-Tier erhalten ihren bisherigen Vorrang. Alle Faktoren sind gedeckelt und im Frame geglättet.
- Keine Laser. Bereits vorhandene optionale V394-Laser-Fan-Geometrie wird nicht mehr aktiviert; die neue V542-Planung erlaubt grundsätzlich keine Laser.

## Grenzen

Abschnitte wie `hook` oder `drop` stammen weiterhin aus der bestehenden Musikerkennung und müssen nicht den tatsächlichen Song-Credits entsprechen. Keine neuen Sprecher-/Song-Metadaten, keine Audio-Phonem-Analyse, keine Änderungen an GLBs. Es wurde kein vollständiger Next.js-Build und kein Browser-/Raspberry-Pi-Sichttest durchgeführt.

## Tests

`npm run test:v542 && npm run test:v542:types`; danach `npm run check:syntax && npm run check:architecture` und ausgewählte Regressionen. Lokal mit installierten Dependencies: `npm install && npm run build`.
