# Sonic Display V492 – GLB Avatar Hook Modularisierung

24. Oktober 2026 · **Refactoring ohne neue Version**: `0.1.0-v492` · Grundlage: `sonic-display-v492-three-avatar-modular-refactor.zip`.

## Ausgangspunkt

Nach dem ersten Split umfasste `components/visualizer/GltfDancerAvatarV492.tsx` noch **1.516 Zeilen**. Der Code mischte GLB-Rig, Vocal-Gesten, den Drei-Animationsmixer, Foot-IK, gespeicherte Presets und Clipüberblendungen in einer großen React-Komponente.

Der GLB-Einstieg umfasst nach dem zweiten Split **1.169 Zeilen**. Der öffentlich verwendete Export `GltfAvatar` und `ImportedAnimationAvatar` bleiben unverändert. Es gibt **keine neue Animationsengine, keinen zweiten Mixer und keinen zusätzlichen Foot-IK-Frame-Loop**.

## Neue Verantwortlichkeiten

| Modul | Aufgabe |
| --- | --- |
| `useGltfFootContactV492.ts` | Einmalige Rig-/Foot-IK-Initialisierung, Kontakt-Fallback, V322-Foot-Lock und V486/V487-Bodendaten. Die Aktualisierung läuft bewusst im bisherigen Frame-Callback, nach der Bewegung. |
| `useGltfVocalMotionV492.ts` | Kleidungsmaterialien, musikreaktive Bewegungen und lyric-/rapbasierte Körperakzente einschließlich manueller Sängerrollen. |
| `gltfVocalPerformanceV492.ts` | Bestehende V371–V459-Vocal-, Rap-, Lippen- und Head-Cues in einem reinen, synchronen Frame-Kompositor. Keine eigene `useFrame`-Registrierung. |
| `useGltfBlendSetupV492.ts` | Gecachte vorbereitete V490/V492-Zusatzclips, erlaubte Arm-/Brustkanäle, Preset-Grenze, Modell- und Clipvalidierung. |
| `useGltfAnimationMixerV492.ts` | Einziger `useAnimations`-Aufruf, Gruppenphasensignaturen und Ausschluss künstlicher Overlays bei der Hauptclipwahl. |
| `useGltfClipTransitionsV492.ts` | V489-Low-Pose-Übergänge, Pose-Matching, Fußkontakt- und V311-Crossfade-Regeln. |
| `useGltfBlendPlaybackV492.ts` | Manuelle Überlagerung, automatische V490-Armgesten und live aktivierte V492-Presets mit denselben Mischgewichten und Vorrangregeln. |

Der restliche GLB-Einstieg verwaltet weiter das Laden und Retargeting von Modellen, die gespeicherte Motion-Library, Musik-/Beatformationen, große Dance-Frame-Logik und LOD-/Timeline-Wiedergabe. Diese Bereiche sollten erst nach bestätigtem Produktionsbuild separat refaktoriert werden.

## Verhalten und Schutz

- **Unveränderte Reihenfolge** innerhalb des bestehenden Render-Callbacks: Avatar-Rig-Motion → Partnerblick/-gesten → Vocal-/Rap-Komposition → Hand-IK → Foot-IK/V487-Beobachtung.
- Der bestehende Drei-Mixer ist der **einzige** Mixer für alle Basisclips und Layer.
- Keine Änderungen an GLB-Dateien, Rig-Knochennamen, gespeicherten Presets, Lyrics- oder Spotify-APIs.
- Manuelle Timeline, Choreografien, GLB-Blending und Sängerrollen behalten die zuvor festgelegten Prioritäten.
- Der Test-Helfer `tests/helpers/threeAvatarSourcesV492.cjs` aggregiert die **wirklich vorhandenen Quellmodule** für ältere Quelltext-Regressionstests; keine eingefrorene Kopie des Monolithen.

## Tests

```powershell
npm run test:gltf-hook-split
npm run test:three-avatar-split
npm run test:v492
npm run test:v491
npm run test:v490
npm run test:module-case
npm run typecheck
npm run build
```

Die Strukturprüfung erzwingt nur einen Mixer und die bestehende Frame-Reihenfolge. Die eigentlichen Verhaltensregressionen bleiben in den V322–V492-Tests.

**Wichtig:** In der Bereitstellungsumgebung fehlen npm-Abhängigkeiten. Ein echter Next.js-Produktionstest und die visuelle Kontrolle mit den eigenen GLB-Modellen sind auf dem Windows-Rechner noch durchzuführen. Der zuvor bestätigte V492-Produktionsbuild betraf den Stand vor der Modularisierung.
