# V735 – Hüftbewegungen für humanoide GLB-Avatare

## Neu

- Drei **prozedurale** Tanzbewegungen: `Hip_Sway`, `Hip_Circle`, `Hip_Bounce`.
- Musikalische Automatik mit genre- und phrasenabhängigem Wechsel, beschleunigbar und in der Stärke einstellbar.
- Begrenzter Pelvis-Pitch, Pelvis-Roll und sanfter Translation; gegenläufige Wirbelsäulen-/Beinarbeit.
- Vorsichtige Stabilisierung: Hüfttranslation nur bei vollständig erkannten Bein-Ketten und aktivierter Foot IK; Fußkontakte werden geschont. Vorhandene V492-IK wird danach angewendet.
- Respektiert Songpause, reduzierte Bewegung, manuelle Timelines, Loops, Choreografien und bereits spielende gleichnamige GLB-Clips.
- Avatar-Editor bietet die Bewegungen als Vorschau an, **wenn der ausgewählte GLB sie nicht selbst enthält**.
- Einstellungen: Dance Studio → Hüftbewegungen → Modus, Stärke, Tempo (persistent).

## Explizite Einschränkungen

Dies sind **keine neu exportierten oder offline in das Avatar-v2-GLB gebackenen Animationen**. Die GLB selbst wurde nicht mitgeliefert und deshalb nicht verändert. Vorhandene Autoring-Knochen genügen für die Bewegungs-Overlays. Separate Gesäßknochen, entsprechende Morph-Targets, eigene Hautgewichte und deren animierte Verformung bleiben nicht enthalten.

Die bestehende Laufzeit-Foot-IK wurde eingebunden, aber **Fußstabilität kann ohne echte GLB-/Browser-Sichtung nicht für jeden Rig-Aufbau garantiert werden**. Eine Offline-Bake mit Fußfixierung in die GLB erfordert das konkrete Modell und Rig.

## Dateien

- `components/visualizer/hipDanceV735.ts`: Pose-Mathematik, Grenzen und musiksynchroner Modus.
- `components/visualizer/avatarRigController.ts`: zusätzliche additive Beckenkanäle, auch nach Clip-Reset.
- `components/visualizer/GltfDancerAvatarV492.tsx`: Live-Anbindung vor Foot IK.
- `components/visualizer/AvatarEditor.tsx`: optionale Vorschau.
- `components/SettingsPanel.tsx`, `context/UiPreferencesContext.tsx`, `types/music.ts`: UI und Einstellungen.
- `tests/v735-hip-dance-regression.cjs`: mathematische und Integrationsregressionen.

## Teststatus – 30.10.2026

Bestanden: `test:v735` (mit global installiertem TypeScript als `TYPESCRIPT_PATH`), V665-, V666-, Motion- und Grounding-Regressions, `check:syntax`, `check:architecture`, `test:module-case`.

**Nicht bestanden / nicht verifiziert:** vollständiger `npm run typecheck`, Next.js-Produktionsbuild, visuelle GLB-/IK-Prüfung im Browser. Grund: `npm ci` konnte die notwendigen Abhängigkeiten hier nicht vollständig installieren; das `npm run build` Preflight blockiert korrekt mit *18 npm-Pakete fehlen* (kein erfolgreicher Build behauptet). Auch die von React abhängigen V734-Tests sind deshalb blockiert.

Nach Installation auf dem lokalen Rechner:

```powershell
npm ci
npm run test:v735
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Für die reale Überprüfung bitte einen eigenen GLB-Avatar auswählen, Foot IK aktivieren, die drei Bewegungen im Avatar-Editor testen und speziell beide Füße sowie Knie/Knöchel bei 45 % und 80 % Stärke visuell kontrollieren.
