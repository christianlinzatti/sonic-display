# Sonic Display V549 – Cinematic Lyrics Experience 8.0

## Funktionsumfang
- Die vorhandenen V541-Wort-Zeitmarken bleiben die einzige Karaoke-Uhr. V549 verändert **niemals den Füllfortschritt** oder ordnet unbestätigte Sprecher zu.
- Schnellere Passagen verringern zusätzliche Glow- und Tanzbewegungen der Wörter. Kein zusätzliches Textmesh, Timer oder Renderer.
- Verifizierte V528-Sängerregie kann im DOM die betroffenen Avatar-Slots und einen kurzen Handoff anzeigen. Die Anzeige bedeutet **keine automatische Künstlererkennung** und wird bei unbestätigten bzw. abgelaufenen Cues ausgeblendet.
- In 3D wird die bestehende Textmesh-Obergrenze bei vielen Sängern und auf kleineren Geräten konservativ weiter gesenkt. Der gesamte Zeilentext bleibt über die vorhandene Ein-Mesh-Ausweichdarstellung erhalten.
- Reduced Motion, manuelle Lyrics-Positionen, Schriftgrößen, V540-Kamera, V546-Lip-Sync und V547-Sänger-Timeline bleiben unberührt.

## Grenzen
- Keine Bild-/Pixelanalyse und keine Sprachsegmentierung.
- Nur bereits überprüfte, gültige V528-Cues erzeugen die zusätzliche Singer-Beschriftung. Selektive Hooks aus V547, die von V528 nicht bestätigt werden, werden nicht eigenständig als Sänger erkannt.
- Das vorliegende Projekt-ZIP enthält keine Beispiel-GLB-Dateien und keine `node_modules`.

## Prüfungen
`npm run verify:v549`; für den lokalen Produktionsbuild mit installierten Abhängigkeiten: `npm install && npm run build`.
