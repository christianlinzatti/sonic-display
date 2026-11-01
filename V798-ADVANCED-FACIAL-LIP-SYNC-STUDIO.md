# V798 – Advanced Facial & Lip-Sync Studio

**Basis:** Sonic Display V797. **Ziel:** Lippenbewegungen für bereits bestätigte Deutschrap-Wörter schneller und gezielter abbilden, ohne eine nicht vorhandene Phonemerkennung oder fehlende Avatar-Rigs vorzutäuschen.

## Neuer Funktionsumfang

- `components/visualizer/advancedFacialStudioV798.ts` bietet einen reinen, getesteten **Rig-Readiness-Inspector** für Kiefer, breite Lippen, runde Lippen und M/B/P-Lippenschluss. Er berücksichtigt gültige manuelle Zuordnungen, deaktivierte Kanäle, fehlende oder veraltete Morph-Namen, auf 0 gesetzte Kanal-Intensitäten, konkurrierende Kanalzuordnungen und einen erkannten Jaw-Bone. Reine Namenssuche ist **kein Beweis anatomischer Qualität**; fehlende Geometrie und gering sichere Namen werden ausdrücklich gemeldet.
- Im vorhandenen `FacialAnimationStudioV370.tsx` steht unter der V562-Mundkalibrierung der neue Bereich **V798 – Advanced Facial & Lip-Sync Studio**. Die Rap-Präzision lässt sich **pro Avatar aktivieren/deaktivieren**, auf 0–100 % regeln und in der Rap-Demo und der zusätzlichen Schnellrap-Artikulationsprobe ohne echte Sprecherkennung vergleichen. Der Schalter ist ausgegraut, wenn der Avatar keinen nutzbaren Kiefer und Lippenverschluss hat.
- `VocalRigV368.tsx` verwendet bei Bedarf `planRapMouthPrecisionV798` und `rapMouthRateV798` **im bereits vorhandenen `useFrame`**. Es werden nur Attack-/Release-Raten der vorhandenen Mundkanäle angepasst. Die Ziel-Mundformen bleiben ausschließlich bei den bisherigen Systemen. **Keine neuen Visemes, keine neuen Bones, keine neuen AnimationClips, keine neue GPU-Arbeit.**
- Opt-in wird pro Avatar im bestehenden `avatarFacialProfilesV370` gespeichert und im bestehenden V383-Gesichtsprofil-JSON portabel mitgesichert. Bereits gespeicherte V562-Profile und ältere V383-Exporte bleiben kompatibel; für einen neuen oder unkonfigurierten Avatar ist der Modus aus.

## Sicherheits- und Prioritätsregeln

1. Live-Einsatz nur für **aktives, bestätigtes Deutschrap-Wort**, zugewiesenen Performer und echte Playback-Evidenz. Keine Sängerermittlung aus Tracktitel, Genre-Etikett oder Mikrofonenergie.
2. Nutzerbearbeitete Viseme (V644/V662), manuelle Gesichts-/Silben-Korrekturen, handgegebene Audio-/Stem-Evidenz und Avatar-Morph-Einzeltests behalten Vorrang.
3. **Reduced Motion**, niedrige Performance-Stufe, fehlender Kieferkanal oder fehlender Lippenschluss deaktivieren die zusätzliche Geschwindigkeit.
4. Die Rap-Demo ist explizit als **Simulation** gekennzeichnet; sie dient nur dem optischen Vergleich des individuellen GLB, nicht als Messung von Synchronität zu echten Audio-Tracks.
5. V562-Mundöffnungs- und Bilabial-Schutz bleiben nach der Animation wirksam. GLB-Animationen werden weiterhin nur additiv überlagert und anschließend freigegeben.

## Test und Einschränkungen

`npm run test:v798` enthält 49 Prüfungen (einschließlich der schnellen, synthetischen Artikulationsprobe) und Rig-Diagnosen für vollständige, teilweise, deaktivierte und veraltete Rigs sowie Opt-in-, Quellschutz-, Profilexport- und Laufzeit-Verkabelungsprüfungen. `npm run test:v798:types` ist ein strikter isolierter TypeScript-Check des reinen V798-Moduls. Der Gesamttypcheck und der Next.js-Produktionsbuild müssen mit installierten npm-Abhängigkeiten geprüft werden.

**Bewusst nicht in V798:** automatische ASR/Forced Alignment, Sprecher-Diarisierung, neue Gesichtsmorphs für nicht kompatible GLBs, Audio-Performance-Messungen in einem echten Browser.
