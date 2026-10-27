# Sonic Display V507 – Prüfbericht (24.10.2026)

## Erfolgreich überprüft

- `npm run test:v507`: **30.000 deterministische Body-Profile**, korrektes Auslesen von Skelett-Proportionen im reinen Rechenkern, plausibilisierte Körper-/Arm-/Beinwerte, ungültige Bone-/Boundingdaten, Skalierung, Fallbacks, stage-lokale Registry, sauberes modellidentitätsgebundenes Cleanup und Einfluss auf den vorhandenen V506-Kollisionsplaner.
- `npm run test:v507:types`: neue V507-Kernfunktionen mit `tsc` ohne TypeScript-Diagnosen.
- **57 Versions-Regressionen V451–V507** mit jeweils erfolgreichen Ausgaben. Der erste Sammeldurchlauf wurde nach V501 durch das Tool-Zeitlimit unterbrochen; V502–V507 wurden separat erfolgreich geprüft.
- `test:v493:types` bis `test:v507:types`: alle 15 verfügbaren Versions-Kern-Typechecks erfolgreich.
- `npm run test:gltf-hook-split`, `npm run test:three-avatar-split`: bestanden.
- `npm run check:syntax`: **702 TS-/TSX-Quelldateien** erfolgreich geprüft.
- `npm run check:architecture`: **172 Quelldatei-Referenzen**, zehn Architekturabschnitte und V507-Version erfolgreich geprüft.
- Das vollständige ZIP wird vor der Ausgabe auf alle Einträge / CRC getestet.

## Was tatsächlich implementiert wurde

Das vorhandene `useGLTF`-Szenenobjekt wird **einmal beim Laden bzw. Modell-/Scale-Wechsel** analysiert. Sofern benannte Humanoid-Bones existieren, werden Schulter-, Arm-, Bein- und Höhenmerkmale ermittelt. Die rest-pose Messwerte beeinflussen ausschließlich die bewusst begrenzten Torso-Radien / Armreichweiten des **bereits vorhandenen** V506-Kollisionsplaners für Duette und bis zu vier Avatare. Kein neues Render-Loop und kein veränderter GLB-Clip, keine Phoneme/Mundsteuerung oder Knochen-IK.

## Grenzen und ausstehende Prüfungen

- Es handelt sich um eine **Rest-Pose-Messung**, nicht um eine laufende animierte Kollisionsprüfung der individuellen Hände, Arme und GLB-Skinned-Meshes. Ausweichbewegungen bleiben abhängig von V494-Fußkontakt und V506-Manuallocks. Eine vollständige Kollisionsgarantie besteht nicht.
- Ohne brauchbare Humanoid-Bone-Namen erhält die Figur eine reduzierte Messqualität oder die bisherigen V506-Standardwerte.
- `node scripts/build-preflight.cjs`: **nur 1 von 17 direkten npm-Abhängigkeiten vorhanden**; `package-lock.json` fehlt in der übernommenen Projektbasis. Vollständiger `npm run typecheck` und `npm run build` konnten hier nicht erfolgreich abgeschlossen werden und werden **nicht** als bestanden dargestellt.
- Visuelle Tests auf echten, heterogenen GLB-Avataren (2, 3, 4 Personen) und Performance-/FPS-Tests auf dem Raspberry Pi stehen aus.

## Lokal prüfen

```powershell
npm install
npm run test:v507
npm run build
```

Bei Buildfehlern bitte die erste konkrete TypeScript-/Webpack-Fehlermeldung mitsenden, nicht nur die abschließende npm-Zeile.
