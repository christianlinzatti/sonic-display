# V773 – Optimierung transparenter Bühnen- und Nebeleffekte

## Implementierung

- **Konzertbühne:** Überlagernde Shader-Kegel und Nebel-Pläne zeichnen nur noch ihre Vorderseite (nicht transparent-zweiseitig), mit 14 statt 22 Kegelsegmenten und ohne erzwungen deaktiviertes Frustum-Culling.
- **Adaptives Overdraw-Budget:** Basierend auf dem bereits existierenden V640-FPS/Frame-Pacing-Governor. In der höchsten Stufe bleiben beide Kegel und Nebelebenen; bei Last wird zuerst der zweite Kegel und die zweite Nebelebene ausgeblendet und die große Boden-Nebelfläche geringfügig verkleinert. Hauptkegel, Boden-Nebel, Show-Timeline, Lyrics, Avatare und Lichtsteuerung bleiben erhalten. Manuell programmierte Lichtregie wird nicht aufgrund der V640-Last gekappt; die manuelle Performance-Stufe gilt weiterhin.
- **Shader:** Ausgeblendete/schwarze/nahezu transparente Pixel werden vor dem Blending verworfen. LED-Wand-Fragmente werden **vor** den aufwendigen Musterberechnungen maskiert; Nebel und Mist verwenden dieselben weichen Farbverläufe.
- **Bühnenvorschau:** Aus vier überlappenden zweiseitigen Kugeln wurden zwei weiche, kamerazugewandte Nebelflächen (ein Mesh pro HazeCloud). Spotlights, Nebelanimationen und Konfiguration bleiben auswählbar.
- **Kein neuer Render-Loop oder Renderer.** Die Budgetobjekte sind eingefroren und werden im Renderframe wiederverwendet.

## Grenzen der Messung

Die Verringerung von gleichzeitig aktiven Blending-Flächen ist strukturell belegt; echte FPS-/GPU-Zeiteinsparungen sind **ohne Browser-Messung auf Zielhardware nicht quantifiziert**. Single-Sided-Kegel können aus ungewöhnlichen Kamerapositionen weniger intensiv erscheinen als doppelseitige Kegel. Der V770-Performanceverlauf und V771-Langzeittest helfen beim anschließenden Vergleich.

## Tests

- `npm run test:v773 && npm run test:v773:types` – reiner Renderplan, JSX-Integration, Regression/Shader-Masken und isolierte Typprüfung
- `npm run test:v772` sowie alte Bühnen-/Nebelsimulationstests
- `npm run typecheck`, `npm run build` – vollständige Produktionsvalidierung (benötigt `npm ci`)
- `npm run test:v771:browser -- --cycles=90 --batch=15` – GPU/JS Langzeit-Stresstest mit lokalem Next.js-Server
