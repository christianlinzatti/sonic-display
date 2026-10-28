# V622 – Verifikation (27.10.2026)

## Bestanden (hier ausgeführt)

- `npm run test:v622`: **40 Regressionstest-Gruppen** und **16.156** deterministische Songzeitpunkte mit bestätigten V604-Akten, Track- und Zeitgrenzen, farblich verschiedenen Hooks, Pausen, Seeks, manuellen Lichtprogrammen, Blackouts, Reduced Motion, Lyrics und Gerätetiers.
- `npm run test:v622:types`: TypeScript-Kernprüfung erfolgreich.
- `npm run test:smoke:v622`: vollständig bestanden, einschließlich `test:v621`, `test:v620`, `test:v619`, `test:v618`, `test:v617`, `test:v609` und Architekturprüfung.
- `npm run verify:v622`: vollständig bestanden, einschließlich `test:v608`, `test:v610`, `test:v611`, `test:v601`, `test:v542`, Syntaxprüfung.
- Zusätzlich: `test:v621:types`, `test:v620:types`, `test:v601:types`, `test:v609:types`, `test:v551`, `test:v555`, `test:v602` bestanden.
- `check:syntax`: **846** TS/TSX-Dateien analysiert, Imports gültig.
- `check:architecture`: **498** Quellpfadrelevanzen, zehn Dokumentationsabschnitte, V622-Kennung.

## Nicht nachgewiesen

Ein vollständiges `npx tsc --noEmit` sowie `npm run build` konnten in der eingeschränkten Umgebung ohne vollständige Next.js-Abhängigkeiten nicht abgeschlossen werden. Visuelle Effekte und GPU-Framerates wurden nicht mit realen GLB-Avataren im Browser gemessen. Es gibt auch noch keine Raspberry-Pi-Hardware.

## Lokale Windows-Prüfung

```powershell
npm run test:smoke:v622
npm run verify:v622
npx tsc --noEmit
npm run build
```

Für visuelle Abnahme: Musikstück mit zwei bis vier GLB-Avataren, Deutschrap/Hardtekk/Hardstyle, alle Songabschnitte einschließlich wiederholter Hooks und Bridge; manuelle Lichttimeline und reduzierte Bewegung gegentesten. Mit V590/V591 Frametimes vergleichen.
