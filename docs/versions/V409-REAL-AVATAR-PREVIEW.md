# Sonic Display V409 – Real Avatar Preview im Rap Performance Editor

Basis: V408 und alle früheren Funktionen.

## Bedienung

1. Unter **Einstellungen → Anzeige → V409 Rap Performance Editor** öffnen.
2. Bei **Vorschau-Avatar** einen bereits konfigurierten bzw. lokal installierten GLB-/GLTF-Avatar auswählen. V409 verwendet exakt die Avatar-Bibliothek aus den Einstellungen, inklusive Server-Liste `/api/avatars`, lokalen Dateien und konfigurierten URLs.
3. Bei neu hinzugefügten Avataren auf **Avatar-Liste aktualisieren** klicken. Die Auswahl betrifft **nur die Vorschau**; die Live-Avatar-Auswahl bleibt unverändert.
4. Mit der Maus drehen/zoomen, zwischen Verse/Hook umschalten und wie bisher sieben Performance-Regler testen. Vorschau mit **Pause/Abspielen** steuern.
5. Das Modell wird über `useGLTF` geladen und mit `SkeletonUtils.clone` isoliert. Automatischer Bildausschnitt anhand des Bounding-Box-Maßes; Kopf-, Hals-, Brust-, Wirbelsäulen- und Armknochen werden mit den bestehenden Rig-Aliasen von Sonic Display erkannt. Bei `jaw` bzw. unterstützten Mouth-Blendshapes wird der Mund demonstrativ bewegt. Die Statusanzeige informiert über erkannte Rig-Knoten und Mundunterstützung.

## Fehlerbehandlung und Sicherheit

- Defekte oder nicht ladbare GLB-Dateien (CORS, 404, fehlende Daten) führen zu einer **eigenen** Fehlermeldung mit Wechsel auf das Demomodell; der restliche Editor sowie die Live-Show werden nicht beschädigt.
- Ungültige Einträge ohne Modell-URL und gefährliche/ungeeignete Schemas (`javascript:`, `data:`, unsicheres `http:`) werden von der Auswahl ausgeschlossen.
- Animierte Knochen und Morph Targets gehören nur zum **geklonten Preview-Objekt**; geteilte GLTF-Geometrien und Texturen werden beim Wechsel nicht versehentlich entsorgt (`dispose={null}`).
- Reduce Motion und Pause verhindern neue Vorschau-Impulse. Bestehende V408-Editorwerte, Persistenz, Schutzmechanismen sowie GLTF-Animationen in der **Live-Show** bleiben unverändert.

## Ehrliche Grenzen

- Die Vorschau nutzt **das echte Aussehen und Rig** des GLB-/GLTF-Modells, aber **simulierte** Rap- und Kick-/Snare-Akzente und **keine** exakte Audio-Phonemerkennung. Eingebettete Motion-Clips / separate Tanzanimationen werden im Editor nicht nachgespielt; dafür bestehen die bisherigen Avatar- und Motion-Studio-Funktionen.
- Ohne passendes Rig sind Kopf-/Armbewegungen eingeschränkt. Ohne Jaw-Bone/Mouth-Morph bleibt eine GLB-Mundanimation aus.
- Bei externen Modellen können CORS-Einstellungen des Hosts oder externe Textur-/Binärdateien Laden verhindern.

## Tests

- `npm run test:v409`: Modellauswahl, Dateiformat-Whitelist, Fehlerisolierung, Skinning-/Rig-/Morph-Zuordnung, reduzierte Bewegung, Auswirkung nur auf die Vorschau, Version und Scripts.
- `npm run test:v404`: Kamera-/Lyrics-/Lip-Sync- und Windows-Importprüfungen, einschließlich V405–V408.
- `npm run check:syntax`, `npm run test:module-case`, `npm run verify:offline:fast`: zusätzliche Regression.
- Vollständiger Next.js-Build wird auf dem Windows-Rechner mit installierten npm-Abhängigkeiten über `npm run verify` durchgeführt.
