# V745 – Verification (30.10.2026)

Basis: `sonic-display-v744-smart-choreography-3.zip`.

| Pruefung | Ergebnis |
|---|---|
| `npm run test:v745` – Rollen, Auto/Sync/Stagger/Call-Response, Grenzen, Seek/Trackwechsel, V742/V744/V738-/Foot-Kontakt-Integration sowie reale 2er/3er/4er-Cast-Weitergabe im Quellcode | PASS – **244.927 Assertions** |
| `npm run test:v745:types` – isolierter TypeScript-Check von V745/V744/V742/V738 | PASS |
| Regressionen V744, V743, V742, V741, V740, V739, V738, V737, V736, V735, V665 und V666 | PASS |
| `npm run check:syntax` | PASS |
| `npm run check:architecture` | PASS |
| `npm run test:module-case` | PASS |
| `npm ci --offline` | BLOCKIERT: `ENOTCACHED` fuer `zustand-5.0.16.tgz` |
| `npm run typecheck` – gesamtes Projekt | NICHT ERFOLGREICH: fehlende React-/Next-/Node-Pakete bzw. Typen |
| `npm run build` – Next.js-Produktionsbuild | BLOCKIERT in `prebuild → check:fast → check:dependencies` (0/18 Pakete installiert) |
| Echte GLB-/Browser-/GPU-Regression mit 2–4 Darstellern | NICHT AUSGEFUEHRT |

**Status:** Quellcode- und isoliert typgepruefter Buildkandidat, **keine verifizierte Produktionsfreigabe**. Die bestandenen Logiktests sind keine Aussage ueber gerenderte Animation oder reale Fussbewegung. Auf einem Rechner mit Registry-Zugang zuerst `npm ci`, danach `npm run verify:v745`, `npm run typecheck` und `npm run build`. V742/V744-Strukturtests wurden an die neue V745-Datenflussstufe angepasst; ihre numerischen Tests blieben unveraendert.
