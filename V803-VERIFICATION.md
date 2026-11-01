# V803 – Verification (31.10.2026)

## Lieferumfang
- Vollständiges Folgeprojekt von V802. V802-Inspector, vorgeschlagene Kameraalternativen und explizite manuelle V354-Übernahme bleiben erhalten.
- Neues `visualConcertComparisonV803.ts`: reine Plausibilitätsprüfung für V790/V802-Track, Dauer, Szene, ursprüngliche und neue Kameraposition und gemeinsame Songposition. Außerhalb belegter Szenen wird die Vorschau nicht erzeugt.
- Neues `VisualConcertComparisonPanelV803.tsx`: wählbare Szene, gemeinsamer Song-Zeitregler, opt-in rendern/schließen; zurücksetzen bei Entwurfs- und Songwechsel.
- Neues `CameraComparisonCanvasV803.tsx`: eine echte, isolierte Drei.js/React-Three-Fiber-Bühne mit zwei Scissor-Kamerapositionen und *einem* gemeinsamen Renderer/GLB-Modell. Das ausgewählte GLB wird nur für den geöffneten Vergleich geklont; vorhandene Skinned-Mesh-Cleanup-Logik wird verwendet. Ohne GLB ausdrücklich Demo-Performer. Ein vorhandener eingebetteter erster Animationsclip wird einmal bei der gemeinsamen Zeitposition angehalten.
- Aktuelle Avatar-URL und Bühnenstil aus den Einstellungen erreichen das Quality Dashboard und die Vergleichsansicht. Keine Änderung am Live-Kameraeditor, an der Manual Show Timeline oder an Sänger-/Lyrics-Zeitmarken.

## Erfolgreiche Prüfungen
- `npm run test:v803`: **40 Testgruppen und 2.400 reproduzierbare Szenenzeit-Proben** bestanden. Inklusive Fail-Closed-Identitätsprüfung, Kamera-/FOV-Grenzen, kein Pixel-Qualitätsscore, V354-Merge-Schutz und statischer Scissor-Render-Verkabelung.
- `npm run test:v803:types`: isolierter strenger TypeScript-Check des reinen Vergleichsplaners bestanden.
- Isolierte TypeScript-Checks `test:v790:types` bis `test:v803:types` bestanden.
- Relevante Regressionen `test:v790`–`test:v802` bestanden (ein V798-Test hatte eine veraltete Release-Gate-Ausdrucksform mit Kommaoperator; diese wurde korrigiert und V798 anschließend erfolgreich erneut ausgeführt).
- `check:syntax`: 1.154 TypeScript-/TSX-Dateien auf Syntax/Importbindungen erfolgreich geprüft.
- `check:architecture`: Versionsstand V803, 841 Code-Referenzen erfolgreich geprüft.
- `test:module-case`: 1.959 Quelldateien ohne Windows/Linux-Dateinamenkollisionen geprüft.
- `check:lockfile:v752`: Lockfile, 18 deklarierte direkte Pakete und CI-Regeln erfolgreich geprüft.
- Vollständiges ZIP: 1:1-Erhalt sämtlicher V802-Dateien zuzüglich V803-Code, -Tests und Dokumentation; ZIP-Integrität nach Erstellung verifiziert.

## Nicht verifiziert / offene Freigabegrenzen
- **Vollständiger TypeScript-Check fehlgeschlagen (npm-Exitcode 1):** `tsc --noEmit` findet unter anderem die nicht installierten Typdefinitionen von React, Next.js, Node und Three.js nicht. Die isolierten Checks können das nicht ersetzen.
- **Next.js-Produktionsbuild fehlgeschlagen (Exitcode 127):** `npm run build --ignore-scripts` endet mit `next: not found`, weil die npm-Abhängigkeiten fehlen. Die produktive Preflight-Kette samt `next build` kann daher nicht als erfolgreich gelten.
- **Kein Browser-/GPU-/GLB-Rendering ausgeführt.** Die echte visuelle Qualität sowie Licht-/Animationsdarstellung sind vor einer Freigabe auf dem Entwicklungsrechner mit installierten Paketen zu prüfen.
- Die A/B-Ansicht rendert echte 3D-Geometrie mit angenäherten Kameraposen, *keine* finale Live-Kamera aus V289/V747/V797, *keine* Original-Song-Licht-Cues, keine exakten Vocal-/Lip-Sync-Passagen und keine renderbasierten Qualitätsmesswerte. Eine alleinige Strukturindex-Verbesserung ist kein visueller Abnahmebeleg.
- Bei geöffneter V803-Vorschau ist ein **zusätzlicher** WebGL-Kontext aktiv; keine zwei parallelen Vergleichs-Canvas. Nach Schließen wird die Vergleichs-Canvas demontiert.

## Empfohlene Abnahme auf Windows
1. `npm ci` mit Node 22+ und vollständigen Variablen gemäß `.env.example`.
2. `npm run typecheck`, `npm run build`, relevant `npm run test:v803` und gesamte Preflight-Regression.
3. In der laufenden Avatar-Bühne einen Song mit echten bestätigten Szenen abspielen und unter Einstellungen → Concert Quality Dashboard → V802 eine Kameraänderung auswählen.
4. V803 öffnen, den GLB-Performer in beiden Ansichten bei mehreren Songpositionen vergleichen. Bühnentyp, Kameraperspektiven, Animationspose, Browser-Konsole, Rendering, GPU-Auslastung und Cleanup beim Schließen prüfen.
5. V802-Übernahme ausschließlich bei vorher aktivierter passender V354-Timeline bewusst testen. Keine manuellen Kamera-/Licht-Cues überschreiben.
