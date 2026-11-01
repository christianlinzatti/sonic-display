# V774 – Instanced Dance FX / GPU Draw-Call Reduction

## Implementierung (auf Basis von V773)

Die acht Beat-Pulse-Slots in `components/visualizer/DanceFX.tsx` erzeugten bisher je
separate Ring-, Fußabdruck- und Trail-Meshes (24 Meshes mit jeweils eigener
Geometrie und eigenem Material; bis zu 24 Draw Calls, falls alle sichtbar sind).
V774 verwendet **drei** `THREE.InstancedMesh`-Batches:

1. Schockwellen: eine Ring-Geometrie, additive Überblendung.
2. Fußabdrücke: eine Plane-Geometrie, normale Alpha-Überblendung.
3. Leuchtspuren: eine kleine Sphere-Geometrie, additive Überblendung.

Die pro Puls verschiedenen Transformationsmatrizen werden in `instanceMatrix`
geschrieben. Eine dynamische `InstancedBufferAttribute` namens `instanceOpacity`
gibt jedem Puls seine eigene Transparenz. Das Shaderprogramm übernimmt den
vorherigen Transparenzabfall; die drei Farben, Skalierungen, Positionen,
Effekt-Toggles, Beat-Cooldown und adaptiven Limits bleiben erhalten.
Doppelseitige transparente Geometrien verwenden `forceSinglePass`, damit Three
nicht mehrere Renderpässe pro Batch erzeugt. Effektiv sichtbare Instanzen
werden auf den Anfang des jeweiligen Batches verdichtet; `count=0` deaktiviert
den Batch vollständig. Bei deaktiviertem Effekt bleibt der V552-Idle-Fastpath
aktiv.

`danceFxInstancePlanV774.ts` ist die isoliert typprüfbare Pool- und
Alpha-Planung. Ein Frame aktualisiert nur vorab erzeugte Meshes,
Buffer-Attribute und ein wiederverwendetes Object3D. Private Geometrien und
Shader-Materialien werden beim Unmount freigegeben.

## Was diese Optimierung nicht verspricht

- **Strukturelle Obergrenze:** Von höchstens 24 einzeln sichtbaren Mesh-Draws
  auf **höchstens 3 gebatchte Draws**, während alle drei Effekttypen aktiv
  sind. Diese Angabe ist keine gemessene gesamte Framezeit.
- GPU-Auslastung, FPS und tatsächliche Draw-Call-Zähler sind erst im Browser
  mit installiertem `three`/Next.js und der vorhandenen V770-Überwachung
  messbar. Transparenz und 3D-Gestaltung müssen insbesondere aus schrägen
  Kamerawinkeln überprüft werden.
- Ein GPU-Speicherleck wird durch Instanzierung allein nicht ausgeschlossen;
  dafür stehen V771-Langzeittest und V770-Ressourcenstatistik bereit.
- DOM/CSS-Partikel des 2D-Visualisierers und die bereits in einem
  `THREE.Points` zusammengefassten V353-/V766-Partikel werden **nicht** durch
  InstancedMesh ersetzt: Sie sind bereits gebatcht oder keine WebGL-Meshes.

## Lokale Validierung

```bash
npm ci --no-audit --no-fund
npm run test:v774
npm run test:v774:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
npm run dev
```

Bei laufender Avatar-Konzertbühne die Einstellungen `Dance FX`,
`Schockwellen`, `Fußabdrücke`, `Trails` aktivieren und unter Diagnose das
V770-Dashboard zur Messung verwenden. Für einen Speicher-Langzeittest V771
wie dokumentiert starten.

### Ergebnisse in der Offline-Erstellungsumgebung

- V774: 24 adaptive/Toggles-Szenarien + Alpha- und Lebenszyklustests: PASS.
- Strenge isolierte Typprüfung des V774-Poolmoduls: PASS.
- V773, V772, V771, V770, V769, V768, V766, V765, V764, V763, V762, V760,
  V552: PASS.
- Syntaxprüfung (1.093 TS-/TSX-Dateien), Architektur, Windows/Linux-
  Dateinamenkonflikte und Lockfile-Integrität: PASS.
- **Vollständiger TypeScript-Check: BLOCKIERT**, da 18 direkte npm-Pakete
  nicht installiert sind (TS2307 etc.). **Next.js-Build: nicht erfolgreich
  verifizierbar** ohne diese Pakete. Kein realer Browser-/GPU-FPS-Test ausgeführt.
