# Sonic Display V613 – Cinematic Concert Shot Pacing

**Basis:** V612 mit dem Windows-TypeScript-Testfix. **Ziel:** eine musikalisch nachvollziehbare, weniger repetitive Kameraführung während der ganzen bestätigten Show, ohne die bereits stabile Gesichtsanimation, Live-Lyrics oder User-Edits zu stören.

## Laufzeitänderungen

- `components/visualizer/concertShotPacingV613.ts` plant aus den **verifizierten** V604/V600-Akten wiederholbare Kamera-Haltephasen von ca. 6–9 Sekunden. Verse, Hooks, Builds, Breaks und belegte Drops erhalten bewusst unterschiedliche Einstellungsfolgen. Ein visuelles Halteintervall ist **keine** behauptete Audio-Beat-Erkennung.
- Bestehende V528-Marker dürfen nur bei gültiger Song-ID, nachgewiesenem Lead-Slot und aktueller Sänger-Zeitspanne eine winzige Portrait-Korrektur auslösen. Fehlende Singer-Evidence führt zu neutralem Shot – nie zu geratenem Deutschrap-Lipsync oder erfundenen Duettrollen.
- Die neue Schicht sitzt **nach** V606 Lyrics-/Singer-Framing und **vor** V610/V611 sowie der finalen V351-Bildschirmschutzregel. Bei geschützten Lyrics werden seitliche Zusatzschwenks vollständig gesperrt. Bestehende V550/V540-Messungen verhindern zusätzliche Überläufe an Kopf, Körper oder Lyrics.
- Automatische Bewegungen bleiben sanft (ohne Cuts, ohne zweiten Canvas/`useFrame`, ohne Timer oder neue GPU-Objekte). Manuelle Kamera-Presets, Autoren-Timelines, echte Vocal-Shots, Low-Tier, Reduced Motion, Stop und ungültige Quellen bleiben unberührt. Das Kapitel-Envelope blendet die Ergänzung an echten Szenenrändern wieder vollständig aus.
- Die **V612-Mund-/Gesichtsmotorik** bleibt unverändert; die nachgewiesenen Sänger-Cues priorisieren stattdessen stabile Portraits. Es werden weder neue Wort-/Phonemzeitpunkte noch Sänger-Schätzungen eingeführt.

## Quality Assurance

- `npm run test:v613`: 16 Gruppen und 15.192 Song-Zeitpunkt-Snapshots auf Frame-Sicherheit, Determinismus, Wiederholungsvariation, manuelle Prioritäten und relevante Fehlerszenarien.
- `npm run test:v613:types`: isolierte TypeScript-Typprüfung.
- `npm run test:smoke:v613`: V613 + V612-Smoke + V611/V610/V605 + Syntax + Architektur.
- `npm run test:all`: **optional**, führt alle einzeln registrierten Tests der `package.json` aus, überspringt wiederholende Sammelskripte und listet fehlgeschlagene Tests am Ende. `npm run test:all -- --list` listet zuerst nur Testnamen.
- `npm run build`: Produktionsbuild mit V613-Smoke als Preflight.

**Grenze der bisherigen Nachweise:** Deterministische Offline-Tests ersetzen keine reale Prüfung im Browser mit Spotify-Song, geladenen GLB-Morphs, Sängerwechseln und FPS-Messung. Für den Raspberry Pi wird vor der Anschaffung auf dem vorhandenen Rechner realistisch gebenchmarkt.
