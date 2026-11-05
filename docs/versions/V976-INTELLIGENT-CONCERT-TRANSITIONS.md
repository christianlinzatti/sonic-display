# V976 – Intelligent Concert Transitions

## Implementierung

`lib/intelligentConcertTransitionsV976.ts` bildet **nur tatsächlich bestätigte, benachbarte V318-Songabschnitte** ab. Die vorhandene V960-Helferfunktion prüft vorher Track-ID, Sequenzgrenzen, Phase und Konfidenz ≥0,5. Keine Vorhersage unbestätigter Drops.

- Kontinuierliche RGB-Farb-, Lichtintensitäts-, Spotlight- und Light-Gain-Überblendungen mit deterministischer Smoothstep-Kurve. Die Geschwindigkeit hängt von Songphase und Stil ab (Sanft, Ausgewogen, Dynamisch); Lyrics begrenzen die maximale Dauer.
- Neu hinzukommende starke Effekte (Bass-Impact, Papier, Laser) werden erst bei fortgeschrittener Überblendung freigegeben, ohne die bestehende Effektliste dauerhaft zu verändern.
- Optionale **Kameraübergabe** verzögert den Wechsel der *automatischen* V958/V354-Shot-Auswahl. Die vorhandene `StageCameraDirectorV289`-Interpolation bleibt für sichtbare Fahrten verantwortlich. Es wird kein zweiter Kamera-Controller erzeugt.
- V976 ersetzt nur beim **virtuellen** Renderpfad die V960-Blendlogik, wenn die Option eingeschaltet ist. Der separate Govee-LAN/Hardware-Pfad sowie Alexa und Spotify sind nicht betroffen.

## Sicherheit / Prioritäten

Die Funktion ist standardmäßig **ausgeschaltet**. Sie greift nicht bei manuellen V354-Cues, Timeline-Overrides, gespeicherten Shows, Pausen, ungültigen Metadaten, reduzierter Bewegung oder niedriger Performance/Pi-Eco. Keine zusätzlichen Scheduler, Poller, WebGL-Meshes, Netzwerk- oder Govee-Kommandos.

## Testbefehle

```bash
npm run test:v976
npm run test:v976:types
npm run verify:v976:focused
```

Für eine Produktionsfreigabe sind zusätzlich `npm ci`, vollständiges `tsc --noEmit` und ein **echter Next.js-Produktionsbuild** in Node 24 nötig. Isolierte TypeScript- und Funktionsprüfungen allein reichen nicht.
