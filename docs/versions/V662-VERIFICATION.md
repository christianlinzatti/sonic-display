# V662 – Verification, 28.10.2026

## Bestanden (in dieser Umgebung ausgeführt)

- `npm run test:v662`: **PASS**, 33 Gruppen, 15.000 simulierte Song-/Slot-Abfragen.
- `npm run test:v662:types`: **PASS** (isolierter TypeScript-Kern).
- `npm run test:v644`, `npm run test:v644:types`: **PASS**, 89 Gruppen / 12.000 Samples.
- `npm run test:v661`, `npm run test:v661:types`: **PASS**.
- `npm run test:v660`, `npm run test:v631`, `npm run test:v632`: **PASS**.
- `npm run test:v659`: **PASS**.
- `npm run test:v658:types`: **PASS**.
- `npm run test:resource-lifecycle`: **PASS**.
- `npm run test:env:spotify-build`: **PASS**.
- `npm run check:syntax`: **PASS**, 914 TS/TSX-Dateien.
- `npm run check:architecture`: **PASS**, V662-Dokumentationsstand / Referenzen.
- `npm run test:module-case`: **PASS**, 1.538 Dateinamen ohne plattformabhängige TS/TSX-Kollision.
- `npm run check:test-types`: **PASS**, 8 Test-Ambients isoliert.
- `node tests/v656-production-gate-regression.cjs`: **PASS** (Versionen ab V656 nun generisch statt V661 hart kodiert).

## Offen / nicht freigegeben

- `npm run test:smoke:v662`: erster Lauf stoppte wegen veralteter V656-Test-Versionsgrenze, danach behoben. Zweiter Lauf wurde beim aufwendigen V657-Archivtest vom Ausführungslimit unterbrochen; **kein vollständiges PASS**.
- `npm run typecheck`: **nicht erfolgreich**; Projekt-`node_modules` fehlen, u.a. die Modul-/Typdeklarationen für Next.js, React und Node. Der isolierte V662-Kern-Typecheck ist bestanden; das ersetzt keinen Projekt-Typecheck.
- `npm run build`: **nicht als erfolgreich ausgeführt nachgewiesen**, da npm-Abhängigkeiten fehlen und `prebuild` den umfassenden Release-Gate ausführt.
- GitHub Actions auf Windows/Linux, manuelle Browser-/WebGL-Tests sowie Prüfung mit realen GLB-Gesichtsrigs, Vocal-Dateien und Song-Synchronisation: **noch offen**.

## Überprüfte Produktgrenzen

- Visem-Kurven nur für manuell markierte V644-Intervalle mit aktivem Opt-in; kein Spotify-Audio und keine automatische Phonemerkennung.
- Halb-offene Intervalle und Pausen unverändert, B/P/M-Lippenverschluss und manuelle Prioritäten geschützt.
- Kein zusätzlicher Animationstimer/`useFrame`, kein neue Persistenz oder Netzwerkzugriff; bestehende GLB-Morph- und Bone-Kalibrierungen bleiben bestehen.

## Installation / finale Freigabe

Mit vorhandener unterstützter Node-Umgebung und installierten Projektabhängigkeiten im Projektverzeichnis:

```powershell
npm install
npm run test:smoke:v662
npm run typecheck
npm run build
```

Das Projekt enthält weiterhin kein `package-lock.json`; die Abhängigkeitsauflösung ist daher ohne neu erzeugte/committete Lockdatei nicht vollständig reproduzierbar.
