# V978 – Smart Concert Atmosphere 2.0

Die **optionale** V978-Regie erweitert die bestehende V958-R3F-Bühne um acht sparsame transparente Geometrien:
max. drei Boden-Nebelplatten, zwei sanft schwenkende Lichtkegel und drei sehr dezente Publikumsränder.
(Bei allen Schaltern sind es acht Meshes; kein zusätzlicher Render-Loop, Shader-, Spotlight- oder Netzwerkcode.)

## Genre und Dramaturgie

- **Deutschrap:** dunkler, ruhiger Nebel; zurückhaltende Lichtkegel und Publikumsimpulse.
- **Hardtekk / Hardstyle:** stärker rhythmisch wirkende Lichtkegel und Publikumsrand-Impulse; reduzierte Nebelstärke.
- **Deutschrock / NDH:** breitere Arena-Anmutung und stärkere Publikumsrand-Impulse.
- **Sonstige:** gedämpfter neutraler Modus.

Verse/Breaks bleiben ruhiger, Hooks/Drops energetischer. Der aktuelle bestätigte V318-Abschnitt ist zwingend erforderlich, keine erfundenen Drops oder zukünftigen Songprognosen. Das sichtbare Pulsieren ist eine langsame, berechenbare Atmosphäre und **keine** exakte Echtzeit-Beat-Erkennung.

## Opt-in, Sicherheit und Leistung

Die Einstellungen unter `ConcertRoadmapStudioV958` lauten `atmosphereV978` (aus),
`atmosphereModeV978` (subtle/balanced/immersive), `atmosphereStrengthV978` (0–100),
`atmosphereFogV978`, `atmosphereBeamsV978` und `atmosphereCrowdV978` (jeweils einzeln abwählbar).
Die Einstellungen werden im vorhandenen V958-Speicherformat normalisiert; alte Konfigurationen bleiben kompatibel.

Ohne aktive, mindestens 75 % zuverlässige passende Songsektion, bei Pausen, manuellen Timelines,
autoren-gesteuerten Bühnen, reduzierter Bewegung, kompakter FX-Stufe, Raspberry-Pi-Sparprofil und
Alexa-`effect-off` ist V978 **aus**. V966/V972 werden erkannt und neue Transparenzen dann
zusätzlich gedrosselt, auch bei sichtbaren Lyrics. Effektwerte sind hart begrenzt; keine Blitze,
Laserhardware, physische Govee-Befehle, Kamera-/Choreografieänderung oder neue Timer.

## Prüfungen

- `npm run test:v978`
- `npm run test:v978:types`
- `npm run verify:v978:focused`
- Vor Produktionsfreigabe zusätzlich `npm ci`, **vollständiges** `npm run typecheck`,
  `next build` mit echten npm-Abhängigkeiten und GitHub-/Vercel-Checks auf Node 24.
