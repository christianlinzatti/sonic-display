# Sonic Display V304 – Advanced Camera Orbit & Pan

## Neuerungen

Im **Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director → Camera Director Studio** zuerst **3D-Vorschau öffnen** und dann **Aktuelle Kamera live bearbeiten** wählen.

- **360°-Orbit:** Ein Finger bzw. Linksklick-Ziehen rotiert die Kamera vollständig um den frei gesetzten Blickpunkt. Die V303-Begrenzung auf ±75° entfällt. Die vertikale Neigung ist zur Vermeidung eines Polsprungs auf etwa ±84,6° begrenzt.
- **Freies Pan:** Rechtsklick-Ziehen, Shift-/Alt-Ziehen oder zwei Finger gemeinsam verschieben Kamera **und** Blickpunkt auf den lokalen Kamera-Rechts-/Hoch-Achsen. Zwei Finger können dabei zusätzlich durch Pinch zoomen.
- **Mausrad / Tastatur:** Mausrad zoomt; Pfeiltasten drehen, Shift+Pfeiltasten verschieben, Plus/Minus zoomen.
- **Neue Blickpunkt-Regler:** `targetX`, `targetY`, `targetZ`, die Kamera-X/Y/Z-Koordinaten und das FOV sind im Live-Editor einstellbar. Die bisherige V302-Preset- und Keyframe-Speicherung wird wiederverwendet.
- **Erweiterte Kamera-Presets:** Negative Z-Koordinaten erlauben Ansichten von hinter dem Avatar; Blickpunkte lassen sich in der Bühnenebene verschieben. Die gleiche Pose wird sowohl in der isolierten V291-Avatar-Vorschau als auch im Live-Renderer verwendet.
- **Räumliche Keyframe-Fahrten:** Kameradrehungen zwischen gegenüberliegenden Positionen verwenden kugelförmige statt geradeaus durch den Bühnenmittelpunkt verlaufende Interpolation.
- **Ressourcen:** Bestehender Live-Canvas-Stream; kein zusätzlicher WebGL-Renderer für die neue Gestensteuerung. Events greifen nur bei aktivem Live-Bearbeitungsmodus ein.

## Speicherdaten und Kompatibilität

`CameraPose` enthält ab V304 zusätzlich **optionale** Koordinaten `targetX` und `targetZ`, zusammen mit dem bisherigen `targetY`. Die bisherigen localStorage-Schlüssel `sonic-camera-presets-v290` und `sonic-camera-keyframes-v295` bleiben unverändert. Fehlende Werte werden bei der Normalisierung mit **0** belegt; bestehende Presets und Keyframes müssen nicht neu angelegt werden. Alle Werte werden begrenzt und auf gültige Zahlen geprüft. Die Kamera kann maximal 20 Einheiten in X und Z, 12 in Y und der Blickpunkt bis 12 Einheiten horizontal bewegt werden; Zoom-Radius 1,3–15 Einheiten.

**Hinweis:** Die automatische Kameraregie, Song-Keyframes und das Avatar-Tracking bleiben verfügbar. Während des expliziten Live-Editierens wird die automatische Regie vorübergehend ausgesetzt. Ein **gespeicherter** Rückseiten-Keyframe kann in laufenden Songs durch die bisherigen Live-Keyframe-Schalter übernommen werden. Nicht jede extreme Kombination aus Blickpunkt, Modellgröße und Sichtfeld garantiert eine vollständige Avatar-Sicht.

## Tests

- `npm run test:v304`: Prüfung von 360°-Rotation, rückseitiger Perspektive, Pan auf allen Zielachsen, gleichbleibender relativer Orientierung, Zoom, Legacy-Defaults und Interpolation gegenüberliegender Keyframes.
- `npm run verify:offline`: bestehende Regressionstests V288–V303 sowie V304 und Quelltext-Syntaxprüfung erfolgreich.
- `npm run build:preflight`: mangels installierter Pakete blockiert. Produktionsbuild lokal mit `npm install && npm run build` prüfen; Browser-Gesten auf Maus und Touch lokal testen.
