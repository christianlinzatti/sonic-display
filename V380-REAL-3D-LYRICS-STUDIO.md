# Sonic Display V380 — Real 3D Lyrics Studio

Basis: vollständiger Quellstand V379. Zugang: **Settings → Display → Lyrics Studio → „Echte 3D-Bühne öffnen“**.

## Tatsächliches WebGL-Rendering

- Die 3D-Vorschau wird erst nach einem expliziten Klick als separates, dynamisch geladenes React-/Three-Fiber-Canvas aufgebaut. Beim Zurückschalten zur CSS-Vorschau wird sie abgebaut; es gibt keinen zweiten Dauer-Renderloop.
- Hauptavatar und optional zweiter Avatar werden über **denselben `useAvatarModel`-Resolver** wie die echte Bühne geladen (einschließlich lokaler Installationen und `/api/avatars`). Ein, zwei oder vier Modelle sind darstellbar. Jedes GLB wird über `SkeletonUtils.clone` separat geklont; die Vorschau verändert keine Stage-Skelette.
- Vorhandene eingebettete Animationen oder eine separat installierte Animations-GLB werden auf einer isolierten `AnimationMixer`-Instanz bei der gewählten Songposition abgetastet. Externe Motions werden mit dem bestehenden Retargeting-System angepasst, soweit möglich. Fehlt ein Modell oder schlägt das Laden fehl, erscheint der prozedurale Ersatzavatar. Die tatsächliche IK-, Clip-Direktor- und Choreografie-Kombination der Hauptbühne wird nicht kopiert.
- **Dieselbe `Lyrics3DScene`** (Troika-3D-Text), **dieselbe `DynamicStage`-Bühnenbeleuchtung** wie in der Hauptansicht. Die Studio-Bühne läuft reaktiv deaktiviert, damit sie nicht in globale Licht-Zeitlinien eingreift. Das Layout verwendet echte GPU-Geometrie und Tiefen-/Perspektivprojektion, keine CSS-Avatare.
- Der Kameraplan verwendet für Solo, Duo, Gruppe und Lyrics-Fokus echte 3D-Koordinaten, wahlweise in einer freibeweglichen Orbit-Kamera. Diese Pläne sind eine Vorschau-Näherung: V377/V378 übernehmen auf der Hauptbühne die Regie mit echten Live-Rig-Ankern und Authored-Keyframes, die das Studio nicht vollständig nachstellt.

## Bedienung und Sicherheit

- Demo-Scrubber stellt Lyrics, Animation und Kamera auf dieselbe Zeit. Bei Spotify nutzt das Studio nur lesend die fortgeschriebene Playerzeit; es pausiert nicht und führt kein Seek durch.
- Ein/ zwei/ vier Avatare, Lead-Wahl, freie Kamera, automatischer V378-Kamera-Plan sowie manuelle Vorschau-Bildausschnitte (Lead, Zweierbild, Gruppe, Lyrics-Fokus). Das Format kann zwischen 16:9 und 1024×600 umgestellt werden.
- Die V379 CSS-Vorschau bleibt bewusst erhalten, insbesondere für schwächere Smartphones. In der Pause wird `frameloop="demand"` genutzt, während der Demo-Wiedergabe nur der Studio-Canvas rendert; DPR ist begrenzt.
- Kein Anspruch auf echte Sprechererkennung, phonemgenaue Lippenbewegungen oder vollständig identische Tanz-/IK-Performance. Ohne GLB-Animationsdaten ist ein statischer GLB möglich.

## Validierung

`npm run check:syntax` (506 TS-/TSX-Dateien), `npm run test:v380`, 122 von 122 ausgewählten Offline-Testbefehlen einschließlich V265–V380 (getrennte Testblöcke). Vollständiger `npm run verify` benötigt `npm install` und alle npm-Abhängigkeiten; das Quellarchiv enthält kein `node_modules`.
