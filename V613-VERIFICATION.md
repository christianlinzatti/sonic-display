# V613 – Test- und Release-Verifikation (27.10.2026)

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v613` | PASS: 16 Regressionstest-Gruppen, 15.192 Bildschirm-/Songzeit-Snapshots, 11.379 numerisch angepasste sichere Kameraposen |
| `npm run test:v613:types` | PASS: isolierter TypeScript-Typcheck |
| `npm run test:smoke:v613` | PASS: V613/V612/V611/V610/V605, V597/V581/V582/V562/V572/V546, Syntax und Architektur |
| `npm run verify:v613` | PASS: erweiterte Offline-Regressionskette (vor der letzten rein neutralen Intervall-Optimierung); finaler Smoke-Test nach dieser Optimierung erneut PASS |
| `npm run check:syntax` | PASS: 837 TS-/TSX-Dateien |
| `npm run check:architecture` | PASS: 470 referenzierte Quellcodepfade |
| `npm run test:all` | Nur als optionaler lokaler Befehl ergänzt. **Nicht** alle 642 individuellen Tests in dieser Umgebung ausgeführt. |
| `npm run build` | **Nicht in dieser Umgebung ausführbar:** Next.js-/React-/Three.js-Pakete (`node_modules`) sind hier nicht installiert. **Lokaler Windows-Build noch nötig.** |

**Ausführungsumgebung:** Node v22 auf Linux mit verfügbarem `tsc`; Quellbasis: das bereits korrigierte V612-Windows-Testarchiv. Reale visuelle GLB-Konzertabnahme ist ausdrücklich offen.

## Lokale Windows-Kontrolle

```powershell
npm install
npm run test:smoke:v613
npx tsc --noEmit
npm run build
npm run test:all   # optional: 642 individuelle Testskripte, kann sehr lange laufen
```

Zusätzliche manuelle Sichtprüfung: zwei vollständige, synchronisierte Songs (Deutschrap und Hardstyle), mit 1, 2 und 4 geladenen GLB-Performer-Slots. Augenmerk auf dauerhafte Gesichts-/Lyrics-Lesbarkeit, Songübergänge, sauberes Bildfeld und reale FPS bei `/benchmark/v590` und `/benchmark/v591`. Kein verifizierter Pi-FPS-Wert.
