# V159 – Intelligent Partner Motion Synchronization

- Ein gemeinsamer BPM-basierter Phasentakt steuert Gesten beider Avatar-Instanzen.
- Optionale erkannte Phrasenposition wird ab Confidence 0,75 durch eine begrenzte Phase-Locked-Loop-Korrektur berücksichtigt.
- Duett: Der zweite Avatar antwortet mit einem festen Versatz von einer Achtel-Phrase. Synchron- und Spiegelmodus verwenden denselben Phasenanker.
- Partner-Handkontakt wird während passender gemeinsamer Phasen stärker gewichtet und bei Pause/Solo/Reduced Motion zurückgesetzt.
- Die originale Animationsmixer-Clipzeit wird **nicht** verändert. Dies ist eine Synchronisierung additiver Gesten und Partnerkontaktgewichte, keine bildgenaue GLB-Clip-Synchronisierung.
- Bestehende V158-Funktionen, IK-Ketten und LOD bleiben unangetastet.

## Test
`npm run test:partner-sync && npm run verify:offline && npm run build`
