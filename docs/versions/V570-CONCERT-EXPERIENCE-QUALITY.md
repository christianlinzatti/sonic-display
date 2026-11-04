# V570 – Concert Experience 2.0: Realistic Release Quality Check

## Was tatsächlich implementiert ist

- **Konzertstudio:** Die bestehende 3D-Vorschau zeigt unter „V570 · Konzert-Qualitätscheck“ den Stand der **verfügbaren Eingangsprüfungen**. Der Report unterscheidet Demo-Szenen, eine ausgewählte GLB-Quelle und den Modus „Aktueller Song“.
- **Echtes GLB:** Eine URL allein genügt nicht, um das Gesicht als erfolgreich getestet zu melden. Die konkrete Instanz muss im bestehenden Rig-Scanner wirklich erschienen sein. Fehlende Mundkanäle werden sichtbar. Im Duett ist **jede** Instanz unabhängig zu prüfen.
- **Lip-Sync:** Rap- und Gesangsdemos sind als synthetisch gekennzeichnet. Echte Wortmarken sind nur dann ein positives Inputsignal, wenn Spotify aktuell spielt und die Songuhr nicht veraltet ist. Zeilen-Timestamps sind keine Wort-/Phonemverifikation.
- **Feature-Track:** Positive Zuordnung nur bei aktiviertem, validem, zeitlich passendem und manuell bestätigtem Casting. Bei fehlender Evidenz meldet V570 einen Fallback – keine Schätzung aus Künstler-Credits oder Songtexten.
- **Tanzclips:** Ein positiver Datencheck erfordert mindestens zwei vorhandene geeignete eingebettete GLB-Clips pro beteiligtem Modell. Die opt-in-Demo mit künstlichen Wechselzeitpunkten ist **keine** Messung der realen Übergangsqualität.
- **Lesbarkeit, Rendering:** WebGL/Bildqualität, lesbare Lyrics, tatsächliche FPS und Raspberry-Pi-Speicherwerte werden **immer** als manuell offen ausgewiesen. Keine Produktionsfreigabe aus synthetischen Tests.

## Reproduzierbarer lokaler Qualitätsdurchgang

1. Nach dem Entpacken `node scripts/v570-release-readiness.cjs --json` ausführen. Es zeigt, ob Node.js geeignet und Next/React/TypeScript installiert sind.
2. Bei vorhandenen Abhängigkeiten `npm run typecheck` und `npm run build` ausführen. Der Build hat einen langen bestehenden Preflight; `npm run verify:v570` kann gezielt vorher ausgeführt werden. Ohne Abhängigkeiten **nicht** „Build bestanden“ dokumentieren.
3. Im Browser über **Einstellungen → Konzert-Bühneneffekte → 3D-Vorschau** das Studio öffnen. Strophe, Hook, dichten Deutschrap und Duett bei unveränderter Kamera durchgehen; Licht, Gesicht, 3D-Lyrics und Fußkontakt visuell prüfen. Negative Fälle (fehlendes GLB, fehlender Partner, fehlende Wort-Timestamps, pausiertes Spotify) müssen als eingeschränkt/offen erscheinen.
4. Mit zwei tatsächlich vorhandenen GLB-Avataren die V563-Duett-Demo sowie vorhandene manuelle Songrollen getrennt prüfen. Beide Mund-Rigs werden separat angezeigt; nicht zugeordnete Parts dürfen **keine** Sängeridentität erhalten.
5. Auf dem Ziel-Raspberry-Pi mit repräsentativen GLBs 10 Minuten warm laufen lassen, anschließend mindestens 2 Stunden laufen lassen: FPS (Median und 1%-Tiefwert), Heap/GPU-Auslastung, LOD-Wechsel, Lyrics-Lesbarkeit, Kamerafokus und Pausen/Rückkehr beobachten. **Messwerte extern aufzeichnen.**
6. Erst nach Browser-/Pi-/Spotify-Durchlauf und bestandenem vollständigen Build eine reale Freigabe vergeben. V570 selbst stellt keine automatische Produktionsfreigabe aus.

## Kein Funktionsverlust

Die V561–V569-Module (GLB-Lip-Sync, Mundkalibrierung, zwei GLB-Performer, Rap-Gesten, Blending, Kameralicht, Wort-Cues, Show Director, objektallokationsarme GLB-LOD) bleiben unverändert. Die neue Inspektion liest ausschließlich aus bereits vorhandenen Vorschau-States und fügt weder neue Three.js-Lichter/Shader noch React-Frame-Callbacks hinzu. Es gibt keine feste 20-Clip-Grenze.

## Tests

`npm run test:v570`, `npm run test:v570:types`, `npm run verify:v570`, `npm run audit:v570:environment` und die historischen visuellen Szenen-, Motion-, Vocal-, Lyrics-, Pi-Tests. **All dies ersetzt keine reale Sichtprüfung.**
