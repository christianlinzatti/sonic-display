# V403 – Production Quality & Display Optimization

Basis: Sonic Display V402; es wurden keine vorhandenen Dateien entfernt und keine Show-/Spotify-/Choreografie-APIs geändert.

## 1. Dynamisches Pixelbudget für Touchdisplays

Die bereits vorhandene V388-Display-Auflösung nutzt jetzt zusätzlich `resolveDisplayPixelsV403` (`components/visualizer/displayPixelBudgetV403.ts`). Die reine Funktion berücksichtigt die tatsächliche Browser-Viewport-Größe, das gewählte Display-Profil, die Zahl der Avatare sowie Speicher-/CPU- und `saveData`-Hinweise. Sie begrenzt **nur die Obergrenze des device pixel ratio**, nie Audio oder Bewegungszeit, und aktiviert sich ausschließlich bei **Touch-/Kioskmodus + V388-Profil Adaptiv/Energiesparen/Schärfer**. Das bisherige Profil „Standard“ bleibt unverändert. Kein Rendering über die V388-Auflösungsgrenze hinaus.

Anvisierte Pixelbudgets (Viewport-Schätzungen, nicht GPU-Messungen):

| Profil | 1–2 Avatare, starke Hardware | ≥3 Avatare oder begrenzte Hardware |
|---|---:|---:|
| Adaptiv | 3,5 Mio. | 1,9 Mio. |
| Energiesparen | 1,2 Mio. | 1,2 Mio. |
| Schärfer | 4,1 Mio. | 2,4 Mio. |

Die WebGL-Auflösung wird nicht unter DPR **0,5** abgesenkt. Daher kann eine sehr hochauflösende Viewport-Konfiguration oberhalb des Pixelbudgets bleiben. Die Berechnung verwendet die Größe des Browserfensters und ist deshalb eine konservative Obergrenze, keine Messung tatsächlich gerenderter Canvas-Pixel. Keine Erkennung der physikalischen Displaydiagonale.

## 2. Zuverlässige Bildmessungen

`AdaptivePerformanceController` ignoriert ausgeblendete Tabs, leert seine Stichproben beim `visibilitychange` und liest bei DPR-/Fenstergrößenänderungen die neue Pixelratio neu ein. Dadurch führen Hintergrundpausen nicht zu einer falschen FPS-Lastbewertung. Vorhandene V253/V254/V355-Hysterese und deren manuelle Übersteuerung bleiben erhalten. Die Render-Telemetrie ergänzt die aktuell von der Live-Bühne gemeldete Avatar-Anzahl, ohne zusätzliche Loops.

## 3. Live-Produktionsdiagnose

**Touchmodus → Mehr · Display → V403 · Produktionsdiagnose.** Die React-Komponente wird erst beim Öffnen geladen. Sie zeigt Displayabmessungen, gemeldete Avatare, Live-FPS, P95, Draw Calls, aktuellen DPR/Qualitätstier und geschätzte Pixelbudgets. Die Darstellung verwendet die bereits vorhandene Render-Telemetrie und einen 2,5-Sekunden-UI-Takt, der ausschließlich bei geöffnetem Fenster läuft. Veraltete Messwerte werden nicht als aktuelle Performance ausgegeben. Es werden keine Daten versandt.

## 4. Produktionsvorcheck (offline)

`npm run doctor:production` prüft alle statischen relativen und `@/`-Imports der TS-/TSX-Quellen auf lokal fehlende Dateien. Er erkennt sowohl `next.config.ts` als auch `.mjs`/`.js`, zeigt Paketstatus und Lockfile-Verfügbarkeit an, ohne `.env` oder Tokens auszugeben. Der Befehl ist auch ohne installiertes Next.js lauffähig und ist **kein Ersatz** für einen TypeScript- oder Next.js-Build. Optional: `node scripts/production-doctor-v403.cjs --strict` scheitert zusätzlich, solange Abhängigkeiten oder `package-lock.json` fehlen.

## 5. Verifikation und Hardware-Checkliste

```powershell
npm install
npm run test:v403
npm run doctor:production
npm run verify
```

Auf dem Zielgerät: 1, 2 und 4 Avatare in derselben Szene vergleichen; Displayprofile „Standard“, „Adaptiv“, „Energiesparen“ umschalten; 30–60 Minuten laufen lassen; minimieren / wieder öffnen; WebGL-Verlust nur auf einem Testgerät provozieren; GPU-/CPU-Temperatur mit externem Systemmonitor beobachten. Anschließend FPS, P95 und Wiederherstellungsversuche aus V395 prüfen.

**Offene Grenze:** Die Projekt-ZIP enthält derzeit kein npm-Lockfile und die Testumgebung hat keine vollständigen Next.js-/React-Pakete. Ein wirklicher Produktionsbuild sowie Langzeittests auf dem 10-Zoll-Zielgerät sind noch ausständig. Nach `npm install` sollten für reproduzierbare Installationen das erzeugte `package-lock.json` commitet und künftig `npm ci` verwendet werden.
