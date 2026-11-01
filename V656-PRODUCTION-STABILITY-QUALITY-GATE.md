# Sonic Display V656 – Production Stability & Quality Gate

## Ziel

V656 stabilisiert die Freigabe der nach V654/V655 reparierten Ressourcen- und Datenflüsse.
Die Version führt **keine neue Kamera- oder UI-Funktion** ein. Bestehende Versionen und
Module werden in der aktuellen Smoke-Kette weiterhin geprüft.

## Tests

- `npm run test:v656`: Deterministische Last-/Lebenszyklussimulationen für 960
  Dateiimporte (60 behalten), 280 GLTF-Vorschauen (12 inaktive behalten),
  120 Skeletons, 150 Mixer-Clips, Export/Import vier wichtiger
  Konfigurationsbibliotheken und 80 Spotify-Mount-/Unmount-Zyklen.
- Der CI-Vertrag prüft die Windows/Linux-Matrix und die verbindliche Pipeline.
- `npm run check:release`: V656→V655→V654→V653 usw. Smoke-Kette, Syntax,
  Architektur, Dateinamen-Casing, Isolation der Testtypen, Spotify-Build-Env
  und gesamter Projekt-Typecheck.
- `npm run build` startet durch `prebuild` das Release-Gate und führt danach
  den echten Next.js-Build aus. Kein doppelter Build pro Betriebssystem in CI.
- `npm run verify:historical`: die bisherige ausführliche historische Testsuite;
  separate wöchentliche oder manuelle GitHub-Actions-Prüfung.

## Grenzen und ausstehende Prüfungen

- Keine installierten npm-Abhängigkeiten in der Ausführungsumgebung: voller
  `tsc --noEmit` und Next.js-Build nicht bestätigt.
- Keine echten WebGL-/GPU-Messungen und kein OAuth-Live-Test.
- `package-lock.json` fehlt in der Ausgangsversion. Der Fallback `npm install`
  in GitHub Actions ist **nicht reproduzierbar** und soll mit einem committed
  Lockfile durch `npm ci` ersetzt werden.
- Alte, sehr lange Tests werden nicht entfernt. Sie werden aus dem synchronen
  Release-Preflight in eine eigenständige Extended-Regression verschoben.
