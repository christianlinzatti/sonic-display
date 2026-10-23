# Sonic Display V486 – Advanced Dance Footwork 2.0

**Basis:** V485. **Paket:** `0.1.0-v486`. **Datum:** 23.10.2026.

## Implementierte Änderungen

- `components/visualizer/advancedDanceFootworkV486.ts` ergänzt die bestehende V485-Bewegungsplanung um einen **deterministischen Fußhub**, links und rechts **abwechselnd** und bei Ein-/Ausgang ohne harten Sprung. Die Phase richtet sich nach dem vorhandenen Song-/Cue-Fortschritt; mit vorhandenem BPM-Wert wird dessen Tempo verwendet. Ohne verlässlichen BPM-Wert ist 2 Hz nur eine **weiche Bewegungsvorgabe**, kein behaupteter gemessener Beat.
- Im prozeduralen Avatar werden bereits vorhandene V481-Ober-/Unterschenkelgelenke mit diesem Fußhub betrieben. Die V482-Knie-/Becken-Übergänge bleiben die Quelle der tiefen Hockbewegung; V486 verändert das bestehende Bein-Rig nicht. Eine leichte, begrenzte Gewichtsverlagerung (max. 0,014 rad) ergänzt den schon existierenden Lean-Kanal.
- Bei **GLB-Modellen** melden bereits aktive Foot-IK-Instanzen die aktuell beobachteten Stützphasen der beiden Füße (nur `planted` / nicht `planted`). Bei **beiden gemeldeten Stützfüßen** wird die Geschwindigkeit der **optionalen** V485-Root-Verschiebung stark reduziert. Die originalen Keyframes, Animationen und IK-Korrekturen werden **nicht** ersetzt; ohne IK-Signal wird kein Kontakt erfunden.
- Bühnen-Root-Verschiebungen aus V485 werden vorsichtig auf **90 %** skaliert, mit gleichem ursprünglichen Slotabstand. Außerhalb der optionalen V485-Pose kehrt die vorhandene Formationslogik mit ihrer normalen Geschwindigkeit zurück. Bei Pause, Seek-Verschiebung, reduzierter Bewegung, manueller Choreografie, aktivem Foot-Lock oder niedriger Renderqualität greift V486 nicht ein.
- Keine zusätzliche Render-/Audio-Schleife, keine Netzwerkanfragen, keine zusätzlichen GPU-Objekte und keine neuen Einstellungen. Integration in die vorhandene `ThreeAvatar.tsx`-Frame-Schleife durch kleine React-Context-Refs (ohne zustandsgetriebene Re-Renders pro Frame).

## Einschränkungen

Die V486-Planung kann optisches Fußgleiten **reduzieren**, aber ohne Rig-spezifische Fußsohlengeometrie, vollständige Kontaktphysik und reale Visualtests **nicht garantiert verhindern**. Sie ist keine neue IK-Engine. Importierte GLBs brauchen geeignete Animationen und werden **nicht** prozedural neu geriggt. V485-Stagesicherheit prüft Bühnen-Root-Abstände, keine Mesh-/Fußkollisionen. Automatische Schrittakzente betreffen nur bestehende automatisch dirigierte Dreier-/Vierergruppen, nicht benutzerdefinierte Bewegungen.

## Lokale Prüfung

```powershell
npm install
npm run test:v486
npm run test:v486:types
npm run build
```

Die Regression prüft Song-Zeitdeterminismus, Seek, glatten alternierenden Fußhub, V322-Kontaktvorrang, manuelle/Pause-/Low-Prioritäten, 33 Minuten simulierte Wiedergabe und reale Source-Verdrahtung. Der vollständige Next.js-Build erfordert installierte npm-Abhängigkeiten und muss auf dem Zielsystem geprüft werden.
