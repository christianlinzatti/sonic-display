# V757 – Vocal & Body Synchronization 3.0

Auf Basis von V756. Der reine, deterministische V757-Director in `components/visualizer/vocalBodySyncV757.ts` wird in `gltfVocalPerformanceV492.ts` **nach V746 und vor dem einzigen V371-Rig-Overlay** ausgeführt. Kein neuer `useFrame`, keine Bone-Reset-Logik.

## Funktion

- Nutzt V756/V496/V385/V416 bestätigte Rollen über V746: der V745-Tanz-Lead ist keine Gesangsrolle.
- Prüft echte Wort-Zeitstempel gegen die aktuell aufgelöste Wortkennung; keine Silben- oder Phonem-Erfindung.
- Nutzt vorhandene Mundaktivität *ausschließlich als Gate* für kleine additive Kopf-, Brust- und Armakzente. Mund-/Face-Morphs bleiben vollständig bei den alten Pipelines.
- Einstellbare Gesamtstärke, Kopf, Gestik und Dämpfung schneller Rap-Wörter.
- Respektiert Pausen, reduzierte Bewegung, manuelle Choreografie, GLB-Clips, Sängerrollen und fehlende Wort-Timings.
- V371 glättet das kombinierte Rig-Signal; keine Eingriffe in Root, Becken, Fuß-IK, Audioanalyse oder AnimationMixer.

## Prüfung

`npm run verify:v757:static`, `npm run typecheck`, `npm run build`. Der echte Next.js-Build und Sichttest auf GLB sind separat erforderlich. Fehlende npm-Abhängigkeiten machen einen vollständigen Produktionsstatus unmöglich.

- Der V750-Qualitätsfaktor (`qualityVocalGainV750`) wird auf V757-Akzente angewendet, damit adaptive Qualität nicht umgangen wird.
- Keine Silbengenauigkeit ohne verifizierte Wortzeiten; Gesichtsanimation bleibt von dieser Version unangetastet.
