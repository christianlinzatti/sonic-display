# V869 – Advanced Deutschrap Lip-Sync 6.0

**Ziel:** Glaubwürdigere Reaktionszeiten bei schnellen Deutschrap-Passagen und klar getrennte Inszenierung von bestätigter Hauptstimme, Duett und ausdrücklich zugewiesenen Adlibs.

## Integration

- `components/visualizer/deutschrapVocalDirectorV869.ts`: rein funktionaler, track-/zeit-/slot-gebundener V869-Cue. Nutzt die vorhandenen, verifizierten Wortgrenzen des V837-Cues sowie im Mehr-Avatar-Modus die ausdrücklich authorisierte V632-Vokalbesetzung. Ohne verifizierte Daten wird kein zusätzlicher Rap-Cue aktiviert.
- `components/visualizer/VocalRigV368.tsx`: in der **einen bestehenden** per-Frame-Morph-Interpolation verwendet. Es gibt keinen zweiten Lip-Sync-Renderer. Automatische Jaw-/Vokal-Reaktionszeiten werden moderat skaliert, `lipsClosed` bleibt vom V869-Multiplikator unberührt. Augenbrauen, Wangen und Squint erhalten bei erlaubter Performance lediglich kleine, begrenzte Zusätze zu **bestehenden** Kanalzielen.
- `authored-adlib`: nur bei gültigem, aktivem V632-Song-/Slot-/Zeitintervall mit `scene === 'adlib'` und expliziter `backing`-Rolle. Die Dauer eines Adlib-Cues ist **kein** Phonem- oder Silbennachweis: V869 erzeugt deshalb **keine** neuen Adlib-Mundziele und unterdrückt für diese Rolle die sonst mitlaufenden V572/V581/V597/V612/V617/V631/V686/V837/V798-Worttempo-Multiplikatoren des Leads. Bestehende V632-Mundzielskalierung bleibt in Kraft.
- `duet-response`: setzt einen aktiven, verifizierten V837-Wortcue **und** eine explizite `duet`-Rolle in V632 voraus; schwächerer Akzent als beim Lead.

## Prioritäten / Grenzen

Manuelle GLB-/Viseme-/Rap-Silben- und Audio-Mundquellen, Preview-Modus, reduzierte Bewegung und low-tier haben Vorrang. Es werden keine Phoneme, Sprecher, Adlib-Timestamps oder isolierten Stimmen aus Lyrics erfunden. Kein Audio-ML-Modell, kein neuer AnimationClip, kein neuer Timer, keine Änderungen an Händen, Füßen, Becken, Kamera oder Bühnenregie. Hohe Qualitätsstufe bleibt bis zur realen Build-, Windows-, WebGL- und Audio-Abnahme **unbestätigt**.

## Prüfungen

`npm run test:v869` und `npm run test:v869:types` sowie ältere V686-, V837-, V632- und Release-Regressionsprüfungen. Außerdem `npm run check:syntax`, `npm run check:architecture`, `npm run typecheck`, `npm run build:flat` und `npm run verify:production:v867` nach vollständigem `npm ci` auf dem Zielsystem.
