# V557 – Avatar Concert Lighting & Duet Focus (25.10.2026)

## Neue Bühnenwirkung

- Die **bestehenden** beiden `pointLight`-Lichtquellen in `DynamicStage.tsx` beleuchten die real gerenderten Avatar-Materialien jetzt gezielter. In Solo-Szenen folgt das Key-Light dem tatsächlichen Performer-Root (`v377-vocal-stage-slot-0`), bei bestätigt verifiziertem V528-Gesang dem jeweiligen Lead und – kurz beim Sängerwechsel oder im gemeinsamen Hook – einem bestätigten zweiten Performer. Die gemessenen Weltkoordinaten werden sanft nachgeführt, ohne zusätzliche 3D-Lichter, Shadows, Animation-Clocks oder Renderloops.
- Der reine Planer `components/visualizer/performerLightingV557.ts` steigert Face-/Fill-Licht bei Hooks begrenzt; dichte Rap-Zeilen regeln zusätzliche Akzente zurück. Über `concertAvatarLightV557` und `concertAvatarLightStrengthV557` im Einstellungsbereich **Konzert-Bühneneffekte** steuerbar. Die V555-Hauptoptionen und die V556-Gobo-/LED-/Textbudgets bleiben erhalten.
- Die große `StagePreviewModal.tsx`-Vorschau nutzt denselben Planer sowie dieselbe reale R3F-Lichtsteuerung auf **einfachen Demo-Silhouetten**, jetzt einschließlich **Duett (Demo)**. Die Figuren sind keine importierten GLB-Avatare und die Rollen sind im Demo-Modus simuliert und klar gekennzeichnet.

## Schutzgrenzen

- Authored-Licht-Timeline, bewusst deaktiviertes Licht und Blackout haben Vorrang. Keine Verfolgung auf Low-Tier/Pi, bei Pausen oder reduzierter Bewegung. Fehlende oder ungültige Rollen führen zu neutraler Gruppenbeleuchtung – **nie zu einer geratenen Sängerzuordnung**.
- Die Handoff-Hervorhebung des vorherigen Darstellers endet nach 1050 ms. Die Ausgangsposition der Lichtquellen wird bei fehlender Berechtigung weich wiederhergestellt. Nur tatsächliche und sichtbare Bühnen-Anker werden verfolgt.
- Keine Änderungen an Lyrics, Wort-Timestamps, Kamera-Sicherheit, Lip-Sync, Tanz-Retargeting oder Avatar-Materialien. Avatar-Materialien, die nicht auf dynamisches Licht reagieren (z. B. `MeshBasicMaterial`), zeigen die neue direkte Beleuchtung nicht automatisch.

## Prüfung

`npm run verify:v557` für V557-Tests, V556–V554-Regressionen, Syntax- und Architekturcheck. Die V557-Suite enthält 15 Prüfungen für Handoff, Cast-Validierung, Hooks, dichte Rap-Zeilen, Blackouts, Pausen, Low-Tier und Settings. V551–V553-Regressionsprüfungen wurden ergänzend ausgeführt.

**Offen:** vollständiger Next.js-Produktionsbuild mit installierten `node_modules`, tatsächliche WebGL-Lichtwirkung auf importierten GLB-Avataren, 10-Zoll-Kontrastprüfung und Raspberry-Pi-FPS-/Temperaturmessung. Tests mit synthetischer Vorschau sind kein Ersatz für die optische Abnahme.
