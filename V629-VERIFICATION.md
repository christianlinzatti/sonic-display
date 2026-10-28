# V629 – Verifikation (27.10.2026)

## Ausgeführt und bestanden

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v629` | PASS – 50 Regressionstest-Gruppen, 21.600 simulierte Song-Zeitpunkte |
| `npm run test:v629:types` | PASS – TypeScript-Kernprüfung (Standalone-Shims) |
| `npm run test:smoke:v629` | PASS – V629 sowie V628–V616, Syntax und Architektur |
| `npm run verify:v629` | PASS – Smoke sowie V604/V611/V613/V606/V351/V595 und V627-Typen |
| `npm run check:syntax` | PASS – 853 TS/TSX-Dateien |
| `npm run check:architecture` | PASS – 508 interne Pfadreferenzen, zehn Architekturkapitel |
| `npx tsc --noEmit` | Nicht ausgeführt – keine vollständigen Projektabhängigkeiten installiert |
| `npm run build` | Nicht ausgeführt – keine vollständigen Projektabhängigkeiten installiert |
| Reale GLB-/Spotify-Sichtprüfung | Ausstehend – Browser, reale Avatare/Lyrics und vollständiger Song nötig |

## Sicherheitsnachweise

- V629 übernimmt V628s aktiven, sicheren V623-Score, nicht einen zweiten Regiepfad.
- Die gesamte Songfolge wird ausschließlich aus sortierten, verifizierten V604-Akten mit passenden Wiederholungszählern vorgeplant. Stale Track, Abschnitt, Aktzeit, Quellenlabel, Wiederholung, Kapitel und Motiv verhindern neue Eingriffe.
- Zweiter/dritter Hook erhalten unterschiedliche, begrenzte und deterministische Schwerpunkte; nach belegten Höhepunkten folgt ein bewusst ruhigerer Abschnitt.
- Ein Finale wird **nicht** allein aus relativer Songzeit abgeleitet, sondern nur mit dem bereits verifizierten V604-Ende.
- Die neue Zusatzamplitude verschwindet kontinuierlich an Abschnittsgrenzen und passt sich dem schon vorhandenen V604-Blend an.
- Lyrics-/Vokalfokus lassen keine zusätzliche dekorative Verstärkung zu. Unbestätigte Drops werden nicht durch V629 künstlich intensiviert.
- Manuelle Tanz-, Kamera- und Lichtwerte sowie Pause, Reduced Motion und Low-Tier haben Vorrang. Kein zusätzlicher Renderloop, GLB-Clip, Shader, GPU-Licht oder Netzwerkzugriff.
- Synthetische Tests sind **kein Beleg** für schöne, nicht-repetitive Bewegungen in einer echten WebGL-Aufführung; dafür sind visuelle Ganzsong-Vergleichstests nötig.

## Lokale Freigabe

```powershell
npm install
npm run test:smoke:v629
npm run verify:v629
npx tsc --noEmit
npm run build
```

Danach verschiedene vollständige Deutschrap-, Hardstyle-/Hardtekk- und Rock-/Pop-Songs mit mehreren GLB-Avataren, Lyrics und verschiedenen Bühnenmotiven in der V627-Auswertung sowie visuell vergleichen.
