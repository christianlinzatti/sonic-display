# V844 – Festival Special FX 3.0 + optional strobo

## Implementierung

- `festivalSpecialFxPlannerV844.ts`: reine, deterministische Musikregie. Nur bestaetigte Musik-Cues, reale Energiewerte und Kick-Akzente; maximal ein dominanter Effekt je Musikfenster. Manuelle Regie, Blackout, reduzierte Bewegung, Lyrics-Fokus und V823/V825-Budgets bleiben vorrangig.
- `FestivalCo2V844.tsx`: ein begrenztes Instancing-Mesh mit maximal 48 seitlichen, schattenlosen CO2-Nebel-Quads. Keine physikalisch echte CO2-, Fluid- oder Pyrotechnik.
- Funken und Konfetti verwenden V816-Instanzen. V844 gewichtet konkurrierende Partikel herunter und drosselt bestehenden V817-Schaum bei dominanten CO2-/Konfetti-Effekten. Deaktivierte Effekte werden nicht automatisch reaktiviert.
- Strobolicht nutzt ausschliesslich das vorhandene Bodenlicht. **Standardmaessig AUS**. Opt-in bis 2 Hz, maximal 45 ms pro Puls, Licht-Intensitaetsaddition bis 0,12, kein Vollbild-Flash. Auch diese Grenzen sind keine Garantie fuer photosensible Personen. Bei `reducedMotion`, manueller Lichtregie, Blackout, Lyrics-/Vocal-Fokus oder niedrigem Geraeteprofil AUS.
- Einstellungen im Concert FX Studio; Defaultwerte und Normalisierung sind ueber die bestehende Preferences-/Backup-Struktur portabel.

## Tatsaechlich durchgefuehrte Pruefungen

| Test | Status |
|---|---|
| V844 Regressionen | PASS: 98 Gruppen |
| Regressionen V800–V843 | PASS: 44/44 Suiten |
| Spezifische FX- und Lichttests (V793, V810, V816, V817, V823, V825, V829, V831, V838, V841, V843) | PASS |
| Isolierter TS V844 / V841–843 | PASS |
| Syntax | PASS: 1217 Quellen |
| Architektur | PASS: 938 Referenzen |
| Dateinamen | PASS: 2067 Dateimodule, keine Case-Kollisionen |
| Paketversion und Lockfile | PASS |
| Vollstaendiger TypeScript-Check | FAIL / NICHT FREIGABERELEVANT AUSWERTBAR: externe React-/Next-/Node-Typen fehlen |
| Next.js-Produktionsbuild | BLOCKIERT: installierte Next.js-Projektabhaengigkeiten fehlen |
| Echte Browser-/GPU-/GLB-Konzertabnahme | AUSSTEHEND |

Die GitHub-Actions-Pruefungen sind im Projekt enthalten, aber nicht hier auf GitHub ausgefuehrt. **Keine Produktionsfreigabe** ohne erfolgreichen `npm ci`, Release-Regressionslauf, vollstaendigen TypeScript-Check, echten Next.js-Build und reale visuelle Abnahme. Maschinenlesbarer Status: `v844-verification-report.json`.
