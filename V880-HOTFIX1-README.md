# Sonic Display V880 – Hotfix 1

Build-Sperren in V880 behoben:

1. `components/visualizer/AvatarEditor.tsx`: Der als Prop deklarierte Wert `danceContinuityV872` wird in `GltfPreview` nun auch destrukturiert. Behebt TS2304 aus `npx tsc --noEmit`.
2. `tests/v849-intelligent-concert-transitions-regression.cjs`: Der ursprüngliche V849-Test verlangte die direkte Nachbarschaft `ledGainV823*(`. In V880 steht dazwischen der gültige zusätzliche Faktor `concertArcLedGainV880`. Der aktualisierte Test prüft weiterhin den V823-Gain und die V849-Szenenblendung mit dem expliziten Override durch manuelle LED-Timeline-Effekte. Die produktive LED-Berechnung wurde **nicht verändert**.
3. `tests/v872-natural-dance-continuity-regression.cjs`: zusätzliche Regression für das tatsächliche Prop-Destructuring im Avatar-Preview.

Die vollständige Version wurde aus der unveränderten V880-Vollversion gepatcht. Die Version in `package.json` bleibt absichtlich `0.1.0-v880`, um bestehende Release-Skripte nicht zu brechen. Kein weiteres Versionsfeature ist enthalten.

## Lokal unter Windows prüfen

```powershell
npm ci
npm run test:v849
npm run test:v849:types
npm run test:v872
npm run test:v872:types
npm run test:v880
npm run test:v880:types
npx tsc --noEmit
npm run build
```

Oder `powershell -ExecutionPolicy Bypass -File .\scripts\verify-v880-hotfix1-windows.ps1`.

**Hinweis:** Die npm-Abhängigkeiten können hier nicht vollständig installiert werden. Deshalb ist der vollständige Next.js-Produktionsbuild in dieser Umgebung nicht bestätigt. Gezielte Tests wurden hier ausgeführt und im Ergebnis dokumentiert.
