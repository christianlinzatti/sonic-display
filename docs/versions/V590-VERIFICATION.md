# Sonic Display V590 – Prüfergebnisse (26. Oktober 2026)

**Basis:** vollständiges V589-Archiv, erweitert um unabhängigen WebGL-Benchmark-Viewer und lokalen Screenshot-CDP-Runner.

## Tatsächlich bestanden – offline / Quellcode

- `npm run test:v590`: **PASS**, 14 Testgruppen mit **15.000** deterministischen NDC-Bildausschnittproben, Cross-Runtime-Vergleich TypeScript-/Node-Framing, URL-Härtung, Browserrouten/GLB-Clip-Bindung, PNG RGB/RGBA Filter 0–4, Pixelvergleich, HTML-Report/XSS-Escaping und Explizit-Abbruch ohne GLB. Die Abort-Prüfung bestätigt: Exitcode ≠ 0, `report.json: status=blocked`, **null** Screenshots und null Vergleichsergebnisse.
- `npm run test:v590:types`: **PASS** – isolierte TS-Prüfung der neuen getypten reinen Bildausschnitt-/Datenplaner und bisherigen V589-Funktionen. **Kein** vollständiger Next.js-/React-TSX-Typecheck.
- `npm run test:smoke:v590`: **PASS** – zusätzlich V589 (25 Gruppen/10.000 Prüfpunkte), V534 echte GLB-Quellrig-Pose-Analyse und Architekturprüfung.
- `npm run verify:v590`: **PASS**, zusätzlich `test:v589:types`, V588 (16 Gruppen/20.000 simulierte Wiedergabepunkte) samt isolierter Typprüfung, V580 (79 Prüfungen + 12.000 deterministische Samplefälle), V572 (69 Assertions/16.000 Wortzeitproben) und kompletter Quellsyntax-Scan.
- `npm run test:v571`: **PASS**, 46 frühere Build-/CDP-/Ausfallstatus-Regressionsfälle.
- `npm run test:v569`: **PASS**, 33 frühere Pi-Langzeit-/LOD-Ressourcenregressionen.
- `node tests/check-source-syntax.cjs`: **PASS**, 814 TypeScript-/TSX-Dateien (Syntax und doppelte Importbezeichner).
- `node tests/check-architecture.cjs`: **PASS**, 395 vorhandene Pfadreferenzen, zehn Abschnitte, V590-Metadaten.

## Nicht erfolgreich nachgewiesen – klar von oben getrennt

1. **Real laufender Next.js/WebGL-Browser und GLB-Screenshots:** Die Quell-ZIP enthält **keine echten Test-GLBs** und in dieser Umgebung sind die projektspezifischen npm-Pakete nicht installiert. Daher wurde hier **keine** echte mit Chromiums Page.captureScreenshot erzeugte GLB-Abbildung, keine Original-/Folgeclip-Differenz und kein erfolgreicher Frame-Benchmark gemessen. Die CDP-Schritte sind implementiert, aber nicht unter Last verifiziert. Es sind keinerlei Beispiel-Screenshots oder synthetische FPS-Werte im Release-Archiv enthalten.
2. **Vollständiger Next.js-Build:** `npm run typecheck`/`next build` wurden hier mangels `node_modules` nicht erfolgreich ausgeführt. Isolierte TS-Prüfungen und Syntaxprüfung ersetzen diese nicht.
3. **Echter Raspberry Pi, 10-Zoll-Touchscreen, thermische Belastung:** Hier nicht vorhanden, keine realen Temperatur-/GPU-/Pi-FPS-Messungen. Die neue Desktop/Headless-CDP-Routine ist ausdrücklich keine reale Pi-Kiosk-Abnahme.
4. **Vollständige Spotify-Liveshow:** V590 misst eine *separate* 960 × 540 WebGL-Avatar-Vorschau mit echten GLB-Clips; Lyrics, Live-Songsteuerung, Vocal-Timing und Konzertkamera werden nicht gemeinsam im V590-Screenshot gemessen. Dafür bleibt die manuelle V589-Abnahme bzw. eine spätere Live-Show-Integration nötig.
5. **GLB-Retargeting mit gespeicherten Nutzer-Kalibrierungen:** Chromium startet ein temporäres Profil. Individuelle Browserprofil-Kalibrierungen werden nicht automatisch übernommen; retargetete externe GLBs benötigen zusätzliche manuelle Prüfung in der vorhandenen Vorschau.

## Empfohlene lokale Abschlussprüfung

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run build
npm run dev -- --hostname 127.0.0.1
# nach Bereitstellung eines Modells mit zwei gültigen Animationen:
npm run benchmark:v590:visual -- --model=/benchmark/performer.glb --original=0 --following=1 --seconds=15
```

Dann `artifacts/v590/visual/report.html` öffnen, beide GLB-Screenshotreihen manuell prüfen, PNGs mit `report.json` abgleichen, Clip-/Sänger-Kalibrierungen bestätigen und die V589-Sicht-Checkliste benutzen. Wiederholung auf dem **echten** Pi mit `--headed`, zusätzlich den bestehenden V580-Benchmark und Langzeittest durchführen.

**Release-Status:** V590 implementiert und offline regressiongetestet; visuelle Qualität und Hardware-Leistung noch nicht freigegeben.
