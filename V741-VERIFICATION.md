# V741 – Advanced Hip & Glute Rig: Implementierung und Verifikation

**Basis:** vollstaendiges V740-Projektarchiv. Version in `package.json`, `package-lock.json` und `ARCHITECTURE.md` auf V741 gesetzt.

## Neu

- `components/visualizer/advancedGluteRigV741.ts`: rig-eigene Erkennung benannter `Glute_L` / `Glute_R`- oder Buttock-Knochen und links-/rechtsseitiger Morph-Targets. Nur **nachgewiesen gewichtete** Knochen zaehlen; reine Knotennamen ohne Skin-Weights gelten als nicht verwendbar. Morph-Kanaele benoetigen ein tatsaechliches Positions-Shape in der Mesh-Geometrie (nicht bloss einen Dictionary-Eintrag).
- Nur wenn **beide** Seiten mit dem ausgewaehlten Treiber nutzbar sind, wird eine separate Deformation gestartet. `auto` bevorzugt Morph-Targets, faellt bei Bedarf auf Bones zurueck; `morph` und `bone` lassen sich explizit auswaehlen.
- Begrenzte additive Deformation aus der bereits geglaetteten V738-Hueftpose; getrennte linke/rechte Intensitaet, globale Staerke, glatte Ruecknahme bei Inaktivitaet. Kein Becken- oder Fuss-IK-Override. Kein Doppelantrieb von Morph und Bone bei `auto`. Auf statischen Rigs kein Additionsdrift; wenn der Mixer vorherige Animationswerte wiederherstellt, werden neue Overlays relativ dazu angesetzt.
- Gleiche Sampler in Live-Buehne und Avatar-Studio. Preview benutzt `SkeletonUtils.clone` fuer korrekte Bone-Bindings in SkinnedMesh-Clones.
- `Dance Studio → Advanced Hip & Glute Rig V741`: Opt-in (default **aus**), Treiber, Staerke und pro-Seite-Regler. Im Avatar-Studio werden fehlende Skin-Weights, Morph-Positions-Shapes, linke/rechte Knochen und die Treiberunterstuetzung gewarnt. Wechsel des Avatars verwirft alte Statuswerte.
- `types/music.ts` / `context/UiPreferencesContext.tsx`: persistente, kompatible optionale Settings. Keine neuen APIs, keine Dateien des aktiven Avatars geaendert.

## Verifikation dieser Umgebung

**Erfolgreich:**

- `npm run test:v741`: **16.445** numerische, Skin-Weight-, Warn-, Reset-, Treiber- und Integrationschecks. Mock-Rig / deterministischer Code – **kein** visueller 3D-Test.
- `npm run test:v741:types`: strenger isolierter TypeScript-Check mit ausschliesslich Test-Three-Typstub.
- Regressionen `test:v735` bis `test:v740`, samt isolierten Typchecks soweit vorhanden, sowie `test:v665`, `test:v666`.
- `npm run check:syntax`: **1.043** TS/TSX-Dateien. `npm run check:architecture`: **735** dokumentierte Source-Verweise. `npm run test:module-case`: **1.761** Dateien kontrolliert.

**Offen / blockiert:**

- `npm ci --offline --ignore-scripts`: `ENOTCACHED` fuer `zustand-5.0.16.tgz`; komplettes `node_modules` fehlt.
- `npm run typecheck`: **fehlgeschlagen**, hauptsaechlich fehlende React-/Next-/Three-/Node-Typen (keine installierten Projektabhaengigkeiten). Ein gruener isolierter Typcheck ist kein voller UI-/Anwendungstypcheck.
- `npm run build`: **durch Build-Preflight blockiert**, 0/18 erforderliche Pakete vorhanden. Kein erfolgreicher Next.js-Produktionsbuild nachgewiesen.
- Kein echter Avatar-v2-GLB im Archiv, keine dynamische Browservorschau / fertige GLSkin-Pose verfuegbar. Es wurden **keine** neuen `Glute_L`-/`Glute_R`-Knochen, Hautgewichte, Morph-Targets oder neue Animationsclips in eine Avatar-GLB exportiert. Das bleibt die Aufgabe der Modellierung.
- Die V739-GLB-Motion-Exporte enthalten nur die V739-Knochenkurven; V741-Overlaykanäle werden nicht gebacken.

## Lokal verifizieren

```powershell
npm ci
npm run verify:v741
```

Avatar mit echten GLB-Morphs/gewichteten Knochen in der Vorschau laden. Pruefen: beide Seiten erkannt; Morph/Bone-Override; `Hip_Sway`, `Hip_Circle`, `Hip_Bounce`, Pause, Modellwechsel, manuelle Choreografie, Foot Lock, Gewichtsgrenzen und visuelle Mesh-Verformung (Sichtpruefung der finalen gerenderten Pose). Siehe `V741-GLUTE-RIG-AUTHORING.md`.
