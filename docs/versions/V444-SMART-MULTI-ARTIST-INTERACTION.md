# Sonic Display V444 – Smart Multi-Artist Interaction & Vocal Focus

V444 setzt die automatische V442-Multi-Artist-Bühne mit drei oder vier Avataren fort und ergänzt **kleine, kontrollierte Kopf-, Augen- und Armgesten**. V443-Fokus, V441-Künstlernamen und V439-GLB-Animationen bleiben erhalten.

## Live-Steuerung

1. `multiArtistInteractionV444.ts` erzeugt für bis zu vier Slots einen reinen, begrenzten Interaktionsplan aus der bereits bestehenden V326-Gruppenpose und dem aktuellen musikalischen Cue. Die Anweisung enthält `LookAtCue` und `PartnerGestureCue` für jeden Avatar. Die Maximalwerte sind u. a. ±0,38 rad Kopfausrichtung, 0,21/0,24 rad Armhebung, eine kleine Schulterbewegung und dezente seitliche Haltung. `strength` ist auf 0–100 % begrenzt.
2. `ThreeAvatar.tsx` reicht diesen Plan über **stabile React-Refs** an die vorhandenen `PartnerLookContext`- und `PartnerGestureContext`-Verbraucher jedes unabhängigen Tänzers weiter. Keine React-State-Updates pro Frame, keine zweite Animation-Engine. `ProceduralAvatar` und `GltfAvatar` lesen diese Cues bereits über den vorhandenen Rig-Code. Die vorhandenen Überblendungen glätten den Wechsel.
3. **Manuelle V385-/V416-Rollen**: Ist ein für die aktuelle Songstelle ausdrücklich gespeicherter Sänger-/Rapper-Slot aktiv, verwendet V444 diesen Slot als Bühnenfokus. Bei einer manuell inszenierten Übergabe (`handoffFrom`) kann der vorherige Slot antwortend reagieren. Bei ausdrücklich als Hook oder gemeinsame Performance inszenierten Parts reagieren mehrere Avatare gemeinsam. Ohne Rollen wird aus der V442-Phrase ein visueller Fokus gewählt; es wird **niemals behauptet, einen menschlichen Sänger aus Audio erkannt zu haben**.
4. In der bestehenden `AutoMotionIntelligencePanelV438.tsx`-Oberfläche befinden sich **Aktivierung** (Standard `true`) und **Intensität** (Standard 60 %). Sie werden in `UiPreferencesContext` wie die bestehenden Einstellungen gespeichert.

## Prioritäten und Sicherheit

- Nur bei aktiver **automatisch generierter** V442-Gruppenformation mit 3–4 Avataren, nicht bei eigenem V326-Arrangement, Solo/Duo-Rendering oder manuell gesetzten Choreografien.
- Vorrang für explizite Rapper-Vocal-Zuordnungen. Bereits aktive eigenständige V375-/V376-Regie führt dazu, dass V444 keine konkurrierende visuelle Regie startet, sofern keine gültige manuelle V385-/V416-Zuordnung vorliegt.
- Deaktivierung, 0 % Stärke, Pause und reduzierte Bewegung liefern keine zusätzlichen Cues. Bei deaktivierten Cues gleiten die vorhandenen Look-/Gesture-Overlays zurück auf neutral.
- Keine Bearbeitung oder Speicherung von GLB-/FBX-Daten, Animations-Keyframes, Gesangszeiten oder Camera-Keyframes. Kein Netzwerkzugriff. Die Reaktionen sind additive, begrenzte Bone-/Rig-Overlays, keine überschreibenden Animation-Clips.
- Performance: Pro Frame werden höchstens vier Cues ohne Dateizugriff geplant. Es werden keine neuen Avatar-Rigs, WebGL-Canvas oder zusätzlichen Mixer erzeugt.

## Grenzen

Die tatsächlichen Künstler hinter den aufgenommenen Stimmen werden **nicht** automatisch identifiziert. Ohne explizite Zuordnung ist eine „Antwort“ eine *visuelle* Call-and-Response-Choreografie, kein erkannter Gesangseinsatz. Kopf-/Gestenwirkung hängt von den vorhandenen humanoiden Rig-Zielen des GLB-Modells ab; fehlt ein geeignetes Bone, ignoriert der bestehende Rig-Code das entsprechende Signal. Echte Browser-/WebGL-Tests mit den installierten Avataren sind noch nötig.

## Tests

```sh
npm install
npm run verify:v444
npm run typecheck
npm run build
```

`npm run verify:v444`: V444, V443–V439, Syntax-, Import-, Modulnamen- und V190-Motion-Library-Prüfung. Zusätzlich einzeln V423–V426, V429–V438 und V242.
