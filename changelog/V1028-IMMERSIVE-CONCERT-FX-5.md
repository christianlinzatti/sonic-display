# V1028 – Immersive Concert FX 5.0

## Neue Funktion

- Die bestehende Live-3D-Bühne koordiniert Lichtwellen (V882), Nebel (V814/V887), Konfetti/Funken (V816) und Schaum (V817) als **eine** musikalische Inszenierung.
- Intro/Break, Verse, Build, Hook/Drop und Finale besitzen unterschiedliche, weiche Intensitätsverteilungen innerhalb **verifizierter** V604/V761/V810-Abschnitte. Ein Hero-Akzent benötigt zusätzlich einen tatsächlich gemessenen Kick und Energie; aus Song-Metadaten werden keine Drops abgeleitet.
- Der neue Mischschritt läuft nach V871/V889 und allen V823/V825-Performance-Grenzen. Die Multiplikatoren sind ausschließlich <= 1; Quellen und Instanzzahlen werden niemals reaktiviert oder vergrößert.
- Vorhandener V814-Nebel wird per Uniform mit einem <=1-Multiplikator abgestimmt. **Keine** zusätzliche WebGL-Ebene, keine Timer, Hardwaresteuerung oder Stroboskop-Blitze.
- Ausschluss bei manuellen Timelines, manuellen Lichtern/FX, sichtbaren Lyrics, Gesangsporträts, Pause, Seek, Blackout, reduzierter Bewegung, Low-Tier oder Qualitätsdruck.
- Opt-in/Opt-out und Intensitätsregler im **Concert FX Studio** (`immersiveFxV1028`, `immersiveFxStrengthV1028`). Standardmäßig aktiv **nur innerhalb** der vorhandenen V810-Musikfreigabe; die bisherigen Einzel-Effekt-Toggles behalten Vorrang.

## Nachweise

- `npm run test:v1028` validiert Sicherheit, echte Event-Evidenz, Bounds und vorhandene Draw-Calls.
- `npm run test:v1028:types` strenge isolierte TypeScript-Prüfung.
- V1028 ist in der Source-Preflight-, Vercel- und V931-Produktions-Gate-Kette enthalten, mit Node-24-GitHub-Workflow.
