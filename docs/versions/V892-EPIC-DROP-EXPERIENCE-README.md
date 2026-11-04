# Sonic Display V892 – Epic Drop Experience

## Neue gemeinsame Konzertregie

V892 erweitert das **Live-FX-Deck** um eine zeitlich koordinierte, nicht blinkende Drop-Inszenierung. Es nutzt die **aus V604 bestätigte V883-Showplanung**, keine neu erfundene Audio-/Beat-Erkennung.

Jeder ausgewählte Drop und jedes bestätigte Finale erhalten ein begrenztes Drei-Phasen-Profil:

- **Impact** – 0–700 ms: stärkere bestehende V882-Bass-Schockwelle und dezenter LED-Akzent.
- **Drive** – ca. 700–2100 ms: bereits aktivierte Laser, LED-Wall, Scheinwerfer und rein digitale Pyrotechnik erhalten kleine Intensitätsmodulationen. Automatische Tänzer reagieren zurückhaltend.
- **Release** – ab ca. 2100 ms: alle Modulationen laufen weich aus. Die vorhandene automatische Kamera wird ausschließlich durch eine begrenzte Interpolationsrate begleitet; gespeicherte Shots bleiben unangetastet.

Eine einzelne Phase wird nicht eigenständig ausgelöst. Die durch V883 bereits begrenzten Höhepunkte bleiben maßgeblich; es entsteht **kein zusätzlicher Beat-, Flash- oder Stroboskop-Takt**.

## Wo einstellen?

Unter **✦ LIVE FX → V892 Epic Drop Experience** gibt es:

- Master-Schalter, die Profile *Cinematic / Ausgewogen / Festival* und einen Intensitätsregler.
- Getrennte Verstärkungsschalter für 3D-Schockwelle, LED-Wall, Laser, Spotlights, virtuelle Pyro, Tänzer und automatische Kamera.
- Schutz für Lyrics und Gesangs-Close-ups (standardmäßig aktiv).
- Phasenanzeige, Liste bestätigter Drop-/Finale-Zeitpunkte und JSON-Export.

V892 ist standardmäßig eingeschaltet, **kann aber keinen anderen deaktivierten Effekttyp einschalten**. Für virtuelle Pyrotechnik muss V891 weiterhin ausdrücklich aktiviert werden. Für V886-LED- und V888-Laser-Looks müssen die bisherigen Optionen und Qualitätsbedingungen bereits erfüllt sein.

## Integration und Schutz

`components/visualizer/epicDropExperienceV892.ts` ist eine rein funktionale Planungsschicht. Die vorhandene Bridge `components/visualizer/concertStageSyncV882.ts` transportiert den unveränderten Songplan und die Konfiguration. Der existierende `components/visualizer/DynamicStage.tsx` wendet nur streng begrenzte Multiplikatoren auf bereits aktive Render-Cues an; `components/visualizer/StageCameraDirectorV289.tsx` ändert ausschließlich die automatische Kamera-Dämpfung, und `components/visualizer/VisualizerStage.tsx` begrenzt automatische Tanzakzente auf das bisherige V882-Maximum.

Pausen, Songwechsel, ungültige Dauer/Position, Spulen, Blackouts, manuelle FX-Timelines und reduzierte Bewegung schalten V892 aus. Manuelle Beleuchtung sperrt Licht-, Laser-, LED- und Pyro-Verstärkung; manuelle Kamera und manuelle Tänzer bleiben jeweils unverändert. Auf Low-Tier-Hardware werden keine zusätzlichen Drop-Akzente gerendert. Bei Lyrics-Schutz sinkt die Intensität, Kamera und Künstler-Spotlights bleiben unmoduliert.

**Keine neuen Draw-Calls, Lichtquellen, Materialien, Partikel, Gerätebefehle oder Hintergrund-Timer.** Die virtuellen Pyro- und Lasereffekte steuern keine physischen Geräte. Für den visuellen Betrieb ist weiterhin eine 3D-Avatar-Bühne erforderlich.

## Verifikation

Die fokussierte Testkette: `npm run verify:v892:focused`. Zusätzlich vor einer Produktionsfreigabe zwingend `npm ci`, `npm run typecheck`, `npm run build` und ein echter WebGL-Browser-Test auf dem Ziel-PC. Ergebnisse und Einschränkungen: [`V892-VERIFICATION.md`](V892-VERIFICATION.md).
