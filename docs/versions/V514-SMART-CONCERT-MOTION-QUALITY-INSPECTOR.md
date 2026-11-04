# V514 – Smart Concert Motion Quality Inspector

## Ziel und Bedienung

Im Bereich **3D-Renderdiagnose → Visual Concert Quality Studio → Echte 3D-Vorschau öffnen** lassen sich zwei bis vier installierte GLB-Avatare samt eingebetteter oder installierter Animation anzeigen. Der Schalter **„V514 Bewegungsqualität prüfen“** aktiviert die ergänzende Diagnose. Beim Abspielen werden auffällige, tatsächlich gemessene Gelenkbewegungen mit kleinen rot/gelben 3D-Markern markiert. Eine auf maximal **80 Beobachtungen** begrenzte Timeline enthält Zeitpunkt, Avatar-Nummer, Art und Schwere der Auffälligkeit. Ein Klick auf einen Eintrag pausiert die Vorschau und springt zum entsprechenden Motion-Zeitpunkt.

Die Analyse liest ausschließlich die bereits animierten GLB-Gelenke in einer **separaten Vorschau-Kopie**, niemals die produktive Konzertanimation. Ergebnisse stammen ausschließlich von der Vorschau-Animation, **nicht** aus synchronisiertem Live-Show-Mitschnitt.

## Überprüfte Hinweise (konservative Heuristiken)

- **Gelenkwinkel:** Extrem enge Ellbogen- oder Kniebeugungen auf Basis vorhandener Shoulder–Elbow–Wrist- und Hip–Knee–Foot-Knochen. Normale Streckungen werden nicht als unnatürlich klassifiziert.
- **Oberkörper:** Ungewöhnlich große horizontale Versetzung der Schultern gegenüber dem Hüftmittelpunkt, relativ zur tatsächlichen vertikalen Differenz.
- **Bewegungssprünge:** Sehr hohe Positionsänderungsgeschwindigkeit von Kopf, Handgelenken oder Hüfte. Die Prüfung verwendet nur benachbarte Messpunkte mit 0,08–0,52 Sekunden Abstand. Ein Zeit-Scrub, Replay oder größere Frame-Lücke darf keinen Bewegungssprung erzeugen.
- **Mögliche Fußverschiebung:** Schnelle *horizontale* Bewegung der Foot-Bones bei nahezu konstanter, niedriger Höhe relativ zum in der Vorschau normalisierten Bühnenboden. Ein angehobener Fuß wird nicht als rutschend klassifiziert.

**Ein Hinweis ist kein objektiver Fehler.** Breakdance-/Rap-/Hardstyle-Bewegungen können extreme Posen enthalten; ein Bone namens „Foot“ ist kein präziser Bodenkontakt-Sensor. Umgekehrt bedeutet eine leere Timeline *nicht*, dass eine Animation garantiert fehlerfrei ist. Fehlende, nicht standardisierte oder unvollständige GLB-Knochen ergeben fehlende Abdeckung. Kein exakter Skinned-Mesh-Kontakt und keine automatischen Korrekturen.

## Architektur und Performance

- `components/visualizer/motionQualityInspectorV514.ts` – reiner TypeScript-Kern für Winkel, Körperhaltung, Positionsgeschwindigkeiten, bodennahe Fußverschiebung, sichere Fehlergrenzen und begrenztes, dedupliziertes Timeline-Protokoll.
- `components/visualizer/sampleMotionQualityV514.ts` – read-only-Lesezugriff auf die bereits durch V508 gemappte Bone-Hierarchie. Ermittelt Weltkoordinaten ausschließlich zum bestehenden V513-Sampling-Zeitpunkt.
- `components/visualizer/RealConcertPreviewCanvasV513.tsx` – führt die zusätzliche Analyse in **demselben** existierenden `useFrame`-Samplingzweig aus und zeigt relevante Marker/Timeline. Kein zweiter RAF, Worker, Timer oder WebGL-Canvas.
- `components/visualizer/RealConcertQualityStudioV513.tsx` – Aktivierungsoption und seekbare Vorschau-Zeit. Schließen unmountet die separate GPU-Szene.

Der V513-Takt wird unverändert übernommen: High maximal 8 Hz, Balanced 5 Hz, Pi Balanced 3–5 Hz, Pi Eco 2 Hz und **Low deaktiviert** die Knochenanalyse. Die gewöhnliche Tanzanimation wird nicht gedrosselt. Timeline-Ereignisse leben nur im Komponentenzustand und werden niemals persistent gespeichert.

## Tests und Grenzen

`npm run test:v514` simuliert 28.000 Bewegungszustände sowie isolierte Extrem-, Time-Warp-, Missing-Bone-, Fußkontakt-, deduplizierte Timeline- und Pi-Abtastfälle. `npm run test:v514:types` prüft den Kern isoliert. Dazu gehören die früheren Versionsregressionen sowie Syntax- und Architekturprüfungen. Ein vollständiger Next.js-Build und ein visuelles GLB-GPU-/Raspberry-Pi-Benchmark erfordern eine installierte Entwicklungsumgebung mit echten Modellen.
