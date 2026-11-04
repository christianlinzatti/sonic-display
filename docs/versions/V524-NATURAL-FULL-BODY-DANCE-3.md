# V524 – Natural Full-Body Dance 3.0

**Grundlage:** veröffentlichte V523. Schwerpunkt: natürlichere, kontrollierte automatische Gruppenbewegungen ohne zweite IK- oder GLB-Skelettsteuerung.

## Umsetzung

- `components/visualizer/naturalFullBodyDanceV524.ts`: reiner, deterministischer zeitdiskreter Stabilizer für die **zusätzlich erzeugten** V486-Schritte bei automatisch generierten Gruppen mit drei oder vier Avataren.
- Beim Abspielen begrenzt eine exponential zeitnormierte Glättung den optionalen Schritt-Swing, die kleine Gewichtsverlagerung und die Reisegeschwindigkeit. Sie berücksichtigt die Framezeit (kein zusätzlicher Timer/Frame-Loop).
- Stilabhängige **subtile** Abstimmung: `rap-flow` für Deutschrap/Hip-Hop/Trap/Drill, `hard-dance` für Hardstyle/Hardtekk/Rawstyle/Hardcore sowie `neutral`.
- Jeder Schwung wird nur abgeschwächt: er ist nie größer als der ursprüngliche V486-Wert. Wenn V486 ein Bein nicht schwingen lässt, darf V524 es auch nicht anheben.
- **Gemessene** V486-Stützsignale (aus vorhandenen IK-/Kontakt-Modulen) stoppen für ein aufgesetztes Bein den Zusatz-Swing sofort; bei beiden aufgesetzten Füßen wird die optionale Reisegeschwindigkeit spätestens auf die vom V486-Planer freigegebene reduziert. Ohne gültige Kontaktdaten wird kein Bodenkontakt behauptet.
- V486-Offsets X/Z werden 1:1 an die vorhandene V494-GLB-Bodenkontaktdämpfung und V506-Kollisionsplanung weitergereicht; sie werden nicht umgelenkt. Die stabilisierte Schritt-Simulation erreicht auch den vorhandenen prozeduralen V488-Ganzkörperzusatz über den gemeinsamen V486-Kontext.
- Pausen, manuelle Formationen, manuelle Sänger-/Motion-Steuerung, Reduced Motion, niedrige Leistungsstufe, Trackwechsel, Seeks, fehlerhafte Zeitstempel und ungültige Eingaben setzen die interne Glättung sicher zurück oder umgehen sie.
- Kein neues npm-Paket; keine Änderung an importierten GLB-Quellclips, `AnimationMixer`, Original-Keyframes, IK-Ankern, Lip-Sync, Sängerrollen, Lyrics oder manuell gespeicherten Stages.

## Grenzen

Die Funktion stabilisiert **nur den kleinen vorhandenen automatischen Zusatz-Schrittkanal**. Sie ist kein vollständiger physikalischer Full-Body-IK-Solver und repariert nicht beliebige fehlerhafte GLB-Motions. Der bisherige V487/V494-Bodenkontakt bleibt heuristisch; ohne GLB-Gelenk- und Fußdaten kann das System keine echte Bodenhaftung beweisen. Die tatsächliche sichtbare Natürlichkeit und die Leistungswirkung auf dem Raspberry Pi müssen an realen Modellen überprüft werden.

## Prüfen

```powershell
npm run test:v524
npm run test:v524:types
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Weitere Unterlagen: `V524-VERIFICATION.md`. Nächste Priorität: **V525 Cinematic Lyrics Experience 6.0**, anschließend Deutschrap-/Tanzqualitätsprüfung mit echten GLBs.
