# Sonic Display V737 – Hip Foot Lock 2.0

**Grundlage:** V736 (`sonic-display-v736-build-motion-validation.zip`)  
**Version:** `0.1.0-v737`  
**Pruefumgebung:** Linux, Node 22.16.0, globales TypeScript, unvollstaendige npm-Installation.

## Implementierung

- `hipFootLockV737.ts` bietet einen isolierten, endlichen, anatomierelativ begrenzten Weltkoordinaten-Anker pro Fuss fuer `Hip_Sway`, `Hip_Circle` und `Hip_Bounce`.
- Nur eine ueber die vorhandene V135-Kontakterkennung sicher identifizierte Standphase darf einen Anker erwerben. Sobald ein Fuss abhebt, eine Schrittbewegung erkannt wird oder der Abstand unplausibel wird, erfolgt sofortige Freigabe.
- Anker werden bei Pause, Reduced Motion, deaktivierter IK, manuell priorisierter Choreografie und bei Song-Seek/Trackwechsel verworfen.
- Bei V322-Opt-in hat der bestehende V322-Foot-Lock Vorrang. Es existiert weiterhin nur **ein** end-of-frame Foot-IK-Aufruf nach den GLB-/Rig-Animationen.
- Die beiden bounded IK-Korrektur-Passes verwenden den vorhandenen Hip-Knee-Ankle-Solver samt Gelenkschutz. Es werden weder animierte GLB-Clips, Vertex-Gewichte, Meshes noch Avatar-Root-Transforms veraendert.
- Diagnostik im bisherigen Foot-Lock-Panel zeigt die geschaetzte Ankerabweichung **vor** IK; diese Zahl ist keine Messung des sichtbaren Rest-Slidings.

## Durchgefuehrte Checks

| Pruefung | Ergebnis | Einordnung |
|---|---|---|
| `test:v737` | PASS | 524 Kontakt-/Sicherheitspruefungen, einmalige Ankeraufnahme, harte Freigabe, Seek/Trackwechsel, Integration/Wiring |
| `test:v737:types` | PASS | Isolierte strikte Typpruefung von V737 und V135 ohne produktive Typ-Stubs |
| `test:v736` | PASS | 10 Gruppen, 61.582 Motion-Samples; Strukturtest auf den gemeinsamen Manual-Priority-Wert aktualisiert |
| `test:v735` | PASS | Original-Hueftbewegungen und IK-Reihenfolge |
| `test:v665` | PASS | 41 Gruppen, 15.000 Grounding-Samples |
| `test:v666` | PASS | 48 Gruppen, 15.000 Genre-Motion-Frames |
| `test:grounding` | PASS | bestehende V135-Kontakt-Regression |
| `check:syntax` | PASS | 1.038 TS-/TSX-Dateien geprueft |
| `check:architecture` | PASS | aktualisierte Architekturversion |
| `test:module-case` | PASS | 1.752 Dateien, keine Gross-/Kleinschreibkollisionen |
| `test:v733` / `test:v734` | BLOCKIERT / TEILWEISE | V733-Core erfolgreich, nachfolgende Tests benoetigen `react`; V734 benoetigt `react` |
| `npm ci --ignore-scripts` | NICHT ERFOLGREICH | npm-Installation hing / lief nicht vollstaendig durch; Node-Pakete fehlen |
| `npm run typecheck` | NICHT ERFOLGREICH | Fehlende Paket-Typdefinitionen (`TS2688`), kein aussagekraeftiger Gesamttypcheck |
| `npm --ignore-scripts run build` | BLOCKIERT | `next: not found`: kein Next.js-Paket installiert |

## Lokal verifizieren

```bash
npm ci
npm run test:v737
npm run test:v737:types
npm run verify:v737
```

Nach erfolgreicher Installation ist `verify:v737` inkl. `npm run typecheck` und echtem `npm run build` auszufuehren. Fuer eine optische Freigabe ausserdem einen echten Avatar-v2-GLB bei 90/145/180 BPM und beiden Standphasen, Einbeinstand, Schritten, Pause und Seek kontrollieren. Die Tests beweisen **nicht**, dass die Fuesse auf allen realen GLB-Rigs rutschfrei sind.
