# V740 – Natural Body Dynamics: Implementierung und Prüfstatus

**Basis:** unverändertes vollständiges V739-Projektarchiv plus V740-Erweiterungen.

## Neu

- Neuer reiner, deterministischer Sampler `components/visualizer/naturalBodyDynamicsV740.ts`, der die **tatsächlich überblendete V738-Hüftpose** als Eingangssignal verwendet. Brust/Gegendrehung, Arm-/Unterarm-Gegenbewegung, minimale Kopfkompensation und leichte Bein-/Fußmitbewegung bei frei schwingenden Beinen.
- In **beiden** Live-Avatar und Avatar-Studio-Vorschau integriert, nach V738/V735 und **vor** der existierenden IK. Keine zweite IK, keine Veränderung des Bühnen-Roots oder GLB-Hautgewichte.
- Erkennung des Stützfußzustands: aufgesetzte Füße erhalten **keine zusätzlichen** V740-Fuß- oder Oberbeinwinkel. Bei fehlender IK oder unbekanntem Kontakt bleiben beide Beine ohne zusätzliche V740-Bewegung. Andere ältere Motion-Layer und der vorhandene Foot-IK-Solver bleiben unabhängig davon aktiv.
- Bei Pause, Reduced Motion, deaktiviertem Studio, fehlender Hüftbewegung oder manueller Choreografie werden alle neuen Kanäle auf null gesetzt. Mixer-Reset-Erkennung auch für Brust, (Unter-)Arme, Beine, Fußgelenke und Kopf erweitert; additive Overlays akkumulieren auf statischen Rigs nicht.
- **Dance Studio → Hüftbewegungen → Natural Body Dynamics**: Ein/Aus, Körperstärke, Arme/Schultern, Beine; V740-Einstellungen werden im bestehenden lokalen Präferenzobjekt persistiert und sind rücksetzbar.
- In der Avatar-Vorschau erscheint ein Hinweis bei fehlenden optionalen Brust-/Armknochen. V739-Warnungen für nicht vorhandene GLB-Clips bleiben unverändert.

## Erfolgreiche Prüfungen (diese Umgebung)

- `npm run test:v740`: **159.668** deterministische Grenzwert-/Kontakt-/Regressionchecks, einschließlich Rhythmusphasen, aller drei Hüftbewegungen, ein-/beidseitiger Stützphase, Deaktivierung, Mixer-Reset und nichtakkumulierendem Rig-Overlay.
- `npm run test:v740:types`: **erfolgreich**, isolierter strenger TypeScript-Check von V740, V735 und Rig-Controller mit **Test-only**-Three.js-Typstub.
- `npm run test:v739`, `test:v739:types`, `test:v738`, `test:v738:types`, `test:v737`, `test:v737:types`, `test:v736`, `test:v736:types`, `test:v735`, `test:v665`, `test:v666`: **erfolgreich**.
- `npm run check:syntax`: **1.042** TS/TSX-Quelldateien geprüft.
- `npm run check:architecture`: **erfolgreich**.
- `npm run test:module-case`: **erfolgreich**.

## Nicht erfolgreich verifiziert

- `npm ci --offline --ignore-scripts`: **ENOTCACHED**, bereits `zustand-5.0.16.tgz` fehlt im lokalen npm-Cache. Die Projektabhängigkeiten sind deshalb nicht installiert.
- `npm run typecheck`: **nicht erfolgreich** wegen fehlender React-/Next.js-/Three.js-/Node-Typen; isolierter Typcheck ist **kein** Ersatz.
- `npm run build`: **blockiert** im V680-Dependency-Preflight (0/18 benötigte Pakete installiert). Es gibt **keinen** erfolgreich nachgewiesenen Produktionsbuild für V740.
- Echte Avatar-v2-GLB-Fußrutsch-/Knie- und Schulter-Evaluierung im Browser, mit gerenderter finaler IK-Pose, **nicht durchgeführt**. 159.668 Checks sind numerisch, keine Bildprüfung.

**Wichtig zur GLB-Bibliothek:** V739 exportiert die vorhandenen V739-Knochenkurven. Die neuen V740-Ganzkörper-Gegenbewegungen sind **zur Laufzeit** generiert und **noch nicht** Bestandteil des V739-Bake-/Export-Formats. Einzelne Gesäßhälften, Morph-Targets oder neue Hautgewichte werden ebenfalls nicht erzeugt.

## Lokale vollständige Verifizierung (mit Netzwerk / installiertem npm)

```powershell
npm ci
npm run verify:v740
```

Nach einem erfolgreichen Build im Browser Avatar auswählen und nacheinander `Hip_Sway`, `Hip_Circle` und `Hip_Bounce` mit Kontaktanzeige und verschiedenen Bewegungsstärken prüfen. Das V739-Warnverhalten bei fehlendem GLB-Clip ebenfalls prüfen.
