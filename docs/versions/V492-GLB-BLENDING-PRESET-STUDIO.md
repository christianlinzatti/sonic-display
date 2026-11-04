# Sonic Display V492 – GLB Blending Preset Studio

**Basis:** V491 · **Paketversion:** `0.1.0-v492` · **Datum:** 23.10.2026

## Funktionen

Unter **Einstellungen → Avatar → 3D-Studio → GLB Blending Preset Studio · V492** kann eine in V491 erprobte Kombination dauerhaft im Browser gespeichert werden:

1. GLB-Modell auswählen; den Basisclip in der V93-Timeline und den Gestenclip in der V491-Vorschau festlegen.
2. Arm-/Schulterbereich oder Arm-/Brustbereich und Mischgewicht (über 0 bis max. 50 %) einstellen und das visuelle Ergebnis testen.
3. Einen Namen vergeben und optional die automatische Verwendung in der Live-Show aktivieren, auf Wunsch nach Genre (alle, Rap, Hardstyle/Hardtekk) gefiltert.
4. **Preset speichern/aktualisieren** oder **Als neues Preset speichern** wählen. Gespeicherte Kombinationen können geladen und gelöscht werden.
5. **Presets als JSON exportieren** für Browserwechsel/Backup; **Preset-JSON importieren** zum Zusammenführen. Importierte Presets erscheinen nur beim passenden GLB-Modell und der richtigen Animationsquelle.

Speicherung: Browser-`localStorage`, maximal 40 Presets. Die JSON-Datei enthält **nur Konfiguration**, keine GLB-Assets oder Animationstracks. Import hat Schema- und Größenprüfung (128 KB), Duplikat-IDs werden beim Zusammenführen aktualisiert. Ungültige oder nicht mehr verfügbare Clips werden im Studio angezeigt, aber **nicht** abgespielt.

## Tatsächliche Live-Anbindung

- `components/visualizer/glbBlendPresetsV492.ts` liefert reine Format-/Clip-/Genreprüfung und validiertes Speichern/Einlesen. Clips werden anhand **stabiler Quell-ID und Originalnamen** aufgelöst; Importindex oder veränderter Clipname allein genügt nicht. Es gibt keinen stummen Ersatzclip.
- `components/visualizer/AvatarPreview3D.tsx`: Preset-Editor, Auswahl, Wiederladen in die bestehende 3D-Vorschau sowie JSON-Import/-Export und verständliche Statusmeldungen.
- `components/visualizer/ThreeAvatar.tsx`: Bereitet höchstens acht automatisch freigegebene, für das Modell gültige sichere Arm-/Brust-Overlays vor. Registriert sie in **dem vorhandenen `useAnimations`-Mixer**. Ein Overlay wird nur dann aktiviert, wenn der automatische Director **bereits denselben Basisclip** abspielt. Das gespeicherte Preset ersetzt **keine Hauptanimation**.
- Die V490-Automatik tritt zugunsten des aktiv gewählten V492-Presets zurück. Die vorhandenen manuellen Choreografien, Timelines, aktivierte Dance-Loops, manuelles Blending, Gruppen-Synchronisation, Fuß-IK und Voice-/Face-Animationen behalten Vorrang. Bei reduzierter Bewegung oder niedrigem Performanceprofil wird das Preset nicht angewendet.
- Ausschließlich sichere lokale `quaternion`-/`rotation`-Kanäle bekannter Arme, Schultern und Brustknochen werden aus dem GLB-Clip *geklont*. Kein Überschreiben von Root, Hüfte, Beinen, Füßen, Händen/Fingern, Kopf, Gesicht, Translationen oder Skalierung. Kein zusätzlicher Mixer, keine Extra-Renderloop, kein GLB-Upload.

**Wichtig:** V492 ist ein *Preset-Editor mit vorsichtiger Auto-Aktivierung*, noch kein V493-Intelligent-Preset-Director. Die automatische Einblendung setzt voraus, dass die zugehörige Basisanimation ohnehin als Live-Clip gewählt wurde. Die tatsächliche optische GLB-Qualität und stabile Fußkontakte müssen am Modell getestet werden. Ein vollständiger Browser-/Next.js-Produktions-Build ist nur mit installierten Dependencies prüfbar.

## Tests

```powershell
npm install
npm run test:v492
npm run test:v492:types
npm run test:v491
npm run check:syntax
npm run check:architecture
npm run build
```

Die V492-Regression prüft Format, Bounds, Duplikate, Import/Export, Model-Scope, fehlende/unbenannte Clips, geschützte Bone-Kanäle, Genre-Filter, die an den tatsächlichen Mixer gebundene Auto-Aktivierung und Schutz bestehender manueller Choreografien.
