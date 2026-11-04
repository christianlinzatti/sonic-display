# Sonic Display V485 – Natural Dance Motion Studio 5.0

**Basis:** V484. **Paket:** `0.1.0-v485`. **Datum:** 23.10.2026.

## Änderungen

- Neue reine, deterministische Bewegungsplanung in `components/visualizer/naturalDanceMotionStudioV485.ts`. In der automatischen Dreier-/Vierergruppe können **stehende Figuren an einem hockenden Bühnenpartner vorbeitanzen**: ein kleiner seitlicher Versatz (maximal **10,5 cm**) und ein Wechsel auf die Vordergrund-Ebene (maximal **20 cm**), gefolgt vom sanften Zurückkehren auf den ursprünglichen Slot.
- Solange die ganze Gruppe tief ist, bewegen sich die Bühnen-Roots **nicht**; kleine bestehende Körpergesten können den gemeinsamen Drop begleiten.
- Im prozeduralen Renderer bewegen sich zusätzlich die schon vorhandenen Oberschenkel-/Kniegelenke des aufrecht tanzenden Avatars als *reduzierte* Schrittbewegung. Die Hock-IK der anderen Tänzer bleibt unverändert. Importierte GLB-Modelle verwenden weiterhin ihre tatsächlich vorhandenen Motion-Clips; es erfolgt keine unsichere automatische Retargeting-Operation.
- `components/visualizer/ThreeAvatar.tsx` integriert die V485-Planung **nach** V481/V483/V484 in das vorhandene Frame-System; die echten Bühnenpositionen werden sanft an die begrenzten Ziele herangeführt, keine neue Render- oder Audio-Schleife.

## Grenzen und Sicherheit

- V485 **überholt keine Figuren durch Mesh-Kollisionen**. „Vorbeitanzen“ meint eine sichtbare Vordergrund-/Seitwärtsbewegung ohne Slot-Tausch. Stage-Root-Abstände werden auf mindestens **1,03 m** geprüft. Das ist **keine** echte GLB-Ganzkörper- oder Fußkollisionsprüfung.
- Bei manuellen Choreografien, echten Sängerzuordnungen, Foot-/Contact-IK-Lock, nichtautomatischen Bühnen, Pause, `reducedMotion`, schützender Lyrics-Vordergrunddarstellung oder niedriger Grafikqualität werden die Extras unterdrückt.
- Die Bewegung benötigt vorhandene Song-/Cue- und Beat-/Kick-/Energiewerte, behauptet keine sichere Punchline-, Musiker- oder Drop-Erkennung und erzeugt keine eigenen Zeitstempel.
- Die Stage-Root-Versätze können je nach importiertem GLB und vorhandenem Clip sichtbares Fußgleiten erzeugen. Eine Gerätemessung und visuelle Prüfung der konkreten Modelle sind weiterhin erforderlich.

## Tests

```powershell
npm install
npm run test:v485
npm run test:v485:types
npm run build
```

Die gezielten Tests prüfen Ein- und Ausblendungen, Bühnenabstand, Rap-/Drop-Gruppenbilder, manuelle/IK-/Lyrics-Schutzregeln, Qualitätsstufen, Seek-Determinismus und simulierte Wiedergabe über 33 Minuten. Vollständiger Next.js-Build benötigt installierte Abhängigkeiten.
