# V605 – Cinematic Concert Camera Director 6.0

Stand 26.10.2026; Basis V604.

## Kameraentwicklung

Die tatsächlich verwendete R3F-Kamera erhält eine zusätzliche, reine Bildkomposition `composeFullSongCameraV605` nach der vorhandenen V585-Duettkamera und vor V351-Lyrics-Schutz. Es werden nur bereits bestätigte V600/V604-Abschnitte verarbeitet. Die Funktion nimmt Kamerapose, Song-Regieplan, dessen Live-Cue, tatsächliche Avatar-Weltpositionen und (optional) nachgewiesene V528-Sängerrollen entgegen. Sie erzeugt sanfte, kleine, deterministische Bewegungen für verschiedene Motive: Wide/Ensemble, Portrait, Dialog und Finale. Zusätzliche Bewegungen werden an Szenengrenzen ausgeblendet. Das zweite Hook-Motiv bleibt anders als das erste, ohne eine neue Abschnittserkennung vorzutäuschen.

Portrait- und Duettfokus sind nur bei gültigen, ausdrücklich verifizierten Sängerrollen aktiv; ohne solche Rollen gibt es lediglich eine sanfte Bühnen-Zentrierung und niemals eine erfundene Sängerzuweisung. Alle automatischen Positions- und FOV-Deltas sind stark begrenzt. Die vorhandenen Screen-Projektionschecks (`measureConcertFrameV550`, `measureScreenFrameV540`) müssen für **alle sichtbaren gelesenen Avatare** mindestens das bereits bestehende Framing erhalten; andernfalls wird exakt das ursprüngliche Pose-Objekt zurückgegeben. Das ist kein Ersatz für echte Videoprüfung.

## Schutzmaßnahmen

Live-Editor, kameragebundene manuelle Einstellungen, V400-Timeline, Regie-Keyframes, manuelle Rap-Edits, Lyrics-Sicherheitskomposition, pausierte Wiedergabe, Reduced Motion und Low-Pi-Tier haben Priorität. Ein einzelner bestehender R3F-`useFrame`-Loop bleibt bestehen; neue Canvas-, Render-, Netzwerk-, Audio-, Partikel- oder GPU-Systeme werden nicht angelegt. Das Erscheinungsbild ist abhängig von echten Szenenmarkierungen und der tatsächlich renderbaren GLB-Formation.

## Prüfen

```bash
npm run test:v605
npm run test:v605:types
npm run test:smoke:v605
npm run verify:v605
```

Der vollständige Next.js-Produktionsbuild sowie visuelle Abnahme mit echten Spotify-/GLB-Liveaufnahmen sind gesondert erforderlich.
