# V758 – Natural Dance Motion 4.0

Basis: V757. Diese Version ergänzt die bestehenden Bewegungen **vorsichtig**, statt neue Tänze, eine zweite Foot-IK oder ein neues GLB-Rig zu erzeugen.

## Was ist tatsächlich umgesetzt?

- Neuer reiner, streng typisierter Controller `components/visualizer/naturalDanceMotionV758.ts`.
- Nutzt die **vorhandene und bereits überblendete** Hüft-/Bassbewegung (V738, V743) und Gegenbewegungen (V740). Es wird **kein Beat erfunden**.
- Bei **bekanntem einseitigem Fußkontakt** bekommt das Becken einen kleinen, begrenzten Roll-Akzent zur Standseite. Schultern, Brust und Arme reagieren dezent gegenläufig; das jeweils als *planted* erkannte Bein/Knöchelgelenk wird **nicht zusätzlich bewegt**.
- Laufende Standbeinwechsel werden zeitbasiert geglättet. Pause, manuelle Priorität, reduzierte Bewegung, Trackwechsel und große Seek-Sprünge setzen den Verlauf zurück.
- Kein neuer Root-Offset, kein zusätzlicher Eingriff in die Hüfthöhe oder seitliche Translation und keine neue GPU-Last. Bestehende GLB-Clips, manuelle Timelines, Vocal-Overlays und das vorhandene **abschließende Foot-IK** bleiben autoritativ.
- Die Logik ist im Live-GLB-Renderer `GltfDancerAvatarV492.tsx` und in der realen GLB-Vorschau `AvatarEditor.tsx` integriert.
- `avatarNaturalDanceV758` wird in den persistenten UI-Einstellungen gespeichert und kann in `SettingsPanel.tsx` aktiviert, feinjustiert und zurückgesetzt werden.
- Der V750-Qualitätsfaktor reduziert die Stärke der Live-Zusatzeffekte ebenfalls.

## Einstellungen

Unter **Avatar & Tanz → Natural Dance Motion 4.0 V758**:

| Einstellung | Standard | Wirkung |
|---|---:|---|
| Aktiviert | ja | Schaltet die additive Verfeinerung ein/aus |
| Gesamtstärke | 65 % | Obergrenze der neuen Bewegung |
| Gewichtsverlagerung | 75 % | Kleine, kontaktbasierte Beckenneigung |
| Oberkörper & Arme | 65 % | Gegenbewegung der Brust und Arme |
| Weiche Übergänge | 70 % | Geschwindigkeit der Kontakt-/Balanceanpassung |

**Einschränkungen:** Erkanntes Standbein basiert auf dem vorhandenen Fußkontaktstatus und stellt **keine physikalische Kraft- oder Schwerpunktmessung** dar. Bei unbekanntem Kontakt werden einseitige Akzente unterdrückt. Diese Version baut weder neue knöcherne Animationen in GLB-Assets ein, noch korrigiert sie sämtliche möglichen Ursachen von Foot-Sliding. Die visuelle Wirkung muss mit echten Modellen und Clips getestet werden.

## Testen

```bash
npm run test:v758
npm run test:v758:types
npm run verify:v758:static
npm ci
npm run typecheck
npm run build
```

Die CI auf Ubuntu und Windows startet nach erfolgreicher `npm ci` die neue statische Prüfung sowie den echten Projekt-Typcheck und Next.js-Build. Ohne installierte Dependencies können diese beiden letzten Prüfungen nicht als bestanden betrachtet werden. Siehe `V758-VERIFICATION.md`.
