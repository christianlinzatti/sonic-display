# Sonic Display V906 – Concert Benchmark Report Studio

## Bedienung

1. Unter **✦ LIVE FX → Concert Quality Intelligence → V905 Guided Concert Benchmark Studio** mindestens einen echten V826-Benchmarkdurchlauf beenden.
2. Der **V906-Bericht** erscheint direkt darunter, ohne zusätzlichen Messprozess.
3. Vergleichbare Gruppen auswählen. FPS-Median, Spannweite und Interquartilbereich (IQR) sowie Framezeiten, mittlere V826-P95-Fenster und FX-Druck betrachten.
4. Für stabilere Aussagen mindestens drei voneinander unabhängige Durchläufe derselben Songszene, mit gleichem FPS-Ziel, Profil und Preset aufnehmen.
5. Hinweise für Renderlast/Schwankungen prüfen und als **JSON oder Markdown** exportieren.

## Messgrenzen und Datenschutz

- Nur die **vorhandene V826-Telemetrie** und vollständig validierte V905-Durchläufe; keine simulierten Werte, GPU-Zeit, optische Qualitätsbewertung oder Kausalitätsbehauptungen.
- Die Durchschnittswerte der V826-P95-Fenster sind **kein globales P95** aller Einzelframes.
- Unterschiedliche Songkennungen, Szenen, FPS-Ziele, Profile und Messpresets dürfen nie vermischt werden.
- Hardwareempfehlungen beziehen sich auf **das gerade gemessene Gerät**. Keine Hochrechnung auf Raspberry Pi / Mini-PC. Für einen Kauf ist ein eigener realistischer GLB-Benchmark auf dem Zielgerät notwendig.
- Nur RAM; 18 V905-Runs maximal, bis zu sechs Berichtsgruppen; keine zweite V826-Subscription, keine neuen Three.js-Objekte.
- JSON/Markdown-Export ohne private Songkennungen, Gruppenschlüssel, genaue Zeiten oder Rohdaten. Auch das Löschen des V905-Verlaufs entfernt die V906-Berichte.

## Windows technische Release Gates

```powershell
npm ci
npm run verify:v906:focused
npm run typecheck
npm run build
npm run dev
```

Eine Produktionsfreigabe setzt wirklich installierte Abhängigkeiten, erfolgreichen Next.js-Build und einen echten WebGL-Test voraus.
