# V617 – Advanced Vocal & Facial Realism

**Basis:** V616 – Natural Multi-Performer Interaction. **Datum:** 27.10.2026.

## Ziel und tatsächliche Umsetzung

- Pure, reproduzierbare `refineVocalFacialRealismV617`-Funktion für überprüfte synchronisierte Deutschrap-Wortgrenzen. Kein weiterer Three.js-Renderer, kein neuer `useFrame`, kein Timer, kein Modell-Download.
- Bestehende Kiefer- und Vokalziele werden **nicht** synthetisch verändert; bei kurzen verbundenen Wörtern ist ausschließlich die Attack-/Release-Rate etwas natürlicher. Übergänge beginnen und enden über glatte Wortfenster; keine Lippenöffnung aus geschriebenen Phonemen.
- V384/B/P/M-Verschlüsse, V420-Korrekturen, V423-Audiomundsteuerung, V562-Kalibrierung, V383-Morphvorschau, manuell autorisierte Vocals, Low-Tier, Pausen und Reduced Motion bleiben maßgeblich.
- Dezente Augenbrauen-/Wangen-/Squint-Akzente (je ≤0,009). Die V581-/V574-Kopfdrehungen und Augenblickrichtung dürfen höchstens um ±0,004 bzw. ±0,003 rad verstärkt werden, **nur** wenn das echte getimte Wort dem bereits bestätigten Cue entspricht; kein erfundener Blickkontakt.
- GLB: `VocalRigV368.tsx` hinter V612, vor der vorhandenen V562-Kalibrierung; reale gescannte Bones, altes Overlay-Release und Rotation-Clamps weiterverwendet. Prozedural: `ProceduralDancerAvatarV492.tsx` mit bereits vorhandenem Mund/Mimikcontroller.
- Ein Track-/Zeit-/Sängerwechsel hat keinen Zustandsüberhang; die neue Stufe selbst ist zustandslos.

## Validierung

```powershell
npm run test:v617
npm run test:v617:types
npm run test:smoke:v617
npx tsc --noEmit
npm run build
```

Der automatische Regressionstest prüft nachweisgebundene Aktivierung, editierte Wörter, 16.000 gebundene Facial-Frames, fehlende Rig-Kanäle, Mundverschluss/Blink/Smile-Eigentümerschaft, optionale GLB-Kopfbones, sowie V612-/V616-Integration. Ein vollständig grüner Build oder schönere Animationsqualität sind erst nach lokaler Prüfung nachgewiesen. Tests mit deinen GLBs und dem Browser gehören zur visuellen Abnahme.
