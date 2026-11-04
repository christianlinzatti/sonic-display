# V588 – Intelligent Dance Choreography 7.0

**Basis:** Sonic Display V587 · 26.10.2026

## Funktion

V588 verteilt die **schon geladenen** und von V536 als geeignet bewerteten GLB-Clips über musikalische 32-Beat-Fenster. Die zeitlich deterministische Rotation vermeidet eine ständige Wiederholung desselben Favoriten, auch über lange Deutschrap-, Hardstyle- und Hardtekk-Tracks. In vier-Avatar-Shows benutzt jeder Performer einen eigenen stabilen Slot-Seed. Hook, Verse, Pause, Drop und Genre bestimmen weiter die Eignung, nicht ein zufälliger Timer. Bei unbekannten BPM gilt nur ein konservativer Standard für die Fensterlänge; eine echte Beat-Analyse findet hier nicht statt.

- `longFormChoreographyV588.ts`: deterministische `musicalWindowV588`-/`planLongFormChoreographyV588`-Funktionen, plus `stepLongFormChoreographyV588` für Sperrzeit, Seek/Clip-Wechsel und Pause.
- `useGenreAwareMotionDirectorV536.ts`: zusätzliche V588-Entscheidung nach V536, kein weiterer Hook-Loop, kein Mixer und keine neuen AnimationClips.
- `GltfDancerAvatarV492.tsx`: bleibt in der bewährten V536-Auswahl-/V492-Pose-Matching-Crossfade-Kette. Die vorhandene Bibliotheks-Freigabe `library.automatic` ist weiterhin erforderlich.

## Grenzen und Prioritäten

1. Nur Action-Namen, die im lokalen GLB-/Shared-/Library-Mixer bereits geladen wurden. **Keine automatische Beschaffung, kein dynamischer Download oder neuer GLB-Import.** Bibliotheksinhalte und Clipanzahl werden nicht künstlich auf 20 begrenzt; andere Komponenten behalten ihre eigenen Import-Grenzen.
2. Nur mindestens zwei annähernd gleich gute, genre- und abschnittskompatible Kandidaten lösen die neue Rotation aus. Für einen Clip oder inkompatible Clips gilt die frühere V536-Entscheidung. Fortbewegungsclips werden nicht für die neue Rotation bevorzugt.
3. Manuelle Sequenzen, Loops, Timelines, Rap-Live-Regie, Gruppenregie, reduzierte Bewegung oder pausierter Song behalten Vorrang; auch importierte Animationen werden nicht umgeschrieben.
4. Achtsekündige Mindestabstände, bereits vorhandene V492-Clip-Übergänge, keine Root-/IK-/Gesichts-/Vocal-Bearbeitung.
5. Kein FPS-Versprechen: Entscheidungen werden höchstens beim Wechsel von musikalischem Fenster, Kontext, relevanter Energiekategorie oder verfügbaren Clips neu gerankt. Ausstehende Umschaltungen werden zwischengespeichert.

## Prüfung

```bash
npm run test:v588
npm run test:v588:types
npm run test:smoke:v588
npm run verify:v588
```

Die 3D-Qualität muss mit echten importierten GLBs und einem realen Song nachgeprüft werden; besonders Bewegungskontinuität über 5–10 Minuten, Fußkontakt, sichtbare Abwechslung und Performance des Raspberry Pi.
