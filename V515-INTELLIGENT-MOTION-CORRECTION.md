# V515 – Intelligent Motion Correction

## Ziel und Geltungsbereich

In der laufenden **GLB-Show** begrenzt V515 automatisch übermäßig schnelle Änderungen des von V472/V474 erzeugten **additiven Rap- und Vocal-Akzents**. Konkret betrifft das die kleineren Werte für Kopf-/Spine-, Brust-/Chest- und Oberarmgesten sowie ihre Links-/Rechtsverteilung. Das ist eine Laufzeitkorrektur dieses *zusätzlichen* Bewegungsanteils, nicht die Bearbeitung von Animation-Clips oder ein Eingriff in deren Trackdaten.

## Live-Korrektur (automatisch, konservativ)

- `components/visualizer/intelligentMotionCorrectionV515.ts`: reine Begrenzungsfunktion mit höchstens 0,12 rad Zusatzamplitude; maximale Änderungsraten und Beschleunigungen je Kanal (Head/Chest 0,26 rad/s, Arms 0,35 rad/s). Side ist ein dimensionsloses Pan-Gewicht.
- `components/visualizer/useGltfVocalMotionV492.ts`: Aufruf **innerhalb des vorhandenen useFrame** kurz vor `useAudioMotionEngine.updateMotion`. Keine Änderung an Beat-Analyzer, Song-Timestamps oder Sängerzuweisung.
- Ein eigener ref-Zustand pro Avatar wird bei GLB-Modell- und Trackwechsel zurückgesetzt. Bei Pause, Reduced Motion, deaktivierten Zusatzbewegungen, nicht aktivem Vocal-Cue sowie fehlerhafter Delta-Zeit greift kein geglättetes Zusatzsignal.
- **Manuelle Choreografien behalten absoluten Vorrang**: Wenn `avatarMotionMode === 'choreography'`, wird der V472-Ausgang unverändert weitergegeben. Originale GLB-Clips, Retargeting, Hände, Root-Position, Fuß-IK und Lippenform werden nie durch V515 überschrieben.

## Vorschau: Korrekturhinweise statt erfundener Mesh-Reparatur

Das vorhandene `V514`-Qualitätsstudio zeigt in jeder Auffälligkeitszeile passende Prüfpunkte an:

- Gelenkwinkel: Retargeting / beabsichtigte Pose überprüfen.
- Bewegungsruck: Masken-/Blend-Übergang überprüfen; der automatische Zusatzgestenkanal wird bereits geglättet.
- Fußverschiebung: bestätigten Bodenkontakt und Foot-IK-Kalibrierung prüfen. **Keine** automatischen Fußtranslationen aus bloßer Bone-Nähe zum Boden.
- Körperneigung: Balance, Rig-Proportionen und die Motion selbst prüfen.

Die 3D-Vorschau spielt weiter **unkorrigierte Original-GLB-Clips** ab; sie ist kein Echtzeit-Nachbau der korrigierten Live-Vocal-Zusatzgesten. Die Timeline speichert nichts persistent und verwendet dieselben V513-Kapselmessungen und V514-Limits. Keine neue WebGL-Szene oder dependency.

## Überprüfung und Grenzen

`npm run test:v515` simuliert 30.000 wechselnde Framezeiten, abrupte Zielwechsel, Sängerrollen, Grenzwerte, Pause, manuellen Choreografie-Vorrang, Track-/Model-Reset und V514-Diagnosehinweise. `npm run test:v515:types` prüft den Rechenkern isoliert. Die existierenden Versions-, GLB- und Architekturtests bleiben Teil von `build:preflight`.

**Noch nicht implementiert:** ein echter IK-gestützter Fußrutsch-Reparatur-Solver, automatische Entfernung von Kollisionen oder Korrekturen importierter GLB-Motion-Clips. Ein vollständiger Next.js-Build und eine optische Verifikation auf echter Pi-/GLB-Hardware sind zusätzlich lokal nötig.
