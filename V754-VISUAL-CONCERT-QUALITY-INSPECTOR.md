# Sonic Display V754 – Visual Concert Quality Inspector

## Zweck und Bedienung

Der neue **Visual Concert Quality Inspector V754** erscheint im vorhandenen **Concert Quality Dashboard** (Einstellungen → Dashboard und Dynamic Stage), direkt vor dem V753-Performance-Benchmark. Die Funktion verändert weder Kamera, Choreografie, Lippensynchronität, Bühne, Licht noch Lyrics. Es gibt **keinen weiteren Renderloop**.

1. In der laufenden 3D-Bühne die freiwillige **V466-WebGL-Qualitätsprobe** öffnen/aktivieren.
2. Die V754-Kachel zeigt beim nächsten vorhandenen Probe-Fenster (ca. 1 Hz) Beobachtungen zum Bildausschnitt und zur räumlichen Lyrics-Anzeige an.
3. Bei 1–4 tatsächlich geladenen GLB-Meshes werden vorhandene *anatomische* Head-/Hips-/LeftFoot-/RightFoot-Knochen (u. a. Mixamo/VRM J_Bip) in CSS-Bildschirmkoordinaten projiziert. Die Messung prüft, ob die Knochen im WebGL-Canvas liegen und ob sie sich dem Bildrand nähern.
4. Das aktive, sichtbare Lyrics-DOM-Rechteck aus V466 wird auf Überlappung mit projizierten Kopf-/Hüftankern und den Canvas-Bereich untersucht.
5. Der Verlauf zeigt höchstens 30 frische Einzelmessungen, keine extrapolierten Zwischenwerte; mit **Verlauf leeren** wird er gelöscht. Alles bleibt im React-Komponentenspeicher.

## Aussagekraft und Grenzen

- **Kamera/Performer:** Ein Kopf hinter der Kamera oder außerhalb der Canvas-Projektion wird als geometrisches Problem gemeldet. Für die vollständige Körperkontrolle müssen **Kopf- und beide Fußknochen** eindeutig zugeordnet sein. Fehlen sie, erscheint der Bereich als *nicht prüfbar*, nie als garantierte Ganzkörper-Sichtbarkeit.
- **Lyrics:** Eine geometrische Kollision von projizierten Knochenpunkten mit der aktiven Lyrics-Box bedeutet *mögliche* Überdeckung, keinen gemessenen Pixelkonflikt. Ein außerhalb des Canvas liegendes Rechteck wird als Layout-Hinweis gemeldet.
- **Licht:** Weder Pixel-Helligkeit, Kontrast zur 3D-Szene, Schatten, Nebel, Verdeckung durch andere 3D-Objekte noch gefühlte Lesbarkeit können aus Knochenpositionen und DOM-Rechtecken verlässlich bestimmt werden. Die UI meldet hier explizit **Nicht gemessen**. Keine teure Canvas-Pixelkopie und kein Rückschluss auf echte GPU-Leistung.
- **Sichtbarkeitsfehler:** Wenn einige Meshes noch laden, wird dies bei bereits geladenen Avataren als Hinweis ausgegeben. Bei ausschließlich fehlenden Meshes, ungültiger Projektion, veralteten (> 5 s) Messungen oder deaktivierter WebGL-Probe wird *Keine aktuelle Messung* gezeigt. Historische Beobachtungen werden nicht als aktuell ausgegeben.
- **Zeit:** Eine lokale, flüchtige 30-Fenster-Serie ist kein vollständiger Song-Audit. Es gibt keine gespeicherten Titel, Songtexte, Screenshots oder Telemetrie-Uploads.

## Technische Integration

- `components/visualizer/ConcertQualityProbeV466.tsx`: nur innerhalb der bereits vorhandenen ~1-Hz-Opt-in-Probe wird die Kamera-Knochen-Projektion erweitert, ohne `Box3.setFromObject` oder weitere GPU-Datenabfragen.
- `components/visualizer/concertQualityStoreV466.ts`: optionaler `bodyV754`-Datensatz; ältere V466-/V467-Diagnose bleibt kompatibel.
- `components/visualizer/visualQualityInspectorV754.ts`: streng typisierter, rein funktionaler Prüf- und Statistik-Kern; verhindert Stale-/Duplicate-Daten und begrenzt die History.
- `components/visualizer/VisualConcertInspectorPanelV754.tsx`: neue read-only Kachel und optionale Probe-Aktivierung in bestehender Oberfläche.
- `tests/v754-visual-concert-quality-regression.cjs`, `tests/tsconfig.v754-core.json`, `tests/tsconfig.v754-ui.json`: Numerik, Szenarien, Source-Wiring, Typprüfung.

## Prüfbefehle

```powershell
npm ci --no-audit --no-fund
npm run verify:v754:static
npm run typecheck
npm run build
```

**Hinweis:** Der statische Kern und die React-Ansicht sind auch ohne lokal installierte Projektpakete isoliert testbar; ein erfolgreicher Full-Stack-Produktionsbuild und eine sichtbare GLB-Browserprüfung sind davon ausdrücklich nicht ersetzt.
