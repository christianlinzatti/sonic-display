# Sonic Display V412 – TypeScript-Live-Rap-Editor-Hotfix

## Problem
`npx tsc --noEmit` / `next build` meldet TS2322 in `components/visualizer/ThreeAvatar.tsx` um Zeile 1108: Live-Editor-Einstellungen können für `verse`, `hook`, `kick`, `snare` oder `lipSync` optional sein. Der V407-Kontext verlangt aber ein vollständiges `RapPerformanceEditorSettingsV408`-Objekt.

## Änderung
- Die bereits vorhandene `normalizeRapEditorV408()` normalisiert das optionale gespeicherte Objekt zu einem vollständigen, gültigen V408-Settings-Objekt.
- Die V412-Überblendung überschreibt danach nur `enabled`, `head` und `gestures`; `verse`, `hook`, `kick`, `snare` und `lipSync` behalten ihre Einstellungen bzw. den Default 100.
- Wenn der V408-Editor deaktiviert ist, beginnt der V412-Live-Layer bei neutralen 100 % für Kopf und Gesten wie zuvor.
- Vorherige V412-Build-Preflight- und V409-Avatar-Nullguard-Fixes sind in diesem Paket bereits enthalten.

## Verwendung
Kleines ZIP ins Projektverzeichnis entpacken, `components/visualizer/ThreeAvatar.tsx` überschreiben. Dann:

```powershell
npx tsc --noEmit
npm run build
```

Gezielter Regressionstest: `node tests/v412-live-editor-types-regression.cjs`.

Der vollständige Next.js-Build muss weiterhin auf einer Maschine mit installierten Projektabhängigkeiten ausgeführt werden.
