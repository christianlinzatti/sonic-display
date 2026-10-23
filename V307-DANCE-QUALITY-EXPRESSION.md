# Sonic Display V307 — Dance Quality & Expression

## Ziel

V307 ergänzt die in V306 koordinierte Bühnenshow um eine bewusst **dezente, additive Ausdrucksschicht** für Bewegungen. Bestehende GLB/FBX-Animationen, Retargeting, die AnimationMixer-Zeitleiste, Avatar-Rig-Kalibrierung, Fuß-IK, V134 Unified Motion, V158 Refinement und manuelle Choreografien bleiben bestehen. V307 erzeugt keine neuen echten Motion-Capture-Clips und verspricht keine automatische biomechanische Korrektheit.

## Start

1. Projekt entpacken und mit `npm install` / `npm run dev` starten.
2. **Settings → Dynamic Stage → Smart Stage Director → Dance Quality & Expression · V307** öffnen.
3. „Lebendige Tanzbewegungen aktivieren“ (standardmäßig ein), Stil und Ausdrucksstärke einstellen.
4. Empfohlen: **Deutschrap: Stil Rap, Stärke 55–70 %**; **Hardtekk/Hardstyle: Stil Rave, Stärke 60–80 %**; **Cinematic: 35–55 %**.
5. Den vorhandenen **Ultimate Show Director V306** separat einschalten, wenn automatisch Kamera, Licht, FX und Formationen synchronisiert werden sollen.

## Neu

- Phrasenabhängige Bewegungsvariation alle acht Beats statt zufälliger Änderungen in jedem Renderframe. Jeder Tänzer hat unabhängig reproduzierbare Gesten.
- Leichte asymmetrische Links-/Rechts-Armgesten; Kopfwendung, Head-Nods, Schulter-Rolls, Brust-, Wirbelsäulen- und Hüft-Groove.
- Rave/Hardstyle: stärkerer Kick-/Drop-Akzent; Deutschrap: entspannter Snare-/Head-Nod-/Shoulder-Groove; Cinematic: kleinerer Bewegungsradius.
- **Musikstruktur-Schutz**: Verse weniger dynamisch als Hooks/Drops; Breaks reduziert.
- **Fußkontakt-Schutz**: Bei zwei erkannten gesetzten Füßen keine zusätzlichen V307-Fußheber, bei einem gesetzten Fuß reduzierte Zusatz-Footsteps. Der bereits vorhandene Fuß-IK-Solver führt weiterhin die eigentliche Bodenverankerung aus.
- Die V307-Qualitätsschicht erscheint **nach** Unified Motion und Full-Body Refinement, **vor** Motion Debugger, Rig-Overlay und IK. Sämtliche Ausgaben sind begrenzt, keine Änderungen an Dateien/Clips.
- Wenn „Choreography“ oder ein aktiv ausgewählter Bibliotheksclip Vorrang hat, reduziert V307 seine Zusatzauslenkung deutlich.
- Stabile Musikuhr auch bei seltenen Spotify-Progress-Updates; Sprünge und Trackwechsel setzen die V307-Hüllkurven zurück; Pausen und Reduced Motion unterdrücken die neue Bewegung.
- Neue Einstellungen werden im Browser unter `sonic-dance-quality-v307` gespeichert. Alle V306-Regler bleiben nutzbar.

## Quellcode

- `components/visualizer/danceQualityV307.ts` – Phrasenmuster, Audioakzente, Dämpfung, Bodenkontaktschutz, Songuhr und Einstellungen.
- `components/visualizer/DanceQualityControlsV307.tsx` – Live-Regler.
- `components/visualizer/ThreeAvatar.tsx` – Integration in importierte GLB- und prozedurale Avatare.
- `components/visualizer/avatarRigController.ts` – unabhängige Arm-Zusatzkanäle (begrenzte additive Rotationen).
- `components/visualizer/motionDebugControls.ts` – neue Armkanäle folgen weiterhin der vorhandenen Debug-Maskierung.

## Verifikation

- `npm run test:v307` – pure Bewegungssimulation, Audio-/Stilvarianten, Pause, Seek, Trackwechsel, Settings, IK-/Clip-Priorität und UI-/Rig-Wiring.
- `npm run verify:offline` – Syntax und Regressionen V265 bis V307.
- Für eine **vollständige** Produktionsprüfung lokal zusätzlich `npm install && npm run typecheck && npm run build` durchführen. Fehlende Node-Module verhindern in dieser Bereitstellungsumgebung die vollständige Next.js-Build-Prüfung.

**Wichtig:** Sehr natürliche Tanzbewegungen erfordern weiterhin hochwertige GLB-Motion-Clips, passende Skelett-Retargeting-Daten sowie verlässliche Echtzeit-Audiosignale. V307 wertet vorhandene Bewegungen ausdrucksstärker auf, ersetzt diese Voraussetzungen aber nicht.
