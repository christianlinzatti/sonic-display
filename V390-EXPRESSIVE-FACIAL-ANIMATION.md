# Sonic Display V390 – Expressive Facial Animation 2.0

## Neu
- Optional einschaltbare, songzeitbasierte Mikro-Mimik mit individuellen Blinkrhythmen für verschiedene Avatar-Slots.
- Augenbrauen-, Lächeln- und Squint-Signale reagieren dezent auf Gesangs-/Rap-Phrasen und vorhandene Audioenergie.
- Bestehende, kalibrierte Facial-Morph-Mappings werden wiederverwendet; Quelle für Phoneme bleibt Lyrics-Schätzung, keine Sprachseparation.
- Pausen, ausgeschalteter Lip-Sync und Reduced Motion unterdrücken neue Bewegungen; Gesichts-Studio-Demos und manuelle Morph-Vorschau bleiben priorisiert.
- Unter Einstellungen → Gesang/Lippenanimation: V390 aktivieren und Ausdrucksstärke 0–100 % einstellen. Standardmäßig ausgeschaltet.

## Grenzen
HeadPitch/HeadYaw sind im reinen Expression-Planer enthalten, aber absichtlich nicht auf das GLB-Hals-/Kopfskelett angewendet, um authored Animations, IK und Duettkamera nicht zu überschreiben. Nicht jedes Modell hat geeignete Augen-/Brauen-Morphs.

## Verifikation
`npm run test:v390`, `npm run check:syntax`, `npm run typecheck`, `npm run build`. In dieser Umgebung fehlen Next-/React-Pakete; Produktionsbuild muss auf Windows geprüft werden.
