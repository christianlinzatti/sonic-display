# Sonic Display V887 – Cinematic Fog & Haze

V887 verfeinert die vorhandenen **V814-Bühnennebel-Flächen**, statt ein zweites
Fog-System, zusätzliche Lichter oder Partikelemitter anzulegen. Der optische
Mehrwert entsteht aus langsamen, steuerbaren Nebelbänken, weichen Lichtkegeln
und genrebezogenen Farben. Die V885-Timeline bleibt die einzige Grundlage
für songbezogene Szenen.

## Bedienung

**✦ LIVE FX → V887 · Cinematic Fog & Haze**: Aktivierung, Bodennebel,
Dunst-Lichtkegel, Lyrics-Schutz, vier Farbprofile (Noir/Electric/Arena/Dream),
Bewegung (Still/Cinematic/Festival) und Stärke (0–100 %). Eine Farb-Vorschau
steht auch ohne verifizierte Timeline bereit; der Szenenplan lässt sich als
JSON exportieren, sobald bestätigte Songabschnitte verfügbar sind.

**Wichtig:** Die bestehenden **atmosphärischen Effekte im Concert FX Studio**
müssen ebenfalls eingeschaltet sein, da V887 sie nur verfeinert. Automatische
Nebelwechsel werden nur bei laufender, verifizierter Song-Timeline angezeigt.

## Prioritäten und Leistung

- Verwendet dieselben zwei V814-Meshes und Shader-Materialien, ohne zusätzliche
  Draw Calls oder Texturen. Bei deaktivierter V887 bleiben die V814-Uniformen
  auf ihrem alten Wert und die neue Shader-Logik abgeschaltet.
- Nie mehr als 0,17 Bodennebel-Alpha und 0,09 Lichtkegel-Alpha; der Shader
  behält ebenfalls seinen transparenten 0,17-Grenzwert.
- Kein Stroboskop, kein Full-Stage-Flash und kein bewegter Schattenwerfer.
- Keine neuen musikalischen Timestamps: nur bestätigte V885-Szenen.
- Vorrang für manuelle Licht-Timelines, Blackouts, Pausen, reduzierten Motion-
  Modus, FX-Overrides, Lyrics-Schutz und die Low-GPU-Stufe.
- Keine lokalen npm-Pakete oder Änderungen am React-/Three-Typensystem.

## Qualitätsprüfungen

`npm run verify:v887:focused` prüft Kern, UI-Typen und die V886-ältere
Regression. Für den Windows-PC:

```powershell
npm ci
npm run verify:v887:focused
npm run check:architecture
npm run typecheck
npm run build
```

Der isolierte UI-Test ist kein Beweis für den vollständigen produktiven
TypeScript-/Next.js-Build. Details: `V887-VERIFICATION.md`.
