# Sonic Display V458 – Natural Dance & Stage Interaction 2.0

## Ziel

Aus den bestehenden automatischen V452-Crew-Akzenten natürlichere, feinere
Interaktionen für zwei bis vier Tänzer machen, ohne importierte Bewegungen oder
manuell gespeicherte Abläufe zu überschreiben. Die neue Schicht ist **keine neue
Tanz-Engine**, sondern ein kleiner deterministischer Verfeinerer für bereits
freigegebene Gruppen-Cues.

## Änderungen

- `components/visualizer/naturalStageInteractionV458.ts` fügt der bestehenden
  V452-Gruppenregie dezente Schulter- und Kopfbewegungen sowie abwechselnde
  Hand-/Antwortgesten hinzu. Hook-Impulse bleiben für alle Mitglieder synchron,
  während bei Rap-Verse die Antwort etwas später als der Lead kommt.
- Die berechneten Akzente basieren auf der vorhandenen Playback-Zeit, vorhandener
  Audio-Energie und Beat-Stärke. Es werden **weder reale Rapperstimmen erkannt**
  noch Beat-/Silbentimings erfunden. Bei schwachen Signalen sind die Akzente
  bewusst unauffällig.
- Gruppenbewegungen behalten ihre bisherigen Aufstellungsabstände: Bei Hook
  erhalten alle Tänzer dieselbe kleine X/Z-Verschiebung; bei engem Abstand
  werden zusätzliche Root-Verschiebungen unterdrückt.
- Bei aktivem Foot Lock/Contact IK bleiben die Bühnen-Roots von neuen
  automatischen Verschiebungen frei. Im Zweiermodus werden ausschließlich die
  bestehenden Blick-/Gesten-Overlays verfeinert, niemals die Kontaktpunkte.
- Die vorhandene Renderqualitätsstufe High/Balanced/Low begrenzt **nur neue
  Mikro-Akzente**. Originale GLB-Clips, Grundanimationen, Kamera,
  Beleuchtung, Lip-Sync und echte Audio-Energie bleiben unverändert.
- Bei Wiedergabestopp, `reducedMotion`, manuellen Tanz-, Formations- oder
  Vocal-Zuordnungen greift die V452-Prioritätsprüfung. Bei einem neuen Cue wird
  der Zusatz sanft eingeblendet; die Funktion benötigt weder zusätzlichen
  Laufzeit-Zustand noch Einstellungen/Netzwerkzugriffe.

## Geänderte Dateien

- `components/visualizer/naturalStageInteractionV458.ts` (neu)
- `components/visualizer/ThreeAvatar.tsx` (Integration in Duo und 3–4 Tänzer)
- `tests/v458-natural-stage-interaction-regression.cjs` (neu)
- `tests/tsconfig.v458-core.json` (neu)
- `tests/v452-advanced-multi-avatar-performance-regression.cjs` (angepasster
  statischer Renderpfad-Check, die V452-Funktionsprüfungen bleiben erhalten)
- `tests/v457-show-continuity-regression.cjs` (versionsoffener Test)
- `package.json`, `README.md`, `V458-VERIFICATION.md`.

## Technische Einschränkungen

Die Bewegungen sind bewusst **kleine prozedurale Akzente**. Sie sind keine
neuen vollständig animierten GLB-Tanzsequenzen, keine Physiksimulation
von echten Gewichtsverlagerungen und kein Ergebnis einer Stimmerkennung.
Das Ergebnis kann je nach importiertem Modell/Morph-Rig unterschiedlich
sichtbar sein. Ein echter WebGL-/Raspberry-Pi-Test mit den installierten GLBs
ist für die visuelle Abnahme erforderlich.

## Prüfung auf dem eigenen Rechner

```powershell
npm install
npm run verify:v458
npm run typecheck
npm run build
npm run dev -- --hostname 127.0.0.1
```

Für den Praxistest: zwei bis vier GLB-Avatare, mehrere Rap-Verse und gemeinsame
Hooks, ein Songwechsel, Pause/Seek, gespeicherte Rollen/Choreografien,
Reduced-Motion-Modus und Low-Qualitätsstufe. Fußkontakt und Gruppenabstand
besonders genau beobachten.
