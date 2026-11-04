# V894 – Ultimate Genre Stage | Prüfprotokoll

**Stand:** 03.11.2026 · Paket `0.1.0-v894` · Status: **fokussierte Entwicklungsprüfung BESTANDEN**, vollständige Produktionsfreigabe **OFFEN**.

## Bestätigt mit Ausführung (Exit 0)

- `npm run test:v894`: **136/136** Prüfungen bestanden – Genre-Zuordnung, vier Looks, ungültige Konfigurationen, bestätigte V604-Szenen, deterministischer Ablauf, Songwechsel, manuelle Eingriffe, Pausen, Spulen, Blackouts, Lyrics-Fokus, Low-Tier, Reduced Motion, getrennte Lichtkanäle, Export, V882-Bridge, Stage-Einbindung, CI und Versionskonsistenz.
- `npm run test:v894:types`: isolierter TypeScript-Check erfolgreich.
- `npm run test:v894:ui-types`: isolierter TypeScript-Check von Live-FX-Panel, Genre-Architektur, V882-Brücke und zugehörigen Test-Shims erfolgreich. **Die Shims gehören ausschließlich zu den Test-TSConfigs, nicht zum Produktiv-Code.**
- `npm run verify:v894:focused`: vollständig mit **Exit 0**. Enthält direkte Regressionstests V880–V894 einschließlich isolierter Typprüfungen, Syntaxprüfung, Modul-Casing und Architekturprüfung (1.233 fachliche Einzelprüfungen über V880–V894).
- `npm run check:syntax`: **1.304 TS/TSX-Quelldateien** auf Syntax/Importbindung erfolgreich.
- `npm run test:module-case`: **2.232 Quellmodule** auf Groß-/Kleinschreibungs-Kollisionen erfolgreich.
- `npm run check:architecture`: **1.063 dokumentierte Quellcode-Verweise**, zehn Architekturabschnitte erfolgreich.
- Zusätzliche direkte Altregressionen: V635, V647, V789, V810, V821, V842, V866, V870 und V874–V879 **bestanden**.

## Nicht erfolgreich abgeschlossen / nicht ausgeführt

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: **ENOTCACHED**, Registry-Paket `zustand@5.0.16` ist nicht im Offline-Cache.
- `npm ci --ignore-scripts --no-audit --no-fund`: Versuch mit begrenzter Laufzeit ohne erfolgreichen Abschluss. Ein valider vollständiger `node_modules`-Baum steht nicht zur Verfügung.
- `npm run typecheck`: **fehlgeschlagen**, insbesondere fehlende `next/server`, React- und Node-Typen als Folge der nicht installierten Abhängigkeiten. Kein erfolgreicher Gesamt-Typecheck behauptet.
- `npm_config_ignore_scripts=true npm run build`: **Exit 127**, `next: not found`. **Kein erfolgreicher Next.js-Produktionsbuild**.
- Browser-/WebGL-Funktionsprüfung mit echten GLB-Avataren und FPS-Profiling: **nicht durchgeführt**. Visueller Eindruck, Schatten-/Z-Ordnung und Hardware-Performance sind daher nicht abschließend bestätigt.

## Windows-Freigabeprüfung

```powershell
npm ci
npm run verify:v894:focused
npm run typecheck
npm run build
npm run dev
```

Optional führt `scripts/verify-v894-windows.ps1` Installation, fokussierte Prüfungen, vollständigen TypeScript-Check und Produktionsbuild nacheinander fail-closed aus. Im CI-Workflow `.github/workflows/v832-continuous-validation.yml` ist V894 zusätzlich enthalten. Erst nach den erfolgreichen Windows-/Linux-Gates und einem realen Browser-/WebGL-Durchlauf als produktionsbereit kennzeichnen.

## Sicherheits- und Rückwärtskompatibilitätsregeln

Die neue V894-Architektur ist auf eine optional sichtbare InstancedMesh-Ebene beschränkt (max. 32 Instanzen, maximal ein zusätzlicher Draw Call). Keine Änderung gespeicherter Bühnenpresets, keine zusätzlichen 3D-Lichter, keine neuen Hardware-Ausgaben, kein Audio- oder Lyrics-Detektor. Manuelle Licht-/LED-Lanes, Pausen, Blackouts, Spulen, Minimal-Stage, Low-Tier und reduzierte Bewegung haben Vorrang. Die neuen Farben modulieren lediglich bereits bestehende automatische Lichter und LED-Wall-Uniforms.
