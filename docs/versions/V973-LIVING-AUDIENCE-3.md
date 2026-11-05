# V973 – Living Audience 3.0

## Was neu ist

Die existierende virtuelle Publikumsdarstellung wird lebendiger. Leichte individuelle Kopf-, Körper- und Armbewegungen, unterschiedlich schnell ansteigende Hände in Hooks und durch sechs Publikumssektoren laufende Wellen setzen auf V815/V874–V893 auf. Dabei werden die bestehenden InstancedMeshes wiederverwendet; es gibt weder separate neue Figuren noch neue Draw Calls. Alle Signale sind anhand der verifizierten V810-Abschnitte, des Titelfortschritts und der bestehenden Energie-/Kick-Merkmale deterministisch und rückspulstabil.

| Songteil | Publikumsverhalten |
| --- | --- |
| Intro | Dezent, keine zusätzlichen Bewegungsimpulse |
| Verse | Asynchrone Grooves und Kopfnicken |
| Hook | Unterschiedlich erhobene Arme, gemeinsame Refrain-Stimmung |
| Build | Wellen zwischen sechs Sektoren |
| Drop | Bassorientiertes, unterschiedliches Bouncen |
| Break | Keine neuen Bewegungsimpulse |
| Finale | Fortlaufende Wellen und Armbewegungen |

## Einstellungen

Unter **Concert FX Studio → V973 Living Audience 3.0** kann die neue Funktion an-/ausgeschaltet werden. Zusätzlich gibt es Schalter für Sektorwellen und individuelle Bewegungen, einen Stärke-Regler und ein Publikumslimit:

- **Eco: maximal 24 Personen** – auf Raspberry Pi zuerst verwenden.
- **Balanced: maximal 48 Personen** – Standard.
- **Cinematic: maximal 72 Personen** – nur nach Performance-Messung.

Die tatsächliche Zahl liegt stets bei *höchstens* dem vom vorherigen Performance-Governor erlaubten V815-Publikum. Wenn der vorhandene Governor auf Low-Tier kein Publikum zulässt, kann V973 es nicht aktivieren. Die Intensität ist relativ zur bereits genehmigten Bewegung gedrosselt. Manuelle Kameras/Lichtshows, Blackout, Pause, reduzierte Bewegung und Lyrics- bzw. Vocal-Fokus behalten Vorrang. Kein eigener Timer, keine neue Audioanalyse, kein Netz- oder Hardwarezugriff.

## Prüfungen

- `npm run test:v973`: 17 Testgruppen, 10.000 simulierte Songzustände sowie Sicherheits- und Quellenverträge.
- `npm run test:v973:types`: isolierte TypeScript-Prüfung.
- `npm run verify:v973:focused`: V973 und wichtige Vorgängerprüfungen, Syntax, Architektur.
- In `scripts/v931-production-gate.cjs` und `scripts/vercel-production-build.cjs` verpflichtend eingebunden; sie prüfen außerdem vollständiges TypeScript und einen echten Next.js-Produktionsbuild in Node 24.

## Release

Für den vorhandenen versionenunabhängigen GitHub-Importer die vollständige ZIP **`SonicDisplay-V973.zip`** nach `releases/` laden. Die `package.json` enthält `sonicRoadmapRelease=v973`, das alte kompatible npm-Paketversionsschema bleibt erhalten. Alexa-Skill aus V971, Govee-Windows- und Raspberry-Pi-Bridge bleiben im Projekt enthalten. Echtes WebGL/GPU-Playthrough und Raspberry-Pi-Messung sind weiterhin separat nötig.
