# Sonic Display V426 – Smart Performance Quality Inspector

## Was wurde umgesetzt?

V426 erweitert den bereits vorhandenen V408-Rap Performance Editor und **verwendet die bestehenden Signalpfade**, statt eine konkurrierende Animation-Engine einzuführen.

- **Sechs synchronisierte Spuren** im wählbaren lokalen ±5-s-Fenster: Lyrics-/Wortzeitstempel, V418-Mundvorschau, V419/V420-Artikulation, V414-Gesten, V425-Ausdruck und V416-Rapper-Szenen. Klick auf einen Marker oder Verschieben des Reglers bewegt nur die Vorschau, nie Spotify.
- **Heuristische Hinweise** für sehr kurze Rap-Wortfenster (unter 185 ms), Lyrics ohne Worttiming, überlappende manuell gespeicherte V416-Szenen und veraltete V414-Gestenanker. Bei hoher V425-Hook-Stärke erscheint eine vorsichtige Reduktionsoption. Weder aus den Wörtern noch den Animationswerten wird ein objektiver Qualitäts-Score abgeleitet.
- **Bearbeitbare Vorschläge und A/B-Vorschau**: V419-Glättung und V425-Ausdrucksstärke können als ungespeicherter Entwurf zwischen 0 und 100 % angepasst und in A/B verglichen werden. Bei bereinigbaren alten V416-Szenen und ungültigen V414-Gesten zeigt B eine lokale Variante ohne diese Daten. Die 3D-Vorschau verwendet die bestehenden V374-Kiefer- und V414/V425-Gestenpfade. Gesichtsausdruck und Kameraimpuls werden außerdem numerisch diagnostiziert.
- **Explizite Freigabe**: Nur „Diesen Vorschlag ausdrücklich übernehmen“ speichert Änderungen über die vorhandenen Preferences oder die V414-Speicherfunktion. „Verwerfen“, A/B-Wechsel und Vorschauzeit verändern **weder** Speicher, Live-Bühne **noch** Spotify. Eine zuvor manuell korrigierte V420-Wortform wird bei heuristischen Glättungsvorschlägen ausgespart.
- **Sichere Begrenzungen**: Song- und Avatar-ID der gespeicherten Daten werden verglichen; Fenster, Eventanzahl, Vorschlagsanzahl, Datenpunkte und Stärke sind begrenzt. Das bestehende manuelle V385-Sänger-Casting und V400-Kamera-Keyframes werden nicht überschrieben. Optionale Live-Aktivierungen bleiben in ihrem bisherigen Zustand.

## Bedienung

1. **Einstellungen → Anzeige → Rap Performance Editor → V426 Smart Performance Quality Inspector** öffnen.
2. Bei einem Song mit synchronisierten Lyrics ein Zeitfenster auswählen oder die aktuelle Spotify-Zeit nur **beobachten**.
3. Einen Vorschlag aus dem gewählten Fenster öffnen, mit **A** (aktuell) und **B** (Vorschlag) die isolierte GLB- bzw. schematische 3D-Vorschau vergleichen.
4. Bei Wertvorschlägen den Slider anpassen und anschließend ausdrücklich **übernehmen**, oder **verwerfen**.
5. V419/V425-Einstellwerte sind globale Stärken; eine Freigabe dieser Optionen wirkt gegebenenfalls auch bei anderen Tracks. V414-/V416-Bereinigung wird nur für den aktuell verknüpften Song und Avatar ausgeführt.

Hinweis: Geöffnete ältere V418/V420-Vorschauen können dieselbe 3D-Vorschau ansteuern. Für einen eindeutigen A/B-Eindruck diese älteren Vorschau-Panels schließen.

## Aussagegrenzen

Es wird **keine** echte Audio-/Phonem-Erkennung, Gesangstrennung, Renderlatenz- oder Emotionsmessung durchgeführt. Die Graphem- und Gesichtsbewegungsangaben sind bereits vorhandene Schätzungen bzw. gespeicherte Regieanweisungen. Der V425-Kameraimpuls bleibt **ausschließlich diagnostisch** und hat keinen direkten Einfluss auf die Kamera. Eine dedizierte automatische Rap-Kameraregie ist weiterhin für V429 geplant. Ein visuelles Prüfen mit echten GLB-Avataren kann nicht durch die Offline-Regression ersetzt werden.

## Technische Integration

- `components/visualizer/rapPerformanceInspectorV426.ts` – schreibfreie, begrenzte Inspektionslogik und Vorschlagskandidaten
- `components/visualizer/RapPerformanceInspectorPanelV426.tsx` – sechs Zeitachsen, A/B-Scrub, bestehende 3D-Vorschau und ausdrücklich freigegebene Speicherung
- `components/visualizer/RapPerformanceEditorPanelV408.tsx` – Einbindung direkt unter V418
- `tests/v426-performance-inspector-regression.cjs` – Wiederholbarkeit, ID-/Datenisolation, sichere Defaults, Quellen und Vorschau-Wiring
- `tests/tsconfig.v426-core.json` – strenge TypeScript-Überprüfung der Kernmodule ohne npm-Projektabhängigkeiten

## Prüfen auf Windows

```powershell
npm install
npm run test:v426
npx tsc -p tests/tsconfig.v426-core.json
npx tsc --noEmit
npm run build
```

Für vollständigen Next.js-Build und Browser-/GPU-Vorschau müssen die Abhängigkeiten lokal verfügbar sein. Das V425-Archiv enthält keine Lockdatei oder `node_modules`.
