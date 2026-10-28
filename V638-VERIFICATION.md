# V638 – Verification (27.10.2026)

## Neue Prüfungen
- `npm run test:v638`: **PASS – 59 Regressionstest-Gruppen, 12.000 simulierte 2–4-Avatar-Zustände**. Unter anderem Track-Bindung, Genre, Lead-/Begleiterrollen, Duett-/Hook-Varianten, deterministic Seek, Invalid-Data Guards, Low-Tier, Manual, Pause, Reduced Motion, bekannte Kollisionsmesswerte und tatsächliche V494-Fußkontaktzustände.
- `npm run test:v638:types`: **PASS – TypeScript-Kernprüfung**.
- `npm run test:smoke:v638`: **PASS – vollständige Kette bis V616, TS/TSX-Syntax (862 Quelldateien), Architektur (518 Referenzen)**.
- `npm run verify:v638`: **PASS – zuerst vollständig am ursprünglichen V638-Code.** Nach zusätzlicher Konservativabsicherung ungültiger Kollisionsrisiken wurden neue V638-, scoped TypeScript-, Syntax- und die vollständige Smoke-Kette erneut erfolgreich ausgeführt. Der nochmalige zusammengesetzte Verify-Aufruf erreichte wegen Prozess-Zeitlimits nur die V509-Prüfung. **Die verbleibenden Schritte V548, V506, V508, V494, Syntax und Architektur liefen danach erneut separat erfolgreich**. Alle Einzelbestandteile der Verifikationskette liegen damit als PASS vor.

## Beibehaltende Sicherheitsgrenzen
- V517/V495 autorisieren dieselbe Track-gebundene Ensemblequelle; Visual-only-Lead wird nicht als Vocalsänger behandelt.
- Authored Duo/Vocal-Quellen erhalten **keine zusätzlichen Root-Offsets**.
- Automatische 3/4-Avatar-Z-Tiefenstaffelung nur bei V494-Ground-Observations und geringem V506/V508-Risiko; X-Lanes/GLB-Clips/Foot IK unverändert.
- Invalides numerisches Kollisionssignal unterdrückt neue Akzente, statt eine freie Bühne anzunehmen.
- Keine neue Szene, Kamera, WebGL-Ressource, Frame-Loop oder Sängererkennung.

## Offen
- Für den **vollständigen Next.js-Produktionsbuild** und `npx tsc --noEmit` fehlen in der Ausführungsumgebung installierte Projektabhängigkeiten (`node_modules`); beide sind **nicht** als PASS zu verstehen.
- Reale Browser-GLB-Visualisierung, tatsächliche abwechslungsreiche mehrminütige Shows und Performance/FPS auf der Zielhardware stehen weiterhin aus.

Auf dem Windows-Rechner: `npm install`, `npm run test:smoke:v638`, `npm run verify:v638`, `npx tsc --noEmit`, `npm run build`.
