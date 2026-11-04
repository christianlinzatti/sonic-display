# V633 – Verifikation (27.10.2026)

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v633` | PASS – 55 Testgruppen; 10.000 simulierte 2–4-Avatar-Kamerazustände mit projizierter Cast-/Lyric-Sicherheit |
| `npm run test:v633:types` | PASS – TypeScript-Kernprüfung inklusive V604/V540/V550/V620 |
| `npm run test:smoke:v633` | PASS – V633 bis V616, weitere geerbte Regressionen, Syntax- und Architekturprüfung |
| `npm run verify:v633` | PASS – plus V620, V605, V613, V606, V540, V550, V585, V632, V604, V351, V377, V378, V400, V432, V609 und V610 |
| `npm run check:syntax` | PASS – 857 TS-/TSX-Quellcodedateien |
| `npm run check:architecture` | PASS – 514 Quellcode-Referenzen, 10 Abschnitte |
| ZIP-CRC, Pflichtdateien, Eindeutigkeit | PASS |
| Vollständiges `npx tsc --noEmit` | Nicht ausgeführt – nötige npm-Abhängigkeiten sind hier nicht installiert |
| `npm run build` | Nicht ausgeführt – Next.js-Abhängigkeiten hier nicht installiert |
| Browser-Test mit realen 2–4 GLB-Avataren und echten Songs | Noch offen |

## Sicherheit/Limitierungen

- Nur echte V528-Sängerzuweisungen berechtigen zu automatischen Portrait-/Duett-/Handoffshots; allein aus V604 wird ausschließlich eine dezente weite Bühne abgeleitet, kein geratener Lead.
- Song-ID, Cue-Zeiten, sichtbare echte Stage-Roots, manueller Editor, authored Kamera/Timeline, Reduced Motion, niedriger Grafikmodus und die vorhandenen Lyrics-Schutzzonen bleiben harte Grenzen.
- Drei feste Kandidaten werden rein geometrisch geprüft: V550-Kopf/Ganzkörperprojektion für Cast und Sänger sowie V540-Bildschirm/Lyrics-Rand. Kein Beweis echter Pixel-Okklusion, keine echte Kamerafahrt im Browser validiert.
- Der seit V378 vorhandene Versionstest wird nicht mehr künstlich bei Version V416 abgeschnitten; alle bisherigen Funktionstests bleiben unverändert erhalten.
- Keine neuen 3D-Ressourcen, Renderer, Renderloops oder externen Calls; die zusätzliche CPU-Berechnung pro Frame ist vor einem Hardware-Release im realen Browser zu messen.

Windows: `npm install`, `npm run test:smoke:v633`, `npm run verify:v633`, `npx tsc --noEmit`, `npm run build`.
