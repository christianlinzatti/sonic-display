# Sonic Display V647 – Cinematic Stage Environments 2.0

## Ziel

Mehr unterscheidbare, filmische Konzert-Hintergründe während ganzer Songs **ohne** neue Bühnen-Assets, Lichtquellen oder zusätzliche R3F-Rendering-Passes. Die manuelle Auswahl des Bühne-Themes bleibt unverändert; V647 überlagert lediglich eine akzentuierte Bühnenarchitektur auf der bestehenden V635-LED-Wand.

## Neue Muster (Shader-Simulationen, keine 3D-Bauten)

| Genre | LED-Architektur | Dramaturgie |
|---|---|---|
| Deutschrap | **Concrete Warehouse:** Pfeiler und industrielle Querträger | zurückhaltende Verse, merkbarere Hooks |
| Hardstyle | **Festival Truss:** Bühnen-Traversen und Diagonalen | Builds steigen langsam, bestätigte Drops markanter |
| Hardtekk | **Rave Tunnel:** perspektivisch wirkende, wiederholte Rahmen | energischere Drops ohne unbestätigte Beat-Events |
| Rock | **Amplifier Wall:** Verstärker-/Lautsprecherblöcke | breitere Refrainkulisse |
| Pop | **Prism Studio:** abstrahierte Prismen-Facetten | sanfte Studio-/Hook-Varianten |
| Electronic | **Neon Vault:** leuchtende Rechteckrahmen | wechselnde, kontrollierte elektronische Motive |

Die Architekturmotive sind im Fragment-Shader abstrahiert. Es werden weder echte Säulen/Meshes noch mehr Bühnen-GLBs nachgeladen. Neue auswählbare Bühnen im Einstellungsmenü sind **nicht** Bestandteil dieser Version; die bisherigen auswählbaren Bühnen bleiben unverändert.

## Umsetzung und Schutzregeln

- Neue, zustandslose Regie in `components/visualizer/cinematicStageEnvironmentsV647.ts`. Für Aktivierung müssen Track-ID, Dauer, Position, verifizierter V600/V604-Akt, Kapitel, Motiv, Wiederholung sowie V635-Stage-Fade übereinstimmen.
- Im bestehenden `DynamicStage.tsx` wird **nur der V635-Backwall-Shader** durch V647 ersetzt und fünf Uniforms aktualisiert. V635 steuert unverändert Farbwerte, Sichtbarkeit und maximale Deckkraft; Übergänge gehen an Abschnittsgrenzen über Null.
- Die sechs Designs teilen eine feste Plane und erscheinen überwiegend am Rand; die Bühnenmitte bleibt für Avatare und Lyrics dunkler. Max. Shader-Alpha bleibt 0,15, und V635-/V640-Grenzen bleiben aktiv.
- Die automatische Gestaltung ist deaktiviert bei manueller Lichtregie, Blackout, Pausen, reduziertem Bewegungsmodus, Low-Tier oder fehlender Song-Evidenz. Balanced-Tier, vier Performer, Sängerfokus und aktiv geschützte Lyrics senken die Intensität zusätzlich.
- Keine neuen Draw Calls oder Render-Schleifen. Komplexere Fragment-Shader können trotzdem GPU-Zeit benötigen; ein Leistungsgewinn wird **nicht** behauptet.

## Reproduzierbare Prüfung

```powershell
npm install
npm run test:v647
npm run test:v647:types
npm run verify:v647
npx tsc --noEmit
npm run build
```

Nach erfolgreichem lokalen Build für Deutschrap/Hardtekk/Hardstyle/Rock/Pop jeweils einen mehrminütigen Song im Browser testen, inklusive Lyrics und 1/2/4 realen GLB-Avataren. FPS/P95 über das vorhandene V641-QA-Panel messen. Wenn Low-Tier benötigt wird, fällt der automatische V647-LED-Effekt vollständig weg.
