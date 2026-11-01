# V692 – Concert Quality Inspector

## Zweck

V692 ergänzt **keine weitere automatische Show-Regie**, sondern bewertet die vorhandenen lokalen Qualitätsbelege nachvollziehbar, ohne aus Geometrie eine angeblich gemessene Tanz- oder Lichtqualität zu machen. Der Inspektor ist innerhalb der bestehenden **QA-Schaltfläche** (V466) erreichbar.

- **Live-Momentaufnahme:** Frische Browser-FPS, P95-Framezeit, projizierte Kopfpositionen und geometrische Lyrics-Hinweise. Ein einzelner Messpunkt wird nicht als Vollsong-Urteil ausgegeben.
- **Vollsong-Bericht:** Die bestehende V641-Aufzeichnung ist explizit vom Nutzer zu starten. V692 wertet dieselben lokal gesammelten Proben aus und ergänzt fünf fachlich getrennte Prüfbereiche sowie Hinweise mit tatsächlich beobachteten Zeitmarken.
- **Tanz & Performer:** Wiederholte Kopfpositionen außerhalb des Bilds werden als Framing-Hinweise erkannt. Natürlichkeit, Foot-IK, Lipsync und tatsächliche Verdeckung bleiben eine manuelle GLB-Sichtprüfung.
- **Kameraführung:** Shot-/Kapitel-Metadaten aus der vorhandenen Regie; Hinweise auf lange Einstellungen bzw. geringe Shot-Vielfalt erst bei ausreichend Songabdeckung. Bewegung der realen Kamerapixel ist damit nicht gemessen.
- **Lyrics:** Wiederholte Überlappung oder Clipping anhand DOM-Rechteck und projizierten Kopfpositionen. Keine angebliche Texterkennung, keine Veränderung des Karaoke-Timings oder der manuellen Position.
- **Licht & Bühne:** Immer ausdrücklich **manuelle Sichtprüfung**. FPS, Projektion und Regie-Metadaten erlauben keine zuverlässige Aussage über Gobo-, LED-, Nebel- oder Gesichtsausleuchtung.
- **Performance:** Tatsächliche vorhandene FPS- und P95-Proben; wiederholte Warnfenster werden mit Songzeitmarke und konkretem Prüfhinweis hervorgehoben. Keine GPU-Zeitmessung, keine Zertifizierung eines Raspberry Pi.

## Sicherheit, Datenschutz und Laufzeit

Alle Auswertungen erfolgen read-only im bestehenden QA-Panel. V692 erzeugt keine zusätzlichen Timer, Renderer, Audioanalysen, Netzwerkaufrufe oder Tracking-Daten. Der Vollsong-Bericht bleibt auf das vom Nutzer gestartete V641-Capture begrenzt (max. 1200 Samples); der vorhandene JSON-Export enthält zusätzlich `inspectionV692`, keine Lyrics-Texte, Audioaufnahmen oder automatischen Freigaben. Bei fehlenden und veralteten Messwerten zeigt V692 *Daten fehlen* statt einer fiktiven Bestnote.

## Bedienung

1. Sonic Display im Browser mit aktiver 3D-Bühne öffnen und **QA** anklicken.
2. Live-Messwerte und die fünf V692-Kategorien lesen.
3. Optional im Bereich **V641 – Vollsong-Qualitätsprüfung** auf **Neue Song-Aufzeichnung** klicken, einen Song vollständig abspielen und danach **Aufzeichnung beenden**.
4. Im darunter angezeigten V692-Vollsong-Inspektor die Zeitmarken und Handlungsempfehlungen prüfen. Bei Bedarf **JSON-Prüfbericht** exportieren.

## Dateien und Tests

- `components/visualizer/concertQualityInspectorV692.ts` – reiner, deterministischer Inspektor.
- `components/visualizer/ConcertQualityResultsPanelV692.tsx` – QA-Anzeige (Live/Vollsong).
- Integration in `ConcertQualityInspectorV466.tsx` und `FullConcertQualityAuditPanelV641.tsx`.
- `tests/v692-concert-quality-inspector-regression.cjs` und `tests/tsconfig.v692-core.json`.
- `npm run test:v692`, `npm run test:v692:types`, `npm run test:quick`.

**Produktionsfreigabe:** Für die tatsächliche Darstellung in Next.js/WebGL ist ein installierter npm-Baum inklusive Lockfile und ein erfolgreicher vollständiger TypeScript-/Produktionsbuild sowie Browserabnahme erforderlich. Alle diesbezüglichen nicht erfolgten Schritte sind im Verifikationsbericht ausdrücklich offengelegt.
