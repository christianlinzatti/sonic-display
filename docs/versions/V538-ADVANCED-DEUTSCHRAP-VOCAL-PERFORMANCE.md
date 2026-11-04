# V538 – Advanced Deutschrap Vocal Performance

## Änderungen

- GLB-Gesichtsrig und prozedurale Avatare nutzen denselben **deterministischen Wort-Cue** nach V523/V526/V503/V510.
- Nur tatsächlich vorhandene, synchronisierte **Wort-Zeitmarken** können ein leichtes artikulatorisches Mund- und Gesichts-Polishing auslösen. Bei fehlenden Wortmarken, Pausen, Seeks ohne passenden Treffer und ausgeschaltetem Lip-Sync keine künstlichen Stimmen.
- Gesichtsanimation nutzt vorhandene Morph-Targets/Jaw-Bone: `jaw`, `wide`, `round`, `cheek`, `brow`, `squint`. Blinzeln, Lächeln und bilabialer Verschluss werden nicht überschrieben.
- Manueller V420-Mund-Edit oder aktives V423-Audio-Mundprofil hat Vorrang; handgesteuerte Animations-/V383-Vorschau bleibt unverändert.
- In Duetten dürfen nur zugeordnete Lead-/Feature-Avatare Wortgesten bekommen. Die Gesten passieren weiterhin die bestehende V515-Glättung.
- Langsame (~2,2s) Ausdruckswelle statt zusätzlichem Zittern auf jedem Rap-Silbenimpuls.
- Keine GLB-Änderung, keine weiteren Shader/AnimationMixer, keine neue Render-Schleife.

## Einordnung

**Textbasierte visuelle Heuristik**, kein Audio-Phonem-Alignment, keine echte Emotionserkennung und keine Sprechertrennung. Die neuen Änderungen sind klein, absichtlich konservativ und bei editierter/Audio-Vocals-Mundsteuerung ausgeschaltet.

## Validierung

`npm run test:v538`

`npm run test:v538:types`

`npm run test:v537 && npm run test:v537:types` sowie ältere Regressionen

`npm run build` mit installierten Abhängigkeiten lokal und visuelle Prüfung auf Raspberry Pi empfohlen.
