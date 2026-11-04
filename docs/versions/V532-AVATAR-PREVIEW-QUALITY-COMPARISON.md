# V532 – Avatar Preview Quality Comparison

## Warum
Die GLB-Optimierung aus V531 spart bei den fünf Beispielmodellen ca. 52 % Upload-Speicher, soll aber auf keinen Fall zu sichtbar schlechteren Tänzen führen. Ein Hash- bzw. glTF-Strukturtest kann kein WebGL-Rendering, keine Beinberührung und kein visuelles Urteil ersetzen.

## Arbeitsablauf
1. Character & Motion Library öffnen. Fünf GLB-Avatare auswählen. **Speicheroptimierung** nur bei gewünschtem Test aktivieren; sonst bleiben komplette GLBs erhalten.
2. Nach der Installation einen Avatar wählen. Im A/B-Bereich nacheinander **Idle_Groove**, **Dance_RapTwoStep** und **Dance_ClubGroove** aufrufen.
3. **Original-GLB** auswählen und mit **Tanz testen** starten; auf saubere Füße, Knie, Hände, Mundform und Bewegungen achten.
4. **Installierte GLB** auswählen und denselben Clip ab Zeit 0 mit **Tanz testen** starten. Beim Umschalten wird die Vorschau neu initialisiert, daher Play erneut anklicken.
5. Nur wenn die Bewegung wirklich gleich gut aussieht, „**Beide Ansichten geprüft – Bewegung sieht für mich gut aus**“ aktivieren. Das A/B-Ergebnis wird nur in dieser Importansicht gespeichert. Weitere Avatare getrennt prüfen.

## Was getestet ist
- Fünf originale GLB-2.0-Dateien; 20 Clips je Avatar. Drei konkrete Bewegungen je Avatar, je 165 glTF-Animationskanäle.
- 15 Paarvergleiche und insgesamt 2.475 Zuordnungen zu gleichnamigen Gelenken. Zusätzlich werden pro Kanal die Keyframe-Sampler und binären Input-/Output-Accessors kryptografisch verglichen.
- Die kompakte GLB besitzt weiterhin sämtliche Ziel-Bones. Der Motion Director, manuelle Animationen, Kamera und Lyrics bleiben unberührt.
- `npm run test:v532`, `npm run test:v532:types`, die V531-/V530-Regressionen sowie die Syntax-/Architekturprüfungen.

## Grenzen
- **Kein echter WebGL-Screenshot-Vergleich** und kein physischer Raspberry-Pi-Test möglich. Das UI-Playback-Event bedeutet nur, dass „Tanz testen“ gedrückt wurde; es beweist keine sichtbare Bewegung und meldet kein automatisches „PASS“.
- Die neue Bestätigung ist **kein Upload-Blocker** und löst keinen automatischen Rollback aus. Ist die Darstellung nicht gut, bleibt die sichere Lösung die vollständige Original-GLB ohne Speicheroptimierung.
- Die hochgeladenen Original-GLBs werden weder in das Projektpaket kopiert noch veröffentlicht. Die Speicherung auf Vercel Blob bzw. lokal bleibt wie in V531.

## Befehle
```
npm run test:v532
npm run test:v532:types
npm run test:v531
npm run check:syntax
npm run check:architecture
```
