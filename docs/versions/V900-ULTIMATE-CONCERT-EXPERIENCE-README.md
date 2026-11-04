# Sonic Display V900 – Ultimate Concert Experience 5.0

## Überblick

V900 bündelt die bereits existierenden Versionen V882–V899 zu einer
zusammenhängenden, regelbasierten **visuellen Partitur** pro Song. Die
Partitur benötigt eine verifizierte V604-Songtimeline; bei fehlender
Evidenz bleibt sie vollständig neutral. Sie verwendet keine externe KI,
keine erfundenen Songabschnitte und keine neuen 3D-Ressourcen.

## Konzertbogen

- **Einleitung:** Bühne sichtbar aufbauen, Konzertwirkung vorbereiten
- **Strophen:** Portrait- und Lyrics-Fokus mit zurückgenommener LED-Wall
- **Aufbau:** bestehende Architektur/Licht als Übergang in den Höhepunkt
- **Hooks:** Ensemble-Fokus und ausgewogene Showfläche
- **Drops:** bestehende Effekte erhalten relativ mehr Headroom – nicht durch
  neue Spitzen, sondern weil weniger wichtige Szenen sparsamer sind
- **Finale:** volle normale Wirkung der bereits aktivierten Effektkanäle

Schnelle und langsame Übergänge sind auswählbar; wiederholte Motive variieren
ihre Kamera-Pacing-/Bildbreiten-Empfehlung, ohne manuell gewählte Shots zu
überschreiben. Eine optionale zeitnahe V896-Audiomessung verändert nur geringfügig
die vorhandenen Gain-Faktoren. Alle Faktoren bleiben zwischen 0 und 1.

## Integration und Sicherheit

Der Pure-Core `ultimateConcertExperienceV900.ts` erstellt und sampelt die
Partitur. Das Live-FX-Deck speichert Einstellungen über `localStorage`,
zeigt die bestätigten Szenen und exportiert den Plan als JSON. Der V882-Snapshot
verweigert fremde Track-/Laufzeit-Pläne. Die bestehende R3F-Pipeline nutzt
V900 in `DynamicStage.tsx`, `StageCameraDirectorV289.tsx` und
`VisualizerStage.tsx`. Alle bisherigen Effekte bleiben abschaltbar.

Manuelle Kamera-/Licht-/Choreografie-/FX-Eingriffe, Lyrics-Schutz, Footwork,
Blackouts, Pause, Seek, Reduced Motion und Performance-Limits haben Vorrang.
V900 erstellt keine 3D-Objekte, Scheinwerfer, Animationsclips, Beats,
Sängeridentitäten oder eigenständige Renderloops.

## Tests

```powershell
npm ci
npm run verify:v900:focused
npm run typecheck
npm run build
npm run dev
```

Der tatsächliche Teststatus steht separat in `V900-VERIFICATION.md`.
