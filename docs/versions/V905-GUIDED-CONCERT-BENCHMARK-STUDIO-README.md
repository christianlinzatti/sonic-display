# Sonic Display V905 – Guided Concert Benchmark Studio

## Bedienung

1. Unter **✦ LIVE FX → Concert Quality Intelligence** V905 öffnen, Musik mit
   bestätigter V900-Szene abspielen und auf eine **neue V826-Meldung** warten.
2. Preset wählen: **Kurz = 5**, **Standard = 8**, **Ausführlich = 12**
   Messfenster. Alle Varianten verwerfen zunächst zwei neue
   Stabilisierungsmessfenster (V826 aktualisiert ungefähr zweimal pro Sekunde).
3. **Benchmark ausdrücklich starten**. Der Live-Status zeigt Warmup und
   Fortschritt. Kein Timer und keine erfundene FPS-Schätzung.
4. Nach Abschluss zeigt das Studio Median-FPS, Framezeit und FX-Druck an.
5. Für wiederholbare Ergebnisse denselben Songabschnitt, FPS-Ziel, Tier und
   dasselbe Preset mindestens **dreimal getrennt** messen. Bei großer Streuung
   meldet V905 die Ergebnisse als schwankend.
6. Alle aggregierten Gruppenergebnisse datensparsam als JSON exportieren;
   bei Bedarf den Sitzungsverlauf mit zweifacher Bestätigung löschen.

## Datenqualität und Schutz

- Quelle sind die existierenden Renderer-Frameintervalle aus **V826**, nicht
  GPU-Zeiten, Bildanalyse oder behauptete Konzertqualität.
- Jeder Durchlauf wird bei Pause, Seek, Song-/Szenenwechsel, anderem
  Performance-Tier/FPS-Ziel oder fehlender Telemetrie ungültig.
- Ein Vergleich setzt **drei echte, voneinander getrennte Durchläufe** voraus.
  Selbst dann ist er eine vorsichtige Beobachtung, keine statistische Evidenz
  für Ursache/Wirkung. Unterschiedliche Songs werden niemals gemischt.
- Maximal 18 vollständige Runs und sechs dargestellte Gruppen, nur RAM.
- Export enthält weder Track-/Spotify-ID, Wiedergabeposition, Samplezeit
  noch einzelne Frame-Messungen. Keine Persistenz, zusätzlichen V826-Listener,
  RAF-/WebGL-Objekte oder automatische V902/V903-Änderungen.

## Windows

```powershell
npm ci
npm run verify:v905:focused
npm run typecheck
npm run build
npm run dev
```

Produktionsfreigabe erfordert die wirklich installierten Abhängigkeiten, einen
vollständigen Next.js-Build und einen echten Browser-/WebGL-Test.
