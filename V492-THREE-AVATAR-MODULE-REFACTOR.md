# Sonic Display V492 – ThreeAvatar Module Refactor

24. Oktober 2026 · Kein neues Feature und kein Versionssprung: `0.1.0-v492`. Grundlage ist **V492 TypeScript Import Hotfix**.

## Ziel

`components/visualizer/ThreeAvatar.tsx` enthielt vor dem Refactoring rund 3.006 Zeilen und 250 kB Quelltext. Der große React-Renderer wurde in sechs Module mit klaren Zuständigkeiten aufgeteilt. Animationen, Render- und Audio-Logik sowie sämtliche Prioriäten bleiben funktional unverändert.

## Neue Module

| Datei | Aufgabe |
| --- | --- |
| `ThreeAvatar.tsx` | Öffentlicher Einstiegspunkt, Canvas, Licht, Kamera, WebGL-Wiederherstellung |
| `ThreeAvatarContextsV492.tsx` | Gemeinsame React-Kontexte und Partner-Overlayfunktionen |
| `ProceduralDancerAvatarV492.tsx` | Prozedurales 3D-Avatar-Rig und Bewegung |
| `GltfDancerAvatarV492.tsx` | GLB-Import/Retargeting, AnimationMixer, Foot-IK und Animation Blending |
| `DanceFormationActorsV492.tsx` | Einzelavatar, Duo und Formationsregie |
| `GroupDancersV326SceneV492.tsx` | Dreier-/Vierergruppen, Cues und Formation |

Die neuen React-Kontexte werden ausschließlich in einem Modul erzeugt, damit Anbieter und Verbraucher dieselbe Identität teilen. Alle Quellmodule stehen weiter unter der Client-Grenze. Die öffentliche `ThreeAvatar`-Komponentensignatur ist unverändert.

## Regressionen

Die 178 bereits vorhandenen source-contract Tests mit Verweisen auf den bisherigen monolithischen `ThreeAvatar.tsx` wurden auf einen kleinen Test-Helfer umgestellt. Er liest bei der Testausführung die tatsächlichen aufgeteilten Dateien; er speichert **keine** Kopie des früheren Monolithen und beeinflusst die App-Laufzeit nicht. Neue Prüfung: `npm run test:three-avatar-split`.

## Vorbehalte

- Dies ist eine reine **Quelltext-Modularisierung**, keine neue Dance Engine.
- `GltfDancerAvatarV492.tsx` enthält weiterhin umfangreiche, miteinander gekoppelte Animationslogik. Weiteres Aufteilen in Hooks sollte erst nach einem bestätigten Produktions-Build mit echten npm-Abhängigkeiten erfolgen.
- Der vom Nutzer gepostete erfolgreiche V492-Build bezieht sich auf den Stand **vor** diesem Refactoring. Ein vollständiger Produktions-Build des modularisierten Standes muss auf dem Windows-Rechner erneut geprüft werden.

## Prüfung auf Windows

```powershell
npm run test:three-avatar-split
npm run test:v492
npm run test:module-case
npm run typecheck
npm run build
```
