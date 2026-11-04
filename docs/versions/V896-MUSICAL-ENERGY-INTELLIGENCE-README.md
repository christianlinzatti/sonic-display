# V896 – Musical Energy Intelligence

## Ziel und technische Grenzen

V896 ergänzt den regelbasierten, durch die **bestätigte** Songstruktur aus V604/V895 gesteuerten Concert Director um kurze, gemessene Live-Energieakzente. Die bestehende `AudioFeatures`-Quelle stellt normalisierte Mikrofon-Messwerte bereit (`energyEnvelope`, `bass`, `attack`, `kickAccentIntensity`). Die neue Version analysiert **keine Roh-Audiospuren**, trennt keine Instrumente, erkennt weder Sänger noch neue Drops und stellt **keine externe generative KI** dar.

## Die Änderungen

- `components/visualizer/musicalEnergyIntelligenceV896.ts`: Validiert Eingabewerte strikt (0–1), berechnet eine schnell geglättete Energie und einen langsamen, adaptiven Referenzpegel. Der Trend vergleicht die beiden Kurven; Bass- und Anschlag-Akzente fließen begrenzt ein. Keine Audiobibliothek, Timer, GPU-Ressourcen oder Browser-Netzwerkzugriffe.
- `components/visualizer/DynamicStage.tsx`: Aktualisiert den Messzustand im bestehenden R3F-Frame-Loop; verändert **nur bereits aktivierte** Spotlight- und LED-Parameter. Setzt den Messzustand bei Pause, Songwechsel, Seek, manuellem FX, Blackout, niedriger Leistungsstufe oder fehlender V895-Automatik zurück.
- `components/visualizer/StageCameraDirectorV289.tsx` und `VisualizerStage.tsx`: Nutzen denselben songgebundenen Messzustand für geringe Änderungen der automatischen Kameraglättung und Tanzintensität. Manuelle Kamera/Tanzvorgaben behalten Vorrang. Veraltete Samples sind nach spätestens 1,2 Sekunden ungültig; auch Song-ID, Dauer und Wiedergabeposition müssen passen.
- `components/visualizer/LiveFxDeckV881.tsx`: Separater Bereich **V896 Musical Energy Intelligence**. Schalter für Dynamik/Bass sowie Kamera/Tanz/Licht/LED; Schutz für Lyrics, Profile Subtil/Ausgewogen/Expressiv, Empfindlichkeit und Anzeige aktueller Werte. Speicherung unter `sonic-musical-energy-intelligence-v896` und JSON-Export **eines aktuellen Messpunkts**, ausdrücklich keiner fiktiven Song-Gesamtanalyse.
- `components/visualizer/concertStageSyncV882.ts`: Übergibt nur die normalisierten Einstellungen; häufige Audio-Messwerte werden bewusst **nicht** über React-State, Event-Listener oder Render-Subscriptions weitergegeben.

## Schutz und Verhalten

1. Ein bestätigter V604/V895-Szenenplan und laufende, automatisch gesteuerte Show sind Voraussetzung. Ohne geeignete Audiomesswerte bleiben alle V896-Gains exakt `1`.
2. Die Audio-Reaktion ist **kein neues Songstruktur-/Beat-Erkennungssystem** und kann eine Strophe nicht eigenmächtig zum Drop erklären.
3. Harte Schutzregeln: Stopp, Seek, Trackwechsel, Blackout, manuelle Timeline, Lyrics-Priorität, Reduced Motion, Low-Tier und abgeschaltete Effekte.
4. Gain-Multiplikatoren sind auf `0,91–1,10` beschränkt; die früheren V895-Limits und GPU-/Lichtbudgets gelten zusätzlich. Es entstehen **keine** zusätzlichen Lights, Meshes, Draw Calls, WebGL-Passes oder Audio-Prozesse.
5. Bei gleichbleibendem Spotify-Playback-Zeitstempel aktualisieren echte R3F-Frame-Deltas die Messwerte trotzdem; normale sekündliche Spotify-Ticks bewirken keinen künstlichen Reset. Große Sprünge und Rückwärtsbewegungen starten eine neue Glättung.

## Windows

```powershell
npm ci
npm run verify:v896:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ `scripts/verify-v896-windows.ps1` ausführen. Der komplette Produktionsbuild war in der Erstellungsumgebung wegen fehlender npm-Abhängigkeiten nicht verfügbar und muss auf einem korrekt eingerichteten Entwicklungsrechner geprüft werden.
