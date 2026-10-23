# Sonic Display V489 – Natural GLB Full-Body Motion

**Basis:** V488 · **Version:** `0.1.0-v489` · **Datum:** 23.10.2026

## Änderungen

- `components/visualizer/naturalGlbFullBodyMotionV489.ts`: Kleine, rein funktionale
  automatische Übergangsplanung für bereits vorhandene GLB-Squat/Crouch/Kneel-Clips.
  Bei belegtem Fußkontakt darf die Überblendung länger ausfallen. Crossfades sind
  hart begrenzt und auf kurze eingehende Clips abgestimmt. Unzuverlässige
  Motion-Matches springen nicht willkürlich mitten in einen Knieclip; in diesem
  Fall beginnt er am Anfang. Für reguläre Tanzclips bleibt die alte Regel bestehen.
- `components/visualizer/ThreeAvatar.tsx`: Bindet die Planung in die bestehende
  `useAnimations`/`AnimationAction.fadeIn`-Kette ein. Der bestehende V311-Plan
  und V232-Pose-Match werden nur bei einem automatischen Low-Clip-Wechsel gezielt
  verfeinert. Die V482-Clip-Hysterese reduziert weiter hektische Wechsel.
- Die planmäßige Fuß-IK läuft unverändert NACH dem Animationsmixer. Kein direktes
  Schreiben von GLB-Knochen, kein neuer Animationsmixer, keine Netzwerkanfrage.

## Grenzen & Prioritäten

Manuelle Timeline-, Library-, Loop-, Layer- und Choreografiewünsche behalten
Vorrang. Reduced Motion, Pause oder niedrige Qualität deaktivieren die neue
Überblend-Verfeinerung. Bei fehlendem GLB-Hockclip gibt es keine erfundene
Knieanimation. Fußkontakt ist nur eine Näherung; die exakte Wirkung muss mit
konkreten GLB-Rigs geprüft werden. Sänger- und Lyrics-Timings werden nicht erraten.

## Tests

```powershell
npm install
npm run test:v489
npm run test:v489:types
npm run build
```

Die offline-fähigen Tests prüfen verschiedene Fußkontakte, starke/schwache
Pose-Matches, Ausstiege, Clipwechsel, kurze Clips, manuelle Vorrangregeln,
deterministische Langzeitsimulation und die Integration in die vorhandene
Mixer-Fade-In-Kette. In der aktuellen Testumgebung fehlen die installierten
Next.js-/React-Abhängigkeiten für einen vollständigen Produktions-Build.
