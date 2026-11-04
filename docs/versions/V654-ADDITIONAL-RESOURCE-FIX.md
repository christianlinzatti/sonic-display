# V654 – Zusätzlicher Ressourcen- und Polling-Fix

- **DancePostProcessingV468**: `EffectComposer.dispose()` genügt nicht für hinzugefügte Passes. Shader-, Afterimage- und Output-Passes werden vor dem Composer explizit und nur einmal entsorgt; das deckt zwei zusätzliche Afterimage-Renderziele und die pass-eigenen Materialien ab.
- **Spotify**: Das Playback-Refresh wartet nicht mehr auf Lyrics. Eine neue Anfrage darf beginnen, obwohl die vorherige Lyrics-Anfrage noch läuft. Trackwechsel/Unmount brechen alte Lyrics ab; späte Ergebnisse werden nach Track-ID und Generation verworfen. Der optionale Genius-Provider hat eine 5-Sekunden-Wartefrist; der gesamte einzelne Provider-Call ist zudem serverseitig auf 9 Sekunden begrenzt. Die verwendete Fremdbibliothek `genius-lyrics-api` bietet hier keinen abbrechbaren Request: ihr Netzwerkaufruf kann trotz abgelaufener Wartefrist intern weiterlaufen.
- **Mikrofon**: Bei Startfehlern wie einem fehlgeschlagenen `AudioContext.resume()` werden sofort Tracks gestoppt, AudioContext geschlossen, Worker beendet, Animation-Frame abgebrochen und Analysezustände zurückgesetzt. Verzögerte Starts nach Unmount werden nicht fortgeführt.
- **GLTF-Vorschaumodelle**: Vorschau-URLs verwenden eine eigentümerzählende LRU-Verwaltung mit maximal zwölf unbenutzten Modellen, Blob-URLs werden bei Freigabe sofort aus `useGLTF` entfernt. Aktive Vorschau- und Hauptbühnenmodelle werden über Besitzerzählung geschützt; gemeinsam genutzte GPU-Geometrien/Materialien werden absichtlich nicht durch die Cache-Verwaltung zerstört. Die übrigen permanenten Bühnen-/Motion-Caches sind nicht Teil dieser Begrenzung.

## Tests

- `npm run test:resilience:v654`
- `npm run test:resilience:v654:types`
- `npm run test:smoke:v654`
- `npm run verify` – vollständiger Typecheck, historischer Testlauf und Produktionsbuild mit installierten Abhängigkeiten.

Grenzen: Echte GPU-Speichermessungen, Abbruch des Fremdbibliotheks-Netzwerkaufrufs und der komplette Next.js-Produktionsbuild sind separat zu validieren.
