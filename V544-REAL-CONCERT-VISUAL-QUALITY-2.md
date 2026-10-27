# V544 – Real Concert Visual Quality 2.0

## Bedienung
1. GLB-Show starten. Im 3D-Visualizer den **QA**-Schalter aktivieren. V544-Ausklappbereich öffnen.
2. Beim gewünschten Ausgangspunkt „Probe A aufnehmen“ klicken.
3. Szene/Profil verändern und „Probe B aufnehmen“ klicken. Gleich viele Avatare und ein ähnliches Seitenverhältnis verwenden.
4. Beobachtungen **Tanz/Fußkontakt**, **Mimik/Lip-Sync**, **Lyrics** in jeder Probe manuell markieren.
5. Die rein lokalen A/B-Befunde prüfen und bei Bedarf als JSON exportieren.

## Was objektiv ist
- Die Kopfpositionen sind in der aktiven WebGL-Kamera projiziert, teils aus der Körperhöhe geschätzt.
- Das Lyrics-Rechteck wird nur bei einer sichtbaren, aktiven Lyrics-Zeile erfasst.
- FPS werden nur angezeigt, wenn die zugrunde liegende V466-Diagnose eine frische Messung meldet.
- Erfasste Proben sind während dieser UI-Sitzung im Speicher und überschreiben nichts am Mix, Renderer oder Song.

## Was NICHT objektiv ist
- Die Vorschau ist ein schematisches 2D-Bild ohne echte Bühnenpixel. Sie erkennt keine verdeckten Gesichter, Blickrichtung, echten Fußrutscher, Lichtqualität oder lippengetreue Phoneme.
- „Technisch unauffällig“ gilt nur für geprüfte Werte und manuelle Bestätigungen, nicht als zertifizierte Pi-Freigabe.
- Für die tatsächliche visuelle A/B-Prüfung muss die laufende Bühne angeschaut und ggf. ein System-Screenshot gemacht werden.

## Prüfungen
`npm run verify:v544` und nach Installation aller Projektabhängigkeiten `npm run typecheck && npm run build` ausführen. Bei fehlendem `node_modules` ist die vollständige Next.js-/React-/Three-Prüfung nicht bestätigt.
