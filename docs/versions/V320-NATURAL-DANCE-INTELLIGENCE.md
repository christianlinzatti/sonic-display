# Sonic Display V320 – Natural Dance Intelligence 3.0

Basierend auf V319. Die Version ergänzt die bereits vorhandenen Systeme V113/V228 (natürliche Bewegung), V307 (expressive Akzente) und V311 (Glättung und Bodenkontakt) um **zusammenhängende, dezente Gewichtsverlagerung und Nachschwingen**. Das Ziel sind organischere Übergänge ohne neue, widersprüchliche Animationen oder veränderte importierte GLB-Keyframes.

## Funktion

- **Musikgetragene Balance:** Eine phasenkohärente, leicht verzögerte Gegenbewegung von Oberkörper und Hüfte unterstützt vorhandene Tanzbewegungen. Nur additive Rotationswerte werden verändert; keine Bone-Positionen, Weltkoordinaten, Root-Translation oder IK-Ziele.
- **Follow-through:** Arme und Kopf bekommen dezente, abklingende Nachbewegungen. Die Verzögerung wird mit `1-exp(-rate*dt)` unabhängig von der Bildrate berechnet.
- **Genrestil:** Hardtekk/Hardstyle/Rave reagiert auf Kick-Akzente mit kürzerer Zeitkonstante. Deutschrap/Hip-Hop orientiert sich stärker an der Snare und lässt Körperbewegungen weicher auslaufen. Cinematic/Ambient verwendet langsameres Nachschwingen.
- **Phraseneinfluss:** Intro, Break und Outro reduzieren den zusätzlichen Effekt, Hook und Drop erlauben höhere Intensität.
- **Bodenkontakt:** Zusätzliche Footstep- und LegGroove-Rotationen werden bei erkannten Boden-Kontakten gedämpft. Der Foot-IK-Solver selbst bleibt allein für reale Fußpositionen zuständig.
- **Sicherheitsregeln:** Pause, Reduced Motion, Trackwechsel, Seek und ungeeignete Frame-Deltas setzen den temporären Bewegungszustand zurück. Bereits autorisierte GLB-Clips und manuelle Choreografien erhalten Vorrang (`authoredClipPriority` begrenzt die Zusatzbewegung auf 30 %).

## Einstellungsort

**Settings → Dynamic Stage → Smart Stage Director → Natural Dance Intelligence 3.0 · V320**

Die Regler sind `enabled`, `style` (`auto`, `rave`, `rap`, `cinematic`), `weightTransfer`, `followThrough`, `groove`, `footSafety`. Beim Genre-Modus `auto` greift der vorhandene Genre-Resolver aus V307. Alle Prozentwerte werden normalisiert und auf 0–100 begrenzt.

Die Einstellungen werden lokal unter `sonic-natural-dance-v320` gespeichert und über `sonic:natural-dance-v320` an die Anwendung gemeldet. Die vier eingebauten V309-Show-Presets besitzen genreabhängige V320-Profile. Ältere eigene Presets **ohne V320-Feld** bekommen den V320-Zusatz deaktiviert, damit das bisherige Erscheinungsbild erhalten bleibt. Anwender können ihn im V320-Panel aktivieren oder ein neues Preset speichern.

## Architektur

`ThreeAvatar.tsx` ruft `refineNaturalDanceV320()` in der prozeduralen und der GLTF-Avatar-Pipeline **nach** den V307/V311-Filtern auf. Erst danach kommen die V314-Diagnose und der bestehende `filterMotionDebugLayers`/`applyAvatarRigMotion`-Pfad. So bleibt die Reihenfolge mit bestehenden Quality-Filtern und dem Foot-IK-Solver stabil.

- `components/visualizer/naturalDanceIntelligenceV320.ts`: Zustand, Settings und additive Bewegungsengine.
- `components/visualizer/NaturalDanceControlsV320.tsx`: Regler, Enable/Disable und lokale Persistenz.
- `components/visualizer/StageDirectorControlsV287.tsx`: Einbindung in die Settings.
- `components/visualizer/showPresetsV309.ts`, `ShowPresetStudioV309.tsx`: Ein-Klick-Presets, Snapshots und Undo.
- `tests/v320-natural-dance-regression.cjs`: Stabilität, Genres, Pausen/Seeks/Trackwechsel, Foot-Safety, Clip-Priorität, Settings und beide Avatare.

## Qualität und Grenzen

Offline-Regressionen (`npm run verify:offline`) und Quellsyntaxprüfung (`npm run check:syntax`) sind erfolgreich. Die isolierte neue V320-Kernlogik wurde zusätzlich mit TypeScript im Strict-Modus geprüft (typkompatible lokale Stubs für ihre beiden Type-Imports). **Nicht vollständig überprüft:** Next.js-Produktionsbuild, kompletter Projekttypcheck und echte 3D-/Browserausgabe, weil `node_modules` in der Buildumgebung fehlen. Lokal: `npm install && npm run verify`.

V320 ist bewusst kein automatisches Neuschreiben/Retargeting importierter Keyframes und kann schlechte Rig-Daten oder Fußkontaktfehler in originalen Clips nicht vollständig beheben. Es verbessert nur vorhandene kleine Zusatzbewegungen; Nutzer können den Effekt jederzeit abschalten.
