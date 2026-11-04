# V684 – Prüfprotokoll / Quality Gate

## Erfolgreich in dieser Offline-Umgebung

- `npm run test:v684`: **PASS – 53 Prüfgruppen**, inkl. 4.000 simulierter Bewegungszeitpunkte, Stilprofilen Deutschrap/Hardtekk/Pop, Stereo-/Slot-Variation, stabiler Songzeit, Foot-IK-Kontaktsperre, deterministischer Wiederholung, manueller Vorränge, Erhalt aller Gesichts-/Lippen-/Root-Felder.
- `npm run test:v684:types`: **PASS** – isolierte strenge TypeScript-Prüfung des neuen Moduls.
- `npm run test:quick`: **PASS** – aktuelle Regressionen V669–V684, 945 TS/TSX-Syntaxquellen, 606 Quellcode-Referenzen, 1595 Case-Checks, Spotify-Umgebung.
- Zusätzlich **PASS**: historische V486, V524, V545, V587, V596, V665, V666 und V666.1 mit ihren bisherigen simulierten Footwork-/Genre-Prüfungen. Feste Verweise auf die bisher letzte Pipeline-Stufe wurden auf den V684-Endschritt angepasst. Die Kern-/Sicherheitsprüfungen bleiben unverändert.
- Die isolierten TypeScript-Projekte V486, V524, V545, V587, V596, V665 und V666 bestehen ebenfalls.
- Manuelle Animationen, importierte GLB-Clips, Sänger-/Vocal-Timestamps, tatsächliche Foot-IK-Anker und Bühnen-Wurzelpositionen werden von der V684-Verfeinerung nicht überschrieben.

## Produktionsfreigabe noch offen

- `npm run check:dependencies` **BLOCKIERT**: 0/17 benötigte npm-Pakete installiert; `package-lock.json` fehlt.
- `npm run build` **BLOCKIERT** sofort an der V680-Abhängigkeitsprüfung, bevor Next.js startet. Daher **kein** vollständiger Projekt-TypeScript-Check und **kein** verifizierter Next.js-Produktionsbuild.
- Browser-/WebGL-Rendering, echte GLB-Motion-Tests und FPS-/Touchscreen-Qualität wurden in dieser Umgebung nicht ausgeführt. Die Simulation stellt **keinen** Beweis für realistisch gerenderte Fußbewegungen dar.

## Test auf Windows

Im ausgepackten Projektverzeichnis:

```powershell
npm install
npm run test:quick
npm run test:v684:types
npm run build
```

Danach mit echten GLB-Avataren: Deutschrap-Hook, Hardtekk-Drop, Rock-/Pop-Song, 3-/4-Performer-Gruppe, manuelle Clip-Auswahl, Fuß-IK an/aus, reduzierte Bewegung und Low-Performance-Profil visuell prüfen. Ein erzeugtes `package-lock.json` für reproduzierbare Builds versionieren.
