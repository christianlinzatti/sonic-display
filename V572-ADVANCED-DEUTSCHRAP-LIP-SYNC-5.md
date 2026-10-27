# V572 – Advanced Deutschrap Lip-Sync 5.0

Stand: 25.10.2026. Status: gezielte Regressionen / isolierter TypeScript-Bereich; **nicht** als Next.js-, echter WebGL- oder Raspberry-Pi-Produktionsbuild freigegeben.

## Ziel

Dicht aufeinanderfolgende, **tatsächlich zeitmarkierte** Deutschrap-Wörter sollen etwas knackigere Kieferansprachen erhalten, ohne dass seitliche Lippenformen bei schnellen Wortwechseln hektisch springen. Es werden keine neuen (und insbesondere keine erfundenen) Phonem-, Silben- oder Sänger-Zeitstempel erstellt.

## Umsetzung

- `components/visualizer/rapMouthDynamicsV572.ts` wählt ausschließlich zwischen drei **unveränderlichen, wiederverwendeten** Plänen: aus, zusammenhängender Rap und dichter Rap. Gültige, vorhandene Lyrics-Wörter müssen zum aktuell bestätigten Wort passen. Dauer und Nachbarabstände bestimmen nur die *Wortdichte*, keine Aussprache.
- Die GLB-`VocalRigV368.tsx`-Engine verwendet das Ergebnis nach V546 für eine konservative Anpassung der ohnehin vorhandenen exponentiellen Morph-Interpolation: schnellerer Kiefer-Attack, leicht geglättete `wide`/`round`-Wechsel. Die **Mundziele** selbst, die V384/V415-B/P/M-Verschlüsse und die Kiefer-/Morph-Kalibrierung bleiben unverändert. Andere Kanäle, GLB-Tanzclips, IK, Kamera und Lyrics werden nicht beeinflusst.
- Bei fehlenden/ungültigen Wörtern, Pausen, Positionssprüngen in Wortlücken, reduzierter Bewegung, Low-Tier, nicht aktivem Rap, fehlender bestätigter Sängerrolle, V420-Edits, V423-Audio-Mundbewegungen und manuellen Gesichts-Keyframes fällt die Logik sofort auf das bisherige Tempo zurück. Mehrere Sänger werden nicht aus Künstlernamen geschätzt.
- Keine zusätzlichen `useFrame`-Callbacks, Shader, Lichter oder Netzanfragen. Die drei Planobjekte sind `Object.freeze`-Konstanten und erzeugen in der Animationsschleife keine wachsenden Caches. Die existierende Gesichtsanimation ist für normale singende Passagen unverändert.

## Überprüfung

```powershell
npm run test:v572
npm run test:v572:types
npm run test:smoke:v572
npm run verify:v572
```

V571 trennt weiterhin den kurzen Entwicklungs-Prebuild von der langen historischen Testkette. Für den **echten** Installations-/Build-Nachweis auf Windows:

```powershell
npm install --no-audit --no-fund
npm run typecheck
npm run build
npm run test:v571:browser
```

Die fehlende `package-lock.json` darf nicht frei erfunden werden; sie wird von einem echten `npm install` erzeugt und danach versioniert. Ein tatsächlicher A/B-Vergleich mit geeigneten GLB-Mundmorphs und schnellen Deutschrap-Songs sowie ein Raspberry-Pi-Langzeittest bleibt eine **manuelle offene Abnahme**. Das reine Vorhandensein von Timestamps beweist keine reale Silben- oder Lippenpräzision.
