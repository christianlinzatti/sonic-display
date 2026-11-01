# Sonic Display V663 – Expressive Deutschrap Performance

## Umsetzung

V663 ergänzt die vorhandene `VocalRigV368`-Regie um einen **optionalen**, kleinen Ausdrucks-Layer auf den bereits verifizierten V581-Wort- und Sänger-Cue sowie V645-Performance-Motive. Es gibt keine automatische Sänger-, Phonem- oder Emotionserkennung.

- Unter **Einstellungen → V644 Advanced Phoneme Lip-Sync → V663 Expressive Deutschrap Performance** gibt es `Aus` (Standard), `Natürlich` und `Live-Bühne`. **V644-Visemmarkierungen sind hierfür nicht erforderlich.** Die Wahl gilt flüchtig nur für den aktuellen Song und wird beim Songwechsel gelöscht.
- Wortgebundene Kopfbewegung, und bei vorhandener V574-Autorisierung Blickbewegungen, werden mit dem V645-7-Sekunden-Motiv synchronisiert. In Verses ist die Modulation ruhiger; in als Hook/Chorus/Drop eingeordneten Abschnitten ist sie etwas stärker. Eine Abschnittsklassifikation ist **keine** Stimmen-Identifikation.
- Schultern werden nur ergänzt, wenn der bestehende V582-Cue vorliegt. Arme ausschließlich mit V618-IK-Unterstützung; falls Bodenstütze oder ein Bone fehlen, bleiben sie unbewegt. Zusätzliche Kopfbewegung bleibt unter 0,0042 rad, Blick unter 0,0026 rad, Schulter unter 0,0038 rad und Arm unter 0,0016 rad.
- Manuell gesetzte Bewegungen, GLB-AnimationMixer, Morphs, V644/V662-Viseme, Lippenverschlüsse, visuelle Demovorschau, reduzierte Bewegung und das Low-Performance-Profil bleiben vorrangig. Das Modul verändert **keine** Mundform, Hüfte, Füße, Song-Timestamps oder Keyframes.
- Die Darstellung benutzt den vorhandenen R3F-Frame-Takt, vorhandene V581/V582-Additive-Bone-Helfer und keine weiteren Timer, Netzwerkaufrufe, Audioerfassung oder lokalen Speicher.

## Einschränkungen

Die V663-Ausdrücke erscheinen **nur** mit synchronisierten, eindeutigen Wortzeitmarken und einer bereits bestätigten Sängerzuordnung. Sie sind keine autonome Motion-Generierung. Die Wirkung hängt von echten Head-/Shoulder-/Arm-/Eye-Bones und den V618-IK-Daten der jeweiligen GLB ab. Die Differenz zwischen Verse und Hook folgt der bestehenden Regieabschnittsinformation; sie kann bei fehlerhafter Erkennung falsch sein. Optische Qualitätsprüfungen mit echten GLBs und Musik bleiben erforderlich.

## Prüfungen

- `npm run test:v663`: Opt-in, Sänger-/Wort-Evidenz, Style/Hooks, Prioritäten, IK-/Eye-Gates, Seek/Songwechsel, 18.000 deterministische Song-/Slot-Abfragen und Quellcodeintegration.
- `npm run test:v663:types`: Isolierter TypeScript-Check des neuen Moduls.
- `npm run test:smoke:v663`: V663 + bestehende V645-/V581-/V618-/V662- und Release-Regressionen.
- `npm run typecheck`, `npm run build`: Für die finale Freigabe nur nach Installation sämtlicher Projektabhängigkeiten, auf Windows und Linux.
