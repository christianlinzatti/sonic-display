# V872 – Natural Dance & Avatar Performance 4.0

Basis: Sonic Display V871. Ziel ist eine weniger hektische, standfestere
3D-Avatarperformance ohne zweites Rig, neue Animationsclips oder erfundene Audiodaten.

## Umsetzung

- `components/visualizer/naturalDanceContinuityV872.ts`: Nachbearbeitung der vorhandenen
  V738-Hip-Sway/Circle/Bounce- und V743-Bass-Bewegungen mit konservativem
  exponentiellem Tiefpass und strikten Kanalgrenzen.
- Bei **einem** gepflanzten Fuß werden Beckenverschiebungen gedämpft; bei
  **beiden** gepflanzten Füßen erzwingt der Kontakt-Sicherheitsregler eine
  stärkere Dämpfung. Ohne gültige Foot-IK-/Kontaktinformation wird jede
  zusätzliche laterale oder vertikale Beckenverschiebung unterdrückt.
- V745 dirigiert weiterhin die Rollen, Verzögerungen und Songphrasen im
  Ensemble. V872 dämpft optional die zusätzliche Bewegung von Begleit-Avataren.
  Keine künstlichen Beats, keine neuen zeitlichen Phasen.
- Sowohl die Live-GLB-Darstellung (`GltfDancerAvatarV492.tsx`) als auch die
  Einzelavatar-Vorschau (`AvatarEditor.tsx`) verwenden denselben Prozessor.
- In der AvatarEditor-Vorschau sind Ein/Aus, Glättung, Bodenkontaktschutz und
  Gruppenbalance einstellbar. Konfiguration in `avatarDanceContinuityV872`.
- Die Layer greift ausschließlich bei **automatischen** Hüftbewegungen.
  Manuell ausgewählte Hip-Clips, benutzerdefinierte GLB-Clips, Show-/Motion-Timelines,
  Reduced Motion, Pause, Zeit-Sprünge und Titelwechsel bleiben geschützt.
- Die bestehende Fuß-IK läuft **danach** und hat immer die letzte Entscheidung.

## Grenzen

Es werden keine neuen GLB-Animationen bzw. Gesäßknochen erzeugt. Es gibt keinen
Anspruch auf realistische Bewegung ohne eine korrekt gewichtete GLB-Datei mit
Hüft- und Fußknochen. Externe Motion-Capture- und reale GPU/Browser-Abnahme
bleiben offen. Der V872-Test beweist numerische Kontinuität und Integration,
keine visuell gemessene Foot-Slip-Qualität.

## Verifikation

`npm run test:v872` · `npm run test:v872:types` ·
`npm run test:smoke:v665:flat` · `npm run verify:production:v867`.
Die vollständige TypeScript-Prüfung, Next.js-Produktionsbuild und echte Windows-CI-
Validierung sind vor Freigabe erforderlich.
