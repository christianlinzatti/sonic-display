# Sonic Display V410 – Verifikation (2026-10-20)

## Tatsächlich ausgeführt

- `npm run test:v410`: erfolgreich. Motion-Auswahl, aktives Modell, Schutz vor falschen/unsicheren URLs, Tempo-Grenzen, isolierter AnimationMixer, externes Retargeting, Pose-Wiederherstellung und Fehlerstatus.
- `npm run test:v405` bis `npm run test:v409`: einzeln erfolgreich.
- `npm run test:v401` bis `npm run test:v410`: **10/10 Versions-Testaufrufe erfolgreich**, zusätzlich zur großen Suite ausgeführt.
- `npm run check:syntax`: **551 TypeScript-/TSX-Dateien** ohne Syntaxfehler.
- `npm run test:module-case`: **866 Quelldateien** ohne Windows-Groß-/Kleinschreibungskollisionen.
- `npm run test:imports`: **1.832 Imports**, keine gemeldeten ungelösten lokalen Imports.
- `node scripts/run-regression-suite-v404.cjs`: **144 historische Einzeltestaufrufe bis V400 bestanden**, danach **Zeitlimit der Umgebung**; es wurde kein fehlgeschlagener Test protokolliert.
- `npm run build:preflight`: Neue und bisherige Qualitätstests liefen erfolgreich, danach erwartungsgemäßer Abbruch der externen Abhängigkeitsprüfung: `package-lock.json`/lokales `node_modules` fehlen, 16 npm-Abhängigkeiten nicht installiert.

## Einschränkungen

- **Kein erfolgreicher vollständiger TypeScript-Projektcheck und kein Next.js-Produktions-Build** in dieser Umgebung möglich. Installiere die Abhängigkeiten auf dem Windows-Rechner und führe dann `npm run verify` aus.
- Browser/WebGL-Vorschau konnte hier ohne installierte React-/Three-/Next-Abhängigkeiten nicht interaktiv ausgeführt werden. Die Funktionstests und der Syntax-/Importcheck ersetzen keinen visuellen Praxistest.
- Externe GLB-Clips werden nach bestehender Humanoid-Retargeting-Logik übertragen; nicht-humanoide Bones und reine Translation-/Scale-Spuren werden nicht uneingeschränkt abgespielt.

## Windows-Befehl

```powershell
npm install
npm run verify
```
