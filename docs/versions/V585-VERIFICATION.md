# Sonic Display V585 – Verifikationsbericht, 26.10.2026

## Bestandene Prüfungen (lokal / offline)

- `npm run test:v585`: **8 neue Testgruppen** für Verifikation von Kamera-Cues, reale Bühnenanker, 2–4 Rollen, Hook-Weitwinkel, Bildausschnitt/Head/Fullbody/Lyrics-Schutz, Pausen, Seek-Stabilität, Blickkoordination, keine neuen Render- oder Netzwerkprozesse und langlaufende deterministische Zeitproben.
- `npm run test:v585:types`: isolierte TypeScript-Prüfung V585/V584/V550/V540/V528/V500 **bestanden**.
- `npm run test:v584`: **18** Prüfgruppen bestanden.
- `npm run test:v583`: **55** Prüfungen bestanden.
- `npm run test:v582`: **64** Prüfungen bestanden.
- `npm run test:v581`: **63** Prüfungen bestanden.
- `npm run test:v580`: **79** Prüfungen + **12.000** deterministische Zeitproben bestanden.
- `npm run test:v550`: **9.720** geprüfte Bild-/Rollen-/Zeit-Szenarien bestanden.
- `npm run test:v540`: **8.640** Bildausschnitt-/Lyrics-/Avatar-Szenarien bestanden.
- `npm run test:v528`: **3.600** Singer-Szene- und Lyrics-Fälle bestanden.
- `npm run test:v500`: V500-Sänger-/Solo-/Reply-/Hook-Invarianten, insbesondere *Solo-Lead schaut zum Publikum*, bestanden. Neue wechselseitige V585-Blicke sind daher nur in expliziten Reply-Passagen erlaubt.
- `npm run test:v504`: **24.000** Formations-/Choreografie-Samples bestanden.
- `npm run test:v563`: **43** GLB-Duett-Vorschauprüfungen bestanden.
- `npm run test:v572`: **69** Checks und **16.000** Wort-Samples bestanden.
- `npm run check:syntax`: **804** TypeScript-/TSX-Dateien auf Syntax und Importbindungen geprüft.
- `npm run check:architecture`: **374** überprüfte Quellcodepfade, zehn Dokumentationsabschnitte, V585-Version stimmt überein.

Alte V528/V540/V550-Regressionen wurden so angepasst, dass sie jetzt die tatsächliche Reihenfolge **V550 → V585 → V351** überprüfen, statt auf einen nicht mehr vorhandenen Direktaufruf V550 → V351 zu bestehen. Die ursprünglichen Bildausschnitts- und Prioritätsprüfungen sind weiterhin aktiv.

## Laufzeitgrenze

Der kombinierte Befehl `npm run test:smoke:v585` wurde durch das Ausführungslimit während des abschließenden Source-Scans abgebrochen. Die bis dahin protokollierten V585-, V584-, V583-, V582-, V581-, V580-, V550- und V528-Schritte waren erfolgreich; `check:syntax` sowie `check:architecture` wurden separat erfolgreich ausgeführt. Ein *vollständiger* kombinierter Testlauf wird nicht behauptet.

## Offen / nicht behauptet

- Keine installierten `node_modules` und keine vollständige `package-lock.json` in der gelieferten Basis. `npm run typecheck` für das **gesamte** Next-Projekt und `npm run build` wurden hier nicht erfolgreich nachgewiesen.
- Kein realer Video-/Chromium-GLB-Test und keine Raspberry-Pi-FPS-/Frame-Time-Messung.
- V540/V550-Screenspace-Messungen sind konservative geometrische Näherungen, keine garantierte visuelle Freigabe.

## Reproduktion auf dem Entwickler-PC

```powershell
npm install --no-audit --no-fund
npm run test:smoke:v585
npm run verify:v585
npm run typecheck
npm run build
```

Echte Hardware- und Sichtkontrollen: `V585-CINEMATIC-DUET-CAMERA-FACIAL-INTERACTION-4.md` und `V580-CONCERT-EXPERIENCE-3.md`.
