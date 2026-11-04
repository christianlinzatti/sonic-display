# V902 – Prüfung und Release-Status

## Bestätigte Prüfungen

- [x] **Neue V902-Regressionssuite:** `npm run test:v902` – **1.375/1.375** Prüfungen erfolgreich. Enthält Preview-/Bestätigungsablauf, deaktivierte Effekte, Vorher-/Nachher-Werte, invalidierte Vorschau, manuelle Rücksichtnahme, fehlende Messwerte, 1.100 deterministische Settings-Sweeps und bestätigte Songabschnitte.
- [x] `npm run test:v902:types` und `npm run test:v902:ui-types`: isolierte TypeScript-Prüfungen für Advisor-Kern und LIVE-FX-Integration erfolgreich. Dedizierte Teststubs ersetzen keine produktiven React-Typen.
- [x] **Direkte Regressionen V880–V901**: alle 22 einzelnen `npm run test:vNNN`-Befehle erfolgreich. Ausschließlich ältere Paketversions-Assertions und ein Dokumentationsstand-Hinweis wurden auf V902 erweitert; die eigentlichen Funktionsprüfungen nicht abgeschwächt.
- [x] Fokussierte Kette `npm run verify:v902:focused` hat die Tests/isolierten TypeScript-Prüfungen **V902 bis V896** erfolgreich abgeschlossen; danach wurde sie **durch Tool-Zeitlimit beendet**. Kein vollständiger Exit-0-Lauf der verketteten Kette – historische direkte Tests und nachstehende Kontrollen separat abgeschlossen.
- [x] Ältere gezielte Testgruppen: V604 **65 Gruppen/40.000 Songpositionen**, V825 **50**, V826 **56**, V827 **64** und V834 **52** erfolgreich.
- [x] `npm run check:syntax`: **1.314 TS/TSX-Dateien** und ihre Imports erfolgreich.
- [x] `npm run test:module-case`: **2.250 Quelldateien**, keine Windows-relevanten TypeScript/TSX-Casingkollisionen.
- [x] `npm run check:architecture`: **1.081 aktuelle Quellcode-Verweise** und 10 Dokumentationsabschnitte erfolgreich.

## Weiterhin nicht für Produktion freigegeben

- [ ] `npm ci --offline --ignore-scripts --no-audit --no-fund`: **Exit 1**, wegen nicht gecachtem Paket **`zustand@5.0.16`** (`ENOTCACHED`).
- [ ] `npm run typecheck`: **Exit 2**, u.a. fehlende Next.js-, React- und Node-Typen. Isolierte erfolgreiche Typprüfungen sind **kein Ersatz**.
- [ ] `npm --ignore-scripts run build`: **Exit 127**, **`next: not found`**. Ein vollständiger Next.js-Produktionsbuild wurde nicht ausgeführt und gilt ausdrücklich als **nicht bestanden/nicht bestätigt**.
- [ ] Browser/WebGL-Test auf Windows mit echten GLB-Avataren, synchronisierten Lyrics und automatischer Kamera; FPS und Bildqualität vor/nach einer Vorschlagsübernahme im echten Browser vergleichen.

## Funktionalitätsgrenzen

V902 verarbeitet ausschließlich V901-Konfigurationswarnungen und gemessene V826-Renderer-Frames (falls vorhanden). Es gibt **keinen** generativen KI-Dienst, keine neue Audioanalyse und keine optische Erkennung von Kamera-Framing, Lyrics-Lesbarkeit oder Tanzqualität. Bei unbestätigten Songabschnitten, pausierter/deaktivierter Automatik und fehlenden Messwerten entstehen keine leistungsbezogenen Änderungsvorschläge. Die Senkung der Effektintensität garantiert **keinen** FPS-Gewinn; sie begrenzt in erster Linie vorhandene visuelle Akzente. Manuelle Shows werden nicht editiert; die vorhandenen Timeline-Sperren gelten weiterhin.

Die UI erfordert für **jede einzelne Änderung** ausdrücklich (1) Vorschau anzeigen, (2) Diese Änderung bestätigen. Bei geänderter Szene, nicht mehr bestehender Warnung oder geänderter Einstellung wird die Bestätigung blockiert. Der übernehmende React-State-Setter prüft den ursprünglichen Wert erneut.

## Windows-Freigabeprüfungen (mit vollständiger npm-Installation)

```powershell
npm ci
npm run verify:v902:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ: `powershell -ExecutionPolicy Bypass -File scripts/verify-v902-windows.ps1`. Vor Produktiveinsatz ist ein realer WebGL-Stresstest zwingend.
