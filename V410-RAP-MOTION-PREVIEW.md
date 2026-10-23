# Sonic Display V410 – Rap Performance Editor mit Tanz-Motions

Basis: V409; alle bisherigen Funktionen bleiben erhalten.

## Neu

- Im Anzeige-Einstellungsdialog zeigt die V410-Vorschau echte GLB-/GLTF-Avatare mit **eingebetteten Animationen**, einer optional **am Avatar konfigurierten aktiven Motion** und **installierten Charakter-Motions** aus dem bestehenden lokalen Store (`sonic.character.motion.library.v190`). Es wird keine separate Installation benötigt.
- Die Motion-Auswahl ist auf den gewählten Avatar beschränkt. Die Auswahl im Editor verändert weder die Live-Avatar-Auswahl noch die aktuell laufende Show-Motion.
- Ein eigener Three.js `AnimationMixer` läuft ausschließlich auf einem per `SkeletonUtils.clone` geklonten Skinned-Mesh. Die erste Animation eines externen GLB-/GLTF-Motion-Pakets wird per existierendem `retargetHumanoidClips` samt gespeicherter Rig-Kalibrierung übertragen. Eingebettete Avatar-Clips werden direkt auf dem zugehörigen Klon abgespielt.
- Aus dem V405–V409-Editor kommen weiterhin begrenzte, simulierte Kopf-/Körper-/Arm- und Mundakzente. Rap-Gesten werden auf die jeweils **frisch berechnete Pose** gelegt; vorherige Offsets werden vor jedem Mixer-Update rückgängig gemacht, damit sie sich nicht akkumulieren.
- Mit **Motion-Tempo** sind Wiedergabegeschwindigkeiten zwischen 0,5× und 1,5× möglich. Pause und Reduce Motion setzen das Animationsdelta auf null. Eine Statusmeldung zeigt Clipname, Laufzeit bzw. erkannte Retargeting-Tracks. Defekte, unerreichbare oder inkompatible Motions verändern die Avatar-Vorschau nicht und liefern einen erklärenden Status.
- Import- und Case-Prüfung, Prebuild-Checks sowie Windows-/Linux-CI wurden fortgeführt.

## Bedienung

1. **Einstellungen → Anzeige → V410 Rap Performance Editor** öffnen.
2. Bei **Vorschau-Avatar** einen installierten GLB-/GLTF-Charakter auswählen.
3. Unter **Vorschau-Motion** den gewünschten eingebetteten Clip, die aktive Motion oder eine installierte Motion wählen. `Keine · nur Rap-Gesten` bleibt möglich.
4. **Motion-Tempo**, **Verse/Hook** und die sieben Performance-Regler ausprobieren. **Pause/Abspielen** hält die Vorschau an bzw. setzt sie fort.
5. Die optional gespeicherten Reglerwerte lassen sich mit **Editor-Werte auf die Live-Show anwenden** aktivieren. Die Vorschau-Motion selbst wird **nicht** als Live-Motion gespeichert.

## Grenzen

- Das ist eine **visuelle Testvorschau**, keine echte Audio-Phonemerkennung und keine Spotify-Drum-Analyse. Kick-/Snare-/Rap-Wortakzente werden im Editor simuliert.
- Für externe Animationsdateien wird derzeit **der erste kompatibel retargetete Clip** abgespielt; bereits im Avatar enthaltene Clips sind einzeln auswählbar. Fehlende/abweichende Bone-Namen begrenzen das Retargeting. Reine Positions-, Scale- oder nicht-humanoide Animationsspuren werden beim externen Retargeting bewusst nicht ungeprüft übernommen.
- Ohne Jaw-Bone oder Mouth-Morph wird der Mund nicht animiert. Browser/CORS und defekte oder fehlende externe GLB-Dateien können das Laden verhindern.
- Die Vorschau ist eine eigene Instanz des Modells. Der Live-Show-Animator, die laufende Choreografie und die gespeicherte Motion-Bibliothek bleiben unberührt.

## Verifikation

`npm run test:v410`, `npm run test:v409`, `npm run test:v404`, `npm run test:imports`, `npm run test:module-case`, `npm run check:syntax` sowie der restliche Offline-Testlauf. Für den vollständigen TypeScript- und Next.js-Produktions-Build auf Windows: `npm install` und `npm run verify`.
