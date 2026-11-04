# V388 – Display Performance & Touch Edition

## Zweck
Sonic Display für ein geplantes Touch-Display (ca. 10 Zoll, etwa 1024×600 oder 1920×1200) komfortabler und ressourcenschonender betreiben, ohne Spotify-Wiedergabe, gespeicherte Avatare, Motions, die V387-Konzertregie oder bestehende Grafikprofile zu verändern.

## Bedienung

1. **Touchmodus** in der oberen Leiste aktivieren.
2. Mit **Avatar / Mix / Lyrics** zwischen den vorhandenen V166-Ansichten wechseln.
3. Unter **Mehr · Display → 10-Zoll-Display** eines der Profile wählen: **Standard (unverändert)**, **Adaptiv**, **Energiesparen**, **Schärfer**.
4. **Vollbild** ist immer sichtbar und benötigt aus Browser-Sicherheitsgründen eine echte Nutzerinteraktion. Ein automatischer Chromium-Kioskstart erfolgt nicht.

Die zusätzlichen Optionen liegen hinter **Mehr · Display**, damit die wichtigen Bedienelemente auf 1024×600 ausreichend Platz erhalten. Größere Touch-Ziele, responsive Abstände und eine Portrait-Variante sind in `app/globals.css` ergänzt. Bereits vorhandene Experience-2.0-, Ambient- und Farb-Optionen bleiben über dieses Menü erreichbar. Der Touchmodus ist weiterhin optional, die Display-Optimierung standardmäßig **aus**.

## Neue Dateien
- `components/visualizer/displayPerformancePolicyV388.ts`: deterministische, reine DPR-Budget-Funktion.
- `components/DisplayPerformanceV388.ts`: gemeinsamer Browser-Persistenz- und React-Subscriber für Kioskstatus und das gewählte Display-Profil.
- `tests/v388-display-performance-touch-regression.cjs`: Budgetgrenzen, Opt-in, Hardware-Schutz und Integration.

## Technisches Verhalten
- Die bestehende `AdaptivePerformanceController`-Steuerung wird **nur um eine Obergrenze für `setDpr` erweitert**. Sie nutzt weiterhin die vorhandenen FPS-Hysterese, GPU-Aufwandschätzung, Kalibrierung und den Langzeit-Stabilitätsschutz; die Auflösung wird niemals durch V388 künstlich erhöht.
- **Adaptiv** gewichtet Layoutgröße, angegebene Browser-Hardwaremerkmale, aktivierte Datensparoption und 3–4 gleichzeitig gerenderte Avatare. **Energiesparen** begrenzt Pixel Ratio auf max. 0,75, **Schärfer** auf max. 1,45 (bei begrenzter Hardware 1,15). Ohne aktivierten Kiosk oder im Standardprofil greift **keine zusätzliche V388-Begrenzung**.
- Die `RealLyricsStagePreviewV380` übernimmt das neue Vorschau-DPR-Budget und wechselt bei `IntersectionObserver`-Unsichtbarkeit in den vorhandenen R3F-`demand`-Modus. Beim Wiedererscheinen kann sie wieder kontinuierlich rendern, sofern Wiedergabe läuft. Die Vorschau belegt weiterhin Speicher, solange sie geöffnet ist.
- Weder die Beat-Analyse noch Musik-, Lippen-, Tanz- oder Animations-Uhr wird geändert. Importierte GLB-Animationen, Fuß-IK, manuelle Bühnenpläne und Show-Presets bleiben unverändert.
- Profilpersistenz ist **geräte-/browserlokal** (`sonic-display:v388:display-profile`). Es wird kein Fingerprint erzeugt und kein Browser-Kioskstart behauptet. Die physische Displaydiagonale kann aus Browserdaten nicht zuverlässig bestimmt werden.

## Grenzen und Prüfungen
- Display-Profile begrenzen **Renderauflösung**, nicht direkt Materialqualität, Modellpolygonzahl oder alle Postprocessing-Kosten. Die bestehende Performance-Engine verwaltet diese Aspekte weiterhin unabhängig.
- Bisherige V387-Dateien, Motions, Settings und Quellmodule wurden übernommen.
- `npm run test:v388`, `npm run check:syntax`, `npm run verify:offline` prüfen die Offline-Funktionen.
- Der vollständige `npm run verify` (TypeScript-Typprüfung + Next.js-Produktionsbuild) erfordert lokal `npm install`. In dieser Umgebung meldete `npm run build:preflight` **16 fehlende npm-Abhängigkeiten und kein `package-lock.json`**; es gibt daher noch keine erfolgreiche Produktionsbuild-Bestätigung.

```bash
npm install
npm run verify
npm run dev
```
