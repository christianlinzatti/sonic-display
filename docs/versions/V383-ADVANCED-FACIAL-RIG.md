# V383 – Advanced Facial Rig

## Neuerungen

Über **Settings → Avatar & Tanz → Gesichtsanimation-Studio** steht der V383-Bereich zur Verfügung.

- Erweiterte automatische Morph-Namensvorschläge für ARKit, ReadyPlayerMe/Oculus und mehrere VRM-Varianten. Dies ist Namensheuristik, keine anatomische Analyse.
- Kanal-Abdeckung für neun Gesichtskanäle, Warnungen bei ungültigen Zuordnungen, mehrfach verwendeten Morphs sowie fehlendem Lippenverschluss oder Blinzeln.
- Einzel-Morph-Test im geklonten importierten Avatar (auch bei unbekannten/unzugeordneten Blendshapes) mit einstellbarer Stärke von 0 bis 100 %.
- Sichere Startkalibrierung für Mimik-Intensitäten. Gültige bestehende Zuordnungen bleiben unverändert.
- JSON-Export/-Import für einzelne Avatar-Profile. Die Nutzerin bzw. der Nutzer kopiert den JSON-Text manuell. Der Import validiert Format/Kanäle/Werte und fällt für fehlende Morph-Namen auf Automatik zurück.
- Sämtliche gespeicherten Profile laufen weiterhin über `avatarFacialProfilesV370` und die vorhandene `VocalRigV368`-Showsteuerung. Kein Asset wird verändert.

## Grenzen und Fallbacks

- Das Profil enthält nur Kanal-Mapping und Intensitäten, nicht die Geometrie oder Animationsclips.
- Die Anzeige bewertet die erkannten Morph-Namen, nicht die tatsächliche Qualität der Gesichtsanatomie.
- Bei importierten Avataren ohne Face-Blendshapes ist eine vollwertige Lippensynchronität nicht möglich; ein vorhandener Kieferknochen dient teilweise als Fallback.
- Die Rap-/Gesangs-Demos simulieren Timing und sind keine Spracherkennung oder Phonemanalyse.
- Browser/GLB-CORS-Beschränkungen bleiben bestehen.

## Prüfung

`npm run check:syntax` und `npm run test:v383`, plus `npm run verify:offline`. Vollständigen Next.js-Build lokal mit `npm install` und `npm run verify` nachprüfen (ohne node_modules und Lockfile im Quellarchiv).
