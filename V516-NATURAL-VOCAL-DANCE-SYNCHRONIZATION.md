# Sonic Display V516 – Natural Vocal & Dance Synchronization (Deutschrap)

## Was sich verbessert

Die automatische Konzertperformance reagiert auf **Deutschrap und andere Rap-Genres** jetzt nicht nur mit isolierten Wortgesten. `components/visualizer/naturalDeutschrapSyncV516.ts` verbindet bestätigte Wortstarts/-enden mit einer langsamen (2,1 Sekunden) Phrasenphase: Beim schnellen Rap werden vor allem Armgesten zurückgenommen, während Kopf und Brust den kontinuierlichen Flow behalten. Ruhigere Hooks erhalten einen etwas stärkeren, aber immer gedeckelten Akzent. Das Verhalten wird zur Wiedergabezeit berechnet und ist beim Scrubben reproduzierbar.

- **GLB-Zusatzgestik**: `components/visualizer/useGltfVocalMotionV492.ts` verwendet V516 **nach V472/V473/V474 und vor V515**. Die bereits bestehende V515-Geschwindigkeits-/Beschleunigungsbegrenzung bleibt aktiv. Nur additive Kopf-/Brust-/Armakzente, keine Animationstracks, Knochen-Transforms, Roots oder IK.
- **GLB Körper-/Gesichtsregie**: `components/visualizer/gltfVocalPerformanceV492.ts` wendet auf vorhandene, nach V510 schon bestätigte Wortrig-Expression eine kleine Phrasendynamik an.
- **Prozedurale Figuren**: `components/visualizer/ProceduralDancerAvatarV492.tsx` erhält dieselbe V510/V516-Phrasenverfeinerung für Kopf, Oberkörper, Arme und dezente Mimik.
- **GLB Gesichts-Rig**: `components/visualizer/VocalRigV368.tsx` glättet nur die kleinen Brow-/Cheek-/Squint-Zusätze aus V510; Lip-Sync und morphbasierte Lippen-/Kieferformen bleiben unter alleiniger Kontrolle von V415/V420/V423 und der bestehenden Vocal-Pipeline.

## Evidence, Rollen, Schutzmaßnahmen

- **Keine erfundenen Silben-/Punchline-/Rhyme-/Beat-Timestamps**: V516 verwendet nur echte Wort-Timestamps aus synchronisierten Lyrics. Falls diese fehlen, wird kein neues V516-Signal erzeugt. Geringe Textindikatoren aus älteren Versionen sind ausdrücklich keine Audio-Stresserkennung.
- **Keine automatische Stimmenerkennung**: In einem Feature-Track mit mehreren Avataren wird ein zusätzlicher V516-GLB-Gestenrefiner nur bei aktuell gültiger, manuell erstellter Sängerzuweisung aktiviert. Der V510-Pfad behält seine eigenen, strengeren Autorisierungen einschließlich V496-Segmenten.
- **Höchste Priorität für manuelle Motion**: Choreography, Pause, Reduced Motion, falsche Track-ID, fehlende verifizierte Wörter oder nicht singende Rollen sperren zusätzliche V516-Gesten. Die Funktion ändert keinerlei importierte GLB-Clips, Fußkontakt, Handkontakte, Camera-Vorgaben oder die Mundbewegung.
- **Performance**: Reine Zeit-/Wortprüfung mit konstant wenigen Nachbarwörtern pro bestehendem Renderframe; kein zweiter Frame-Loop, Timer, Worker, zusätzlicher Render-Kontext, persistente Daten oder npm-Abhängigkeiten.

## Test und verbleibende Grenzen

`npm run test:v516` überprüft 32.000 simulierte Frames, kurze/schnelle vs. ruhige Wortfolgen, Hooks, Duette, manuelle Sängerrollen, Pausen, Choreography-Sperren, Wortlücken, ungültige Timestamps, lip-sichere Composition und drei reale Renderpfade. `npm run test:v516:types` prüft den Kern isoliert. Die historischen Regressionstests und V492-Modultests bleiben Teil von `build:preflight`.

**Keine Garantie für visuelle oder auditive Lippen-Synchronität** ohne echten Spotify-Track/GLB-Test; keine automatische Rap-Reim-/Stresserkennung; keine echte Audio-Phonem-Analyse und keine Änderung importierter Bewegungen. Ein vollständiges `npm install && npm run build` sowie Praxistests auf dem Raspberry Pi sind lokal auszuführen, solange die Projektabhängigkeiten in der Build-Umgebung fehlen.
