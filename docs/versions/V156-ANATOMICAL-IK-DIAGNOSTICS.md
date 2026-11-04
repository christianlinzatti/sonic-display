# V156 – Advanced Anatomical IK Diagnostics & Auto-Calibration Studio

V156 erweitert den V152/V153-Skeletteditor und verwendet die konservative V155-Ellbogen-/Knieachsenerkennung für eine Diagnoseansicht.

## Funktionen

- Für benannte, geometrisch auswertbare Ellbogen-/Knieketten wird eine lokal definierte Achse, ein Konfidenzwert und eine konservative IK-Korrekturgrenze angegeben.
- Die gewählte Achse wird im geklonten 3D-Modell als Linie gezeigt (Grün = ausreichend sichere geometrische Erkennung).
- Eine tabellarische Übersicht ermöglicht die Auswahl erkannter Gelenke.
- Ein Vorschlag für lokale XYZ-Korrekturgrenzen wird nur erstellt, wenn die erkannte Achse zu >= 0,82 auf einer lokalen XYZ-Achse liegt und die Erkennungskonfidenz >= 0,5 ist.
- Vorschläge werden **nicht** automatisch persistiert: erst eine explizite Bestätigung ersetzt die manuellen Grenzen des gewählten Gelenks.
- Export umfasst Bone-Mappings, explizite Grenzen und die erkannten Achsdiagnosen.
- Bestehende V154/V155-IK-Sicherheitsroutinen bleiben bestehen; das Diagnosemodul schreibt selbst keine Animationen um.

## Einschränkungen

- Die automatisch abgeleiteten Grenzen betreffen nur zusätzliche IK-Rotationen, nicht die volle anatomische Beweglichkeit.
- Ungewöhnliche Bone-Namen, gestreckte oder unvollständige Rigs werden konservativ übersprungen.
- Es wurden keine echten GLB-Visualisierungstests durchgeführt.
- Next.js-Produktionsbuild und TypeScript-Check müssen nach `npm install` lokal erfolgen.

## Prüfen

```bash
npm run test:anatomical-diagnostics
npm run verify:offline
npm run build
```
