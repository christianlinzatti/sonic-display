# Sonic Display V848 — Cinematic Camera Director 4.0

## Implementiert

- **Neues reines Kameramodul**: `components/visualizer/cinematicCameraDirectorV848.ts`.
- **Live-Integration** in `components/visualizer/StageCameraDirectorV289.tsx` nach V838 und **vor** dem finalen V351-Lyrics-Guard.
- **Verifizierte Sängerporträts**: nur wenn V528 und V797 über die aktuelle Song-ID und den Sprecher übereinstimmen. Das Bild wird höchstens minimal näher geführt.
- **Duett- und Handoff-Bilder**: nur bei übereinstimmenden Vocal-Rollen und tatsächlich sichtbaren V377-Bühnenankern.
- **Größere Drop-Totalen**: ausschließlich bei aktiver, bestätigter V792-Storyboard-Bewegung `dolly-out` oder `crane` und aktuellem Drop-Abschnitt; bis zu vier sichtbare Performer.
- **Sicherheitsprüfungen** V540/V550: Ablehnen, wenn der neue Bildausschnitt projizierte Kopf-, Körper-, Bühnenrand- oder Lyrics-Überläufe gegenüber dem Ausgangsbild verschlimmert.
- **Prioritäten**: keine Veränderung manueller Kameras, Keyframes, gespeicherter V354/V400-Timelines; bei Reduced Motion und Low-Tier deaktiviert. Beibehaltung bestehender Kamera-Easing-Fahrten; kein neuer `useFrame`-Loop und keine zusätzlichen GPU-Objekte.
- Kein neues System zur automatischen Sängerstimmenerkennung; keine echten Videobild- oder Okklusionsmessungen.

## Durchgeführte technische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v848` | PASS — 95 neue Testgruppen |
| Alte Regressionen `test:v800` bis `test:v847` | PASS — 48/48 Suiten |
| Alle `test:v800` bis `test:v848` | PASS — 49/49 Suiten |
| `npm run test:v848:types` | PASS — isolierter TypeScript-Check |
| `npm run check:syntax` | PASS — 1225 TS/TSX-Dateien |
| `npm run check:architecture` | PASS — 941 aktuelle Quellreferenzen |
| `npm run test:module-case` | PASS — 2079 Module ohne Case-Kollision |
| `npm run doctor:v831` | BLOCKED — Next.js und Projekt-TypeScript fehlen; Lockfile, Node 22, Case und Release-Skripte bestanden |
| Vollständiger `tsc -p tsconfig.json --noEmit --incremental false` | FAIL — fehlende React-, Next.js-, R3F-, Three- und Node-Typdeklarationen ohne `node_modules` |
| Next.js-Produktionsbuild | NICHT AUSFÜHRBAR — `next` lokal nicht installiert |
| Echte Browser-, GLB-, GPU- oder Raspberry-Pi-Abnahme | NICHT AUSGEFÜHRT |

Historische Tests wurden nur in ihren expliziten Versionsnummern-Annahmen auf V848 erweitert; die V806/V809/V838-Kamera-Strukturprüfungen kontrollieren zusätzlich die neue Abfolge `V806 → V809 → V838 → V848 → V351`. Keine bestehenden inhaltlichen Kamera- oder Lyrics-Schutztests wurden deaktiviert.

## Produktionsfreigabe

**Noch nicht produktiv freigegeben.** Für die Freigabe in der Entwicklungs-/CI-Umgebung `npm ci`, `npm run check:release`, `npm run typecheck` und `npm run build` erfolgreich durchführen. Danach reale 3D-Bühne und Kamera in Deutschrap, Duett, Drop und Mehravatar-Szenen mit sichtbaren Lyrics prüfen. GitHub Actions (`.github/workflows/v832-continuous-validation.yml`) enthalten die vollständige technische Freigabeprüfung.
