# V587 – Prüfbericht (26.10.2026)

## Erfolgreich in dieser Umgebung

| Kommando | Ergebnis | Umfang |
| --- | --- | --- |
| `npm run test:v587` | PASS | 37 gruppierte Prüffälle inklusive 20.000 deterministischer Wiedergabe-Samples (vier Varianten), Standfuß-Schutz, Solo-/GLB-Rig-Integration, Pausen/Seek, keine neuen IK-Schritte |
| `npm run test:v587:types` | PASS | Isolierter `tsc`-Check der neuen V587-, V524-, V486- und RigController-Module samt Typabhängigkeiten |
| `npm run test:smoke:v587` | PASS | V587, V586, V585, V584, V583, V582, V581, V580, V572; Syntax-/Importprüfung und Architekturprüfung |
| `npm run verify:v587` | PASS | Obiger Smoke-Test plus V524, V545, V486, V488, V494, V500 und V563 |
| `npm run check:syntax` | PASS | 806 TS/TSX-Quelldateien: Syntax und Importbindungen (nicht Gesamt-Typecheck) |
| `npm run check:architecture` | PASS | Releaseversion V587 und 380 referenzierte Architektur-Quelldateien |

## Validierte Schutzgrenzen

- V587 erzeugt keinen eigenen Takt, keine Schritte, keine neuen Ansprechpartner/„Sänger“, keine GLB-Kanäle oder Canvas-Renderloops.
- Nur automatisch geplante 3-/4-Personen-Schritte erhalten die zusätzlichen sanften Swing-/Gewichtsfaktoren. Bekannte gepflanzte Füße bleiben bei 0, `offsetX`/`offsetZ`/`rootSpeed` bleiben unverändert.
- Im bestehenden GLB-Rig werden nach V545 ausschließlich vorhandene `armSwing`, `followThrough` und `hipSway`-Skalarwerte attenuiert, keine Fuß-, Audio-, Gesicht- oder manuell bearbeiteten Kanäle.
- Reduzierte Bewegung, Pause, manuelle Priorität, unbekannter GLB-Kontakt, ungültiger Song und Low-Tier verhindern die GLB-Erweiterung.
- Testproben prüfen Zahlen, Integrationsreihenfolge und Untergrenzen; sie sind **kein** Qualitätsbeweis für einen realen tanzenden GLB-Avatar.

## Nicht nachgewiesen

- Kein vollständiger `npm run typecheck` für alle Next.js-Abhängigkeiten und kein `npm run build` (im gelieferten Quellprojekt fehlen installierte `node_modules` sowie eine vollständige Dependency-/Lockfile-Freigabe).
- Kein Browser-/WebGL-Sichtvergleich mit realer Avatar-Animation, keine echte Spotify-Wort-Audio-Gegenprüfung, keine gemessenen FPS auf einem 10-Zoll-Raspberry-Pi.

## Nächste lokale Qualitätskontrolle (Windows)

```powershell
npm install --no-audit --no-fund
npm run verify:v587
npm run typecheck
npm run build
```

Danach echte GLB-Modelle und Schrittübergänge bei Deutschrap-Verses, Hooks und bei stehendem Fuß mit/ohne automatischer Mehrpersonen-Choreografie überprüfen. Auf dem Raspberry Pi in Chromium `npm run benchmark:v580:pi` separat laufen lassen.
