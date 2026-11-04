# Sonic Display V612 – Expressive Vocal & Facial Performance 7.0

## Schwerpunkt

Dezente ausdrucksstarke Gesichts- und Mundanimation für schnell getakteten Deutschrap **nur dort, wo ein vorhandenes synchronisiertes Wort tatsächlich belegt ist**. Es werden weder neue Phoneme/Silben erkannt noch Sänger oder Emotionen aus Lyrics erfunden.

## Implementierung

- `components/visualizer/expressiveVocalFaceV612.ts`: Pure, frameunabhängige Planung je bekanntem Wort und Sängerrolle; konservative (max. 0,012) Vokalform-Verfeinerung, kleine Brauen-, Wangen- und Squint-Akzente, maximal +4,5 % Kiefer-Attacke. Keine sekundäre Takt- oder Phonemuhr, keine CPU-/GPU-Ressourcenallokation.
- `components/visualizer/VocalRigV368.tsx`: Gleiche `useFrame`-Schleife und der bestehende echte Morph-Binding-/Jaw-Bone-Pfad. V612 folgt der bisherigen V546/V597/V581-Logik; kleine zusätzliche Head-Bone-Offsets nur bei belegtem aktivem V581-Wort und gescanntem Kopf-Bone. Der kombinierte Kopf-Overlaywinkel wird auf ±0,030 rad gedeckelt. Mixer-Keyframes behalten dank V581-Deltaabzug Vorrang.
- `components/visualizer/ProceduralDancerAvatarV492.tsx`: Die vorhandene Gesichtsanzeige nutzt V612 zusätzlich zur V597-Mundkurve. Keine zusätzlichen Frame-Callbacks oder Regler.
- Vorhandene V562-Kalibrierung wird **nach** V612 ausgeführt. Lippenverschluss (B/P/M), Smile, Blink, Keyframes, V420-Edits und V423-Audio-Munddaten bleiben unter Schutz. Wortpausen und Trackwechsel können keine alten V612-Cues halten.
- `tests/v612-expressive-vocal-facial-performance-regression.cjs` prüft Legitimations-/Sicherheitsfälle und 25.000 simulierte Sample-Zeitpunkte; `tests/tsconfig.v612-core.json` isoliert die TypeScript-Planertypen.

## Testen

```bash
npm run test:v612
npm run test:v612:types
npm run test:smoke:v612
npm run verify:v612
```

Bei vorhandenen Dependencies zusätzlich `npm run build`. Anschließend denselben verifizierten Deutschrap-Song mit demselben echten GLB-Rig in der V592-Preview vor/nach V612 vergleichen: Lippenverschluss, Wortübergänge, Kopfruhe, Mimik, FPS und richtige Duettrollen. **Eine optische Verbesserung und echte Silbengenauigkeit sind durch Offline-Tests allein nicht nachgewiesen.**
