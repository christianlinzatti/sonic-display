# Sonic Display V584 – Natural Duet & Stage Interaction 3.0

Stand: 26.10.2026. Der Release erweitert **V583** ohne zusätzliche Audio-, Render- oder Netzwerkprozesse.

## Geänderte Dateien und Verhalten

- `components/visualizer/naturalDuetStageInteractionV584.ts`: reine, deterministische Verfeinerung von bereits autorisierten Sänger-/Duett-Cues aus V416/V496 mit validierter Song-ID, Sänger- und Rollenzuordnung. Keine automatische Sprechererkennung.
- `components/visualizer/duetResponseV575.ts`: führt V584 **nach** V575 aus; `planIntelligentRapDuetV500` behält seinen bestehenden Rückgabe-/Integrationspfad, der live in `DanceFormationActorsV492.tsx` (2 Avatare) und `GroupDancersV326SceneV492.tsx` (3–4 Avatare) genutzt wird.
- Bei einem manuell bestätigten **Sängerwechsel** zeigt der neue Lead eine kleine Antwortbewegung; der bisherige Sänger kann kurz die bestehende Blickrichtung stärker nutzen. Im **Duett** reagieren beide Performer zu unterschiedlichen Zeitpunkten, ohne ständig zueinander zu blicken. Bei **Hooks** gibt es dezente gemeinsame, aber seitenversetzte Oberkörper-Gesten; alle Gesichter schauen weiter nach vorn. **Nicht singende Performer** bekommen zurückhaltende, zeitlich gestaffelte Antworten.
- Die zusätzlichen Gesten werden über die vorhandenen `PartnerGestureCue`-/`LookAtCue`-Kanäle geführt. Es werden **keine** Rollen, Mundformen, Morphs, Kamera-Cues, AnimationClips, Foot-IK-Werte oder Group-/Root-Positionen modifiziert.
- Der neue Plan kennt keine neuen React-/Three-Hooks und keine globalen Zustände. Playback-Seek bleibt reproduzierbar. Bei überlappenden oder zu weit entfernten Performern gibt es keine zusätzlichen partnergerichteten Handoff-Akzente.
- V584 setzt aus bei Pause, `reducedMotion`, Low-Tier, manuell priorisierter Choreografie, fehlender / abweichender Song-ID, fehlendem/ungültigem Sänger-Cue oder ungültigen Stage-Positionen. Die bestehende V500/V575-Animation bleibt beim Abschalten von V584 erhalten.

## Validierung

```powershell
npm run test:v584
npm run test:v584:types
npm run test:smoke:v584
npm run verify:v584
npm run typecheck
npm run build
```

Die ersten vier Befehle sind Offline-Prüfungen. `npm run build` erfordert installierte Abhängigkeiten und einen vollständigen TypeScript-Projektcheck.

## Visuelle Abnahme (offen)

1. Zwei echte GLB-Avatare und ein Deutschrap-Feature-Song mit **manuell bestätigten** V416/V496-Rollen; Sängerwechsel zwischen zwei zeitmarkierten Zeilen prüfen.
2. Für `reply`, `duet`, `hook` und `solo` jeweils Gesichter/Blick, Armgesten und stabilen Fußkontakt prüfen. Bei Seek vor/zurück dürfen Rollen nicht wechseln.
3. Mit drei/vier Avataren die zeitversetzten Hintergrundgesten und unveränderte Song-Zuordnungen kontrollieren. In einem Track ohne belegte Cast-Daten darf kein V584-Effekt erscheinen.
4. Auf Raspberry Pi bei `low`, Pause und `reducedMotion` keine zusätzlichen Akzente; WebGL-Frametimes vor/nach V584 und langfristig messen. Benchmark-Anleitung: `V580-CONCERT-EXPERIENCE-3.md`.

**Wichtig:** Durch Offline-Tests können echte Lippenqualität, Blickkontakt mit einem GLB-Augen-Rig, FPS und visuelle Konzertwirkung nicht bestätigt werden. Diese Punkte bleiben bis zur Geräte-/Browser-Abnahme ausdrücklich offen.
