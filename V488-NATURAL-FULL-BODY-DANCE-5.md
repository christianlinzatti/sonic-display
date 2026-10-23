# Sonic Display V488 – Natural Full-Body Dance 5.0

**Basis:** V487. **Version:** `0.1.0-v488`. **Datum:** 23.10.2026.

## Umsetzung

- `components/visualizer/naturalFullBodyDanceV488.ts`: kleiner, rein funktionaler Planner. Kombiniert die bereits geglättete V482-Hocktiefe mit dem durch V486 begrenzten, musikzeitgesteuerten Fußhub. Er erzeugt sparsame, symmetrisch begrenzte **visuelle** Hüft-/Oberkörpergewichtsverschiebung, Torso-Neigung, entgegengesetzten Armschwung, geringe Knie-Fußschwunganpassung und Blickkompensation. Die Rap- und Hardstyle-Genreinformationen regeln nur die Stärke kleiner Akzente und behaupten keine erkannten Punchlines oder Sänger-Timestamps.
- `components/visualizer/ThreeAvatar.tsx`: verwendet die Daten in **ProceduralAvatar** mit dem vorhandenen `useFrame` und denselben Mesh-/Gelenk-Refs. Die Knieerweiterung ist ausschließlich während eines V486-Schritts aktiv und verschwindet in tiefer Hocke, damit der V481/V482-Fußsohlenabstand nicht durch zusätzliche Kniebeugung beschädigt wird. Keine neue Szene, weitere Geometrie, Render-Schleife oder zusätzlichen Animationsmixer.
- Die bisher bei jeder Renderiteration aufaddierte V482-Oberkörper-Seitenneigung wird jetzt **gegen ein Ziel geglättet**. Dadurch kann sie sich bei langen Sessions nicht unkontrolliert aufsummieren. Der Kopfneigungsausgleich verwendet ebenfalls ein Ziel statt eines ungebremsten `+=`.
- V487-Fußkontakt-Studio und alle importierten GLB-Clips bleiben **unverändert**; V488 ist keine generelle GLB-Motion-Retargeting-Lösung.

## Kompatibilitätskorrektur

Die V487-UI-Datei wurde von `GroundContactStudioV487.tsx` nach `GroundContactPanelV487.tsx` umbenannt, damit sie unter Windows nicht mehr mit `groundContactStudioV487.ts` kollidiert (Case-insensitive Dateisysteme). Component-Name und UI-Verhalten bleiben unverändert; die V404-Modulprüfung deckt den Fehler ab.

## Priorität & Einschränkungen

Nur automatische Mehrfach-Avatar-Show und gültige Track-ID; bei Pause, Reduced Motion, manueller Choreografie, Tier `low` oder fehlender Gruppe ist die Zusatzbewegung neutral. Die neue Schicht bewegt keine Bühnenwurzel und manipuliert keine Foot-IK-Anker. Eine exakte physikalische Simulation der Schwerpunktverlagerung bzw. ein universelles Reparieren des GLB-Fußrutschens ist **nicht** implementiert. Für die reale Bühnenqualität sind Visualtests auf Windows/GLB sowie Raspberry Pi weiterhin nötig.

## Prüfung

```powershell
npm install
npm run test:v488
npm run test:v488:types
npm run build
```

Die Tests prüfen deterministische Songzeit, Schwellwerte, Bein-/Kniegrenzen, neutralen Fallback, Genrevarianten, Rig-Wiring, fehlende neue Loops und simulierte Langzeitwerte. Ein vollständiger Next.js-Build setzt lokale npm-Abhängigkeiten voraus.
