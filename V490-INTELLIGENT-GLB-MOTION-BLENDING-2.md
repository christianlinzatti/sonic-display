# Sonic Display V490 – Intelligent GLB Motion Blending 2.0

**Basis:** V489 · **Paketversion:** `0.1.0-v490` · **Datum:** 23.10.2026

## Funktionsumfang

- `components/visualizer/automaticGlbUpperBlendV490.ts` ist eine pure, begrenzte und
  deterministische Entscheidung für einen **bereits installierten** Oberkörper-/Gestenclip.
  Kandidaten benötigen mindestens zwei sichere Rotationskanäle, davon mindestens
  einen Arm-/Schulterkanal. Genre-Signale (Deutschrap/Hardstyle) beeinflussen die Auswahl.
- `components/visualizer/automaticGlbUpperClipV490.ts` erstellt zur Laufzeit aus dem
  existierenden GLB-Clip eine *Kopie* mit selektierten Oberkörperkanälen. Root Motion,
  Übersetzungen, Skalierung, Becken/Hüfte, Beine, Füße, Hand-/Fingergelenke, Kopf,
  Hals und Gesicht werden vollständig herausgefiltert. Die Originalanimation bleibt intakt.
- `components/visualizer/ThreeAvatar.tsx` hängt diese isolierte Animation an den
  **bestehenden** `useAnimations`-Mixer. Der primäre Hock-/Knieclip behält volle
  Kontrolle über die Beine; die Oberkörperanimation wird mit bis zu 32 %
  Mischgewicht überlagert und innerhalb der R3F-Render-Schleife sanft geglättet.
  Die zusätzliche Ebene wird nie als selbstständiger Dance-Clip angeboten.

## Aktivierungsbedingungen und Schutzregeln

Der automatische Layer wird **nur** verwendet, wenn die V481/V489-Gruppenregie
bei einem importierten GLB-Avatar einen *real vorhandenen* Squat-/Crouch-/Kneel-Clip
abspielt und zusätzlich ein geeigneter Gestenclip installiert ist. Für normale
Tanzclips, fehlende Clip-Daten und nicht unterstützte Knochenzuordnungen gilt
unveränderte V489-Wiedergabe. Timeline, Library-Priorität, manuelle Choreografie,
Animation-Loops, Rap Live Editor, manueller Blend, explizite Gruppenclips und
manueller Override haben Vorrang. Bei Pause, Reduced Motion und niedriger
Grafikqualität ist der automatische Layer deaktiviert.

Fußanker werden nicht überschrieben; das bestehende Foot-IK-System korrigiert
weiterhin die Fußstellung. Ein bereits aktiv gemessener stabiler Fußkontakt
vermindert das Oberkörper-Mischgewicht. Es gibt keine neuen Netzwerkrequests,
keinen neuen AnimationMixer, keine per-Frame-React-Updates und keine neue 3D-Szene.
**Die sichtbare Qualität und die anatomische Plausibilität müssen pro GLB-Rig
geprüft werden.** Die automatisch erkannte Clip-Bezeichnung kann insbesondere
bei ungewöhnlich benannten GLB-Clips zu konservativ sein (Layer dann aus).

## Prüfungen

```powershell
npm install
npm run test:v490
npm run test:v490:types
npm run check:architecture
npm run build
```

Die Offline-Tests prüfen u. a. Bone-Masking, geeignete/unzulässige Quellen,
Genre-Signal, Bodenkontakt, automatische/manuelle Prioritäten, Grenzwerte und
Langzeitsimulation. Ohne vollständige npm-Abhängigkeiten ist keine Aussage über
den vollständigen Next.js-Produktions-Build möglich.
