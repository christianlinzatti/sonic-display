# Sonic Display V770 – Live Performance & Speicher

- Live-FPS, P95-Framezeit, Draw Calls, Dreiecke, WebGL-Geometrien, Texturen und Shader-Programme aus dem **bestehenden** Renderer; keine zweite Szene.
- GLB-Cache: aktive/inaktive GLBs, geschätzte aktive/inaktive Speicherbytes, inaktive Budgets. Aktive GLBs werden nicht invalidiert.
- Alle fünf Sekunden eine Stichprobe; maximal 360 Einträge (ca. 30 Minuten). Es gibt keine neue Animationsschleife und keine Netzwerk-Übertragung.
- Anzeige unter **Einstellungen → Dashboard** und **Diagnose**, mit fünfminütigen Zeitreihen, JSON-Export und Zurücksetzen.
- Trendbewertung erst nach zwei Minuten mit konstanter Avataranzahl und zusammenhängenden Messwerten, ausschließlich als Hinweis, kein verifizierter Leak.
- GPU-Zähler messen **Anzahl der Ressourcen**, nicht GPU-VRAM. Performance.memory (JS-Heap) gibt es nur in manchen Chromium-Browsern.

## Prüfen

```bash
npm ci
npm run test:v770
npm run test:v770:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Eine echte Langzeitmessung (Bühnen- und Avatarwechsel) kann nur in einem Browser mit WebGL auf Zielhardware erfolgen. V767 stellt dafür den GPU-Mehrfachwechseltest bereit.
