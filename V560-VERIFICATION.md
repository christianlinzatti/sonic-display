# Sonic Display V560 – Prüfbericht (25.10.2026)

## Im Arbeitscontainer bestanden

- `npm run test:v560`: **25 neue Tests** (konservative Materialauswahl, Grenzwerte, Originalschutz, echte Mock-Objekte mit PBR-Materialkopien, Array-/Shared-Material-Isolation, Wiederherstellung bei Ausschalten und Low-Tier, cleanup, Vorschau- und Settings-Verdrahtung).
- `npm run test:v560:types`: gezielte Typprüfung für V560-Materialplaner und Three.js-Adapter mit testisolierten Three.js-Typstubs.
- `npm run verify:v560`: zusätzlich V559–V554-Regressionsprüfungen und gezielte Typprüfungen, Syntax-/Import-Kontrolle **782 TS/TSX-Dateien**, Architekturprüfung mit **326 Source-Referenzen** und 10 Kernabschnitten.
- `npm run test:v551`: **12.150** deterministische Bühnen- und Lichtfälle.
- `npm run test:v552`: **43.200** deterministische Pi-Draw-Budget-Fälle.
- `npm run test:v553`: **9** Benchmark-/Freigabe-Fixtures (nicht gleichzusetzen mit tatsächlicher Hardware-Freigabe).

## Nicht durchgeführt

- Kein Gesamtprojekt-`npm run typecheck`/`npm run build`: `node_modules` stehen in diesem Container nicht zur Verfügung. Die isolierten V560-Typstubs ersetzen **keine** vollständige Next.js-/React-Three-Fiber-Typprüfung.
- Kein echter WebGL-Test mit importierten GLB-Avataren und deren Texturen/Materialien, keine Messung des Skin-Renderings unter Kamerabewegung/Live-Lip-Sync, kein echter Pi-Thermal-/FPS-/10-Zoll-Test. Die neue GLB-Bühnenvorschau rendert den realen Avatar **statisch**; Beat- und Rollen-Cues sind dort weiterhin Demo-Daten.
- Keine neuen Schattenmaps, SSAO, PBR-Shader oder zusätzlichen Lichtquellen. V560 ist eine konservative Materialkorrektur und echte GLB-Vorschau, **keine** neue Schattenengine.

## Nachprüfung lokal

Nach Entpacken in einem separaten Arbeitsverzeichnis:

```bash
npm install
npm run typecheck
npm run build
```

In **Einstellungen → Konzert-Bühneneffekte** den echten GLB-Vergleich öffnen; Gesicht optimiert/original in Nahaufnahme prüfen. Bei ungewöhnlichen GLBs (unklare Materialnamen oder Metalness-Map) die Korrektur ausgeschaltet lassen. Auf dem Raspberry Pi im Low-Profil und bei wiederholtem GLB-Wechsel auf Speicher und FPS achten.
