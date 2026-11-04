# V563 – Prüfung (25.10.2026)

**Basis:** vollständiges V562-Quellarchiv (`0.1.0-v562`), keine Auslassung alter Module. **Neuer Stand:** `0.1.0-v563`.

## Bestätigt

- `npm run verify:v563`: erfolgreich – **43 neue V563-Fälle**, gezielte TypeScript-Prüfung, V562–V554 Regressionen mit ihren jeweiligen gezielten TypeScript-Prüfungen sowie vollständiger Syntax-/Architekturprüfung.
- `npm run test:v551`: erfolgreich – 12.150 Bühnenlichtfälle; manuelle Rollen und Blackouts geschützt.
- `npm run test:v552`: erfolgreich – 43.200 deterministische Pi-/Renderbudget-Fälle.
- `npm run test:v553`: erfolgreich – Freigabenachweis- und Benchmark-Grenzen.
- `npm run test:v383` und `npm run test:v424`: erfolgreich – Gesichts-/Morph-Profile und Geometrie-Kalibrierung.
- Aktualisierung des älteren V559-Quell-Regressionsausdrucks zur bedingten Ausblendung der Silhouetten, wenn V563 echte Duett-GLBs rendert. **Nicht** als Änderung der V559-Live-Stage oder ihrer Lichter zu interpretieren.
- Quellarchitektur `ARCHITECTURE.md`: **V563**, neue technische Pfade vorhanden. ZIP-Integritätsprüfung durchgeführt.

## Grenzen und noch ausstehende Validierungen

Die Umgebung enthält **keine installierten Next.js/React/R3F-Projektabhängigkeiten**, weshalb der vollständige `tsc --noEmit`-Anwendungscheck und `npm run build` **nicht** ausgeführt bzw. als bestanden behauptet werden. Die Kernalgorithmen besitzen aber den gezielten `test:v563:types`-Check und die Syntaxprüfung der gesamten TS-/TSX-Quelle.

Die zwei echten GLBs wurden hier **nicht als Browser-WebGL-Szene visuell gerendert**. Eingeschränkte GLB-Modelle können weder Kiefer- noch Lippen-Morphs besitzen; sie bleiben bei fehlendem Rig ohne Lip-Sync. Es gab **keinen** Raspberry-Pi-/10-Zoll-/Langzeittest. Die V563-Demo-Sängerwechsel sind explizite Simulationen, keine Singer Identification.
