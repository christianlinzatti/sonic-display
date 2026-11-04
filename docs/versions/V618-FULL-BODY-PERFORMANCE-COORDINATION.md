# V618 – Full-Body Performance Coordination

Die bestehende V582-Oberkörperanimation und die V617-Gesichtsanimation werden nur bei **übereinstimmendem bestätigten Wortanfang** und einem tatsächlich gemessenen **V492-IK-Bodenkontakt** enger abgestimmt. Zwei gepflanzte Füße erlauben leichte Brustkorb- und Schulterbewegungen; Einbeinstand reduziert die Bewegung und fördert eine sanfte Gegenbewegung des freien Arms. Ohne genügend sicheren Bodenkontakt bleibt die V582-Basis unverändert. Manuelle Choreografien und eigene GLB-Animationsspuren haben Vorrang.

## Grenzen
- Neue Bewegungen betreffen ausschließlich vorhandene Brustkorb-/Clavicle- und UpperArm-Bones.
- Kein Schreiben auf Beine, Hüfte, Wurzel, Fuß-IK, Mund/Kiefer oder Gesichtsmorphs.
- Kein neuer Kameracue, zusätzlicher Frame-Loop oder synthetische Sängererkennung.
- Fehlende Bones und fehlende Kontakte lösen keinen Fehler aus, sondern deaktivieren nur den Zusatz.
- V618 gilt für Live-GLB-Avatare mit aktivierter Foot-IK; die prozedurale Tänzersteuerung bleibt unverändert.
- Keine tatsächliche Bild-/GLB-Sichtfreigabe oder Raspberry-Pi-Leistungsmessung erfolgt.

## Überprüfung
```powershell
npm run test:smoke:v618
npx tsc --noEmit
npm run build
npm run test:all
```
