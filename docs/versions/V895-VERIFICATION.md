# V895 – AI Concert Director 3.0 | Prüfprotokoll

**Datum:** 03.11.2026 · **Version:** `0.1.0-v895` · **Status: fokussierte Entwicklungsprüfungen BESTANDEN; vollständige Produktionsfreigabe OFFEN.**

## Bestätigte Ausführung – erfolgreich

- `npm run test:v895`: **122/122 Prüfungen** – gültige bestätigte Songabschnitte, Fokuswechsel, fehlende Musikdaten, Songwechsel, Pausen, Seeking, Blackouts, Low-Tier, manuelle Regie, Lyrics-/Vocal-Schutz, Grenzen, Export, Bridge, Bühne, Tanz, Kamera, Bedienung und CI.
- `npm run test:v895:types`: isolierter TypeScript-Check für Regiekern/Bridge bestanden.
- `npm run test:v895:ui-types`: isolierter TypeScript-Check für Live-FX-Deck und importierte Bridge bestanden. **Nur testbezogene .d.ts-Stubs in der isolierten Testkonfiguration; keine produktiven Typen überschrieben.**
- `npm run verify:v895:focused`: **Exit 0**. Enthält V895 + V894 bis V880 samt deren fokussierten Typprüfungen, Modul-Casing-, Syntax- und Architekturprüfung (insgesamt **1.355** fachliche Einzelprüfungen V880–V895).
- `npm run check:syntax`: **1.305 TS-/TSX-Quelldateien** erfolgreich.
- `npm run test:module-case`: **2.234 Quellmodule**, keine case-insensitiven TS-/TSX-Dateinamenkollisionen.
- `npm run check:architecture`: **1.067 dokumentierte Quellcode-Verweise**, zehn Bereiche erfolgreich.
- Ältere fachliche Einzelregressionen: V604, V650, V689, V815, V841, V842, V866, V870 und V874–V879 – erfolgreich ausgeführt.

## Nicht freigegeben / fehlende Prüfungen

- `npm ci --offline --no-audit --no-fund`: **Exit 1**, `ENOTCACHED` für `zustand@5.0.16`. In der Arbeitsumgebung fehlt damit der vollständige `node_modules`-Ordner.
- `npm run typecheck`: **Exit 2**; fehlende `next/server`, React-/Node-Typen wegen nicht installierter npm-Abhängigkeiten. Kein erfolgreicher produktiver Gesamt-Typecheck behauptet.
- `npm run build --ignore-scripts`: **Exit 127**, `next: not found`. Kein erfolgreicher Next.js-Produktionsbuild.
- Reale Browser-/WebGL-/GLB-Tests, FPS-Messungen, animierte Beleuchtung im Sichtvergleich und 10-Zoll-Gerät: **nicht ausgeführt**.
- Vor Produktion: npm-Installation auf einem netzwerkfähigen Windows-/Linux-Rechner, vollständiger TypeScript-Check und realer Next.js-Produktionsbuild plus realer Browser-Test.

## Schutzregeln

V895 ist absichtlich ein regelbasierter Planer ohne externe generative KI; keine Beat-/Sängererkennung, keine Hardwarekontrolle, keine neuen Lights/Draw Calls. Manuelle Timelines und deaktivierte Renderer bleiben maßgeblich. Alle Verstärkungen sind begrenzt und sanft überblendet.

## Windows-Befehl

```powershell
npm ci
npm run verify:v895:focused
npm run typecheck
npm run build
npm run dev
```

Das mitgelieferte `scripts/verify-v895-windows.ps1` prüft die ersten vier Schritte mit Abbruch bei Fehler. Die CI `.github/workflows/v832-continuous-validation.yml` umfasst V895 vor den bisherigen Regressionen und der vollständigen Produktions-Gate-Chain.
