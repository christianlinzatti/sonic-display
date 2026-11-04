# V903 – Verifikation und Freigabestatus

## Erfolgreiche Prüfungen

- [x] `npm run test:v903`: **1.091/1.091 neue Regressionstests erfolgreich**, inklusive korrekter Zeitfenster, mindestens drei frischer Vorher- und Nachher-Fenster, zwei verworfener Übergangsfenster, fehlender Baseline, Seek, Pause, neuer Songszene, FPS-Ziel-/Performance-Tier-Wechsel, Live-Telemetrie-Ausfall, stale React-Werten, separater expliziter Rücksetzbestätigung und JSON ohne Songkennung.
- [x] `npm run test:v903:types` und `npm run test:v903:ui-types`: isolierte Kern- und UI-TypeScript-Prüfungen bestanden. Nach der letzten Erweiterung um Seek-Schutz und weitere Restore-Tests erneut ausgeführt.
- [x] `npm run verify:v903:focused`: **Exit 0**. Enthält V903, V902, V901, ... bis V880 mit direkten Regressionen und isolierten Core-/UI-TypeScript-Gates, Syntax-, Architektur- und Module-Casing-Prüfung. Nach dem Durchlauf wurde die V903-Seek-Erkennung ergänzend geändert und ihr Test/isolierter UI-Typecheck nochmals erfolgreich ausgeführt; die ältere Funktionalität blieb unberührt.
- [x] Gezielte ältere Qualitätssuites `npm run test:v604` (65 Gruppen/40.000 Songpositionen), V825 (50), V826 (56), V827 (64), V834 (52) bestanden.
- [x] `npm run check:syntax`: **1.316 TS/TSX-Dateien** (ausstehende letzte Dokuänderungen betreffen keine Quellcode-Syntax).
- [x] `npm run test:module-case`: **2.253 geprüfte Quelldateien** ohne Windows-Dateinamenkonflikte.
- [x] `npm run check:architecture`: **1.087 Referenzen**, die Quellcode-Dateien existieren und die aktuellen Architektursektionsregeln werden erfüllt.
- [x] `package.json`, `package-lock.json`, Windows-Skript und GitHub Actions verwenden V903. ZIP-Integrität separat geprüft und erst danach zum Download freigegeben.

## Produktionsfreigabe nicht bestätigt

- [ ] `npm ci --offline --ignore-scripts --no-audit --no-fund`: **Exit 1**, `ENOTCACHED` bei **`zustand@5.0.16`**. Isolierter Versuch mit originalem package.json/package-lock.json in sauberem temporärem Installationsordner, ohne die Projekt-Arbeitskopie zu verändern.
- [ ] `npm run typecheck`: **Exit 2**. Ohne vollständig installierte Next.js-, React- und Node-Abhängigkeiten werden z. B. `next/server` und `process` nicht aufgelöst; erfolgreiche isolierte TypeScript-Gates ersetzen keinen Gesamt-Typecheck.
- [ ] `npm --ignore-scripts run build`: **Exit 127**, `next: not found`. Next.js-Produktionsbuild **nicht** bestanden und keine Freigabe für Vercel oder Windows.
- [ ] Echter Browser/WebGL-Dauertest auf dem Zielrechner, mit echten Avataren, Songs und parallel sichtbarem V826-Dashboard. Insbesondere mehrere Vorher/Nachher-Durchläufe im gleichen Abschnitt prüfen.

## Funktionalitäts- und Messgrenzen

V903 benutzt bestehende V826 Renderer-Frameabstände und Durchschnittswerte, **keine GPU-Timings** oder Bild-/Motion-Erkennung. Ein scheinbarer Leistungsgewinn kann durch viele Faktoren entstehen und ist **kein nachgewiesener kausaler Effekt** einer Einstellung. Keine automatische Übernahme oder Zurücksetzung, keine Speicherung der Messhistorie, keine Songkennung im JSON. Ein Vergleich wird bei fehlenden Daten, Szenenwechsel, Seek, Pause, verändertem FPS-Ziel oder Performance-Profil blockiert. Ein Rücksetzen kann auch nach ungültigem Vergleich explizit durchgeführt werden, sofern der aktuelle Einstellungswert exakt dem damals übernommenen Wert entspricht. Ältere manuelle Timelines werden nie zurückgesetzt.

## Windows-Freigabe (mit vollständigem Paket-Cache/Netzwerk)

```powershell
npm ci
npm run verify:v903:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ: `powershell -ExecutionPolicy Bypass -File scripts/verify-v903-windows.ps1`. Keinen Produktionsstatus behaupten, bevor auch Build und echter 3D-Browsertest bestanden sind.
