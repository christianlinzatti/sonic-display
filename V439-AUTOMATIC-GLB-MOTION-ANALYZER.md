# Sonic Display V439 – Automatic GLB Motion Analyzer

**Version:** `0.1.0-v439`, auf Basis der vollständigen V438-Quellen.

## Was automatisch geschieht

V439 ergänzt die bestehende V438-Rap-Show-Regie ohne zusätzlichen 3D-Renderer oder eine zweite Dance-Engine:

1. Sobald der Avatar-Visualizer und die V438-Motion-Automatik aktiv sind, analysiert der Browser für den ausgewählten Avatar nacheinander bis zu **12 noch nicht ausgewertete GLB-Animationen** aus der installierten Motion-Bibliothek. Eine zusätzliche Schaltfläche im **Rap Performance Editor → V438/V439** ermöglicht die Analyse aller übrigen GLB-Dateien und ein erneutes Auswerten.
2. GLB-Dateien werden mit `fetch`, Größenbegrenzung und `GLTFLoader.parseAsync` gelesen. Gemessen werden **tatsächliche Animations-Keyframes** an erkennbaren humanoiden Arm-, Bein- und Rumpf-Tracks (Quaternion-Rotationen und Positions-Tracks).
3. Aus den Keyframes entstehen normierte Messwerte für Armaktivität, Beinaktivität, Rumpfaktivität, Bewegungsgeschwindigkeit, Energie und **Loop-Eignung als Start-/Endpose-Abstand**. Ein Konfidenzwert hält Profile mit zu geringer Skelettabdeckung von der Klassifikation fern.
4. Die vorhandene V438-Rangfolge berücksichtigt bei hinreichend verlässlichen Daten gemessene Energie und geeignete Verse-/Hook-/Break-Szenen, Genre/BPM sowie Abwechslung. **Explizit in der Motion-Library markierte Abschnitte haben Vorrang** vor Messwerten und Dateinamen.
5. Ergebnisse werden **nur lokal im Browser** und pro eindeutiger Motion-ID samt unveränderter Quell-URL gespeichert (`sonic.motion-analysis.v439`). Veränderte URLs invalidieren die alten Messwerte. Fehler erhalten eine Wiederholsperre von 12 Stunden. Es werden keine installierten Clips, Zuordnungen oder GLB-Dateien umgeschrieben.

## Sicherheit und Grenzen

- Es werden ausschließlich bestehende GLB-Dateien aus der eigenen Motion-Library analysiert. Maximal **12 MiB pro Datei** und **13 Sekunden Ladezeit**. Die Verarbeitung erfolgt einzeln; maximal 120 Tracks und ungefähr 96 Messabschnitte je Track werden für eine Analyse ausgewertet. GLTF mit externen Ressourcen und FBX werden hier nicht automatisch inspiziert.
- Die automatische Hintergrundanalyse ist auf **12 noch nicht gemessene GLBs pro ausgewähltem Avatar/Startvorgang** begrenzt, um den Browser zu schonen. Der sichtbare Button kann alle vorhandenen GLBs neu prüfen; große Bibliotheken benötigen Zeit und Netztraffic. Bereits gespeicherte Messwerte werden auf Folgeaufrufen wiederverwendet.
- Die Messungen sind **keine** wissenschaftlich validierten Bewegungsklassifikationen: Es gibt keine Fußkontakt-, Kollision-, Retargeting- oder Rig-Qualitätsprüfung und keine zuverlässige Schätzung des Tanz-BPM. Der Wert „Speed“ meint Keyframe-Aktivität pro Zeit. „Loop“ prüft die Nähe der Ausgangs- und Endpose, nicht nahtloses Blending oder Rhythmusgenauigkeit.
- Manche GLBs enthalten mehrere Animationsclips. V439 verwendet den ersten analysierbaren Clip (maximal 16 untersucht) als vorsichtige Dateiprofil-Näherung. Eine manuell gewählte Animation innerhalb derselben GLB kann andere Bewegungswerte besitzen.
- Selbst vorhandene Keyframes führen bei unzureichender Zuordnung zu Armen/Beinen zu einem Fallback auf die bestehenden V438-Metadaten und Dateinamen. Die heuristische Lyrics-Hook-Erkennung V437 bleibt unverändert.
- **Keine erzwungene automatische Clipwiedergabe:** Wie zuvor muss die installierte Motion-Library zum automatischen Wechseln eingeschaltet sein, und manuelle Choreografien, Clipauswahl, Timelines, reduzierte Bewegung und andere Prioritätsregeln bleiben maßgeblich.
- Bei einer externen HTTPS-Motion-URL wird nur die vom Nutzer bereits installierte Motionquelle geladen; browserseitige CORS- und Netzwerkregeln gelten weiterhin. Analyseergebnisse werden nicht an einen neuen Backenddienst übertragen.

## Betroffene Dateien

- `components/visualizer/glbMotionAnalyzerV439.ts`: Messalgorithmus, keine Abhängigkeit von Browser oder Three zur Laufzeit.
- `components/visualizer/glbMotionCacheV439.ts`: begrenzter, normalisierter Cache mit URL-Invalidierung und Aktualisierungsereignis.
- `components/visualizer/glbMotionScanV439.ts`: begrenzter Browser-GLB-Download, Lazy-Loading der GLTFLoader-Implementierung, sequenzieller Hintergrundscan.
- `components/visualizer/automaticMotionIntelligenceV438.ts`: Nutzung gemessener Profile, Beibehaltung des V438-Fallbacks und stärkerer Priorität für explizite Kategorien.
- `components/visualizer/VisualizerStage.tsx`: automatisch gestarteter Scan und reaktive Profil-Verwendung in der existierenden Motion-Auswahl.
- `components/visualizer/AutoMotionIntelligencePanelV438.tsx`: Scanfortschritt über Anzahl, Messwerte und manueller Vollscan.
- `tests/v439-glb-motion-analyzer-regression.cjs`, `tests/tsconfig.v439-core.json`, `tests/tsconfig.v439-scan.json`: Offline-/Integrationsprüfung und isolierte strenge Typprüfung.

## Installation und Prüfung auf Windows

```powershell
npm install
npm run verify:v439
npm run typecheck
npm run build
```

Das Ergebnis eines vollständigen `next build` ist im mitgelieferten Prüfbericht getrennt ausgewiesen.
