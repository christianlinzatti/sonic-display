# V984 – AI Concert Story Director

## Ziel

Nach **V983 AI Song Intelligence** kann Sonic Display aus einer rein metadatenbasierten,
unsicheren Songinterpretation ein **zusammenhängendes Fünf-Akt-Storyboard** entwickeln:
Prolog, Fokus, Öffnung, Höhepunkt und Epilog. Die fünf möglichen Szenenpositionen
`intro`, `verse`, `hook`, `drop`, `finale` sind **kreative Hypothesen** und keine
bestätigten Zeitabschnitte.

## Bedienung

1. Spotify-Titel abspielen und das **Live-FX-Deck** öffnen.
2. Unter **V983 · AI Song Intelligence** die **Lokale Song-Idee** oder eine
   **Song mit KI interpretieren**-Antwort erstellen.
3. Direkt darunter unter **V984 · AI Concert Story Director** den Regiestil
   Filmisch / Festival / Intim wählen.
4. **Lokale Konzertgeschichte** (offline) oder **KI-Konzertgeschichte entwerfen**
   (opt-in, Internet/API-Key erforderlich) auswählen.
5. Fünf Akte mit Szenenidee, Leitmotiv, Kamerakonzept, Übergang und relativer
   Entwurfsenergie betrachten.
6. Optional **Virtuellen Story-Look übernehmen** anklicken. Dies verändert nur
   die bereits freigegebenen V982/V885/V894-Virtual-Looks und reduziert nötigenfalls
   die FX-Obergrenze. Die bestehende V982 Rückgängig-Funktion ist verfügbar.

## Architektur und Schutzgrenzen

- `lib/aiConcertStoryV984.ts`: strenge Format- und Wertevalidierung, Offline-Generator,
  reine Umsetzung eines Storyboards auf die vorhandene virtuelle V982-Planform.
- `components/visualizer/ConcertStoryDirectorV984.tsx`: opt-in Vorschau mit
  `AbortController`, Track- und Songideenwechsel-Schutz, keine automatische KI-Abfrage.
- `components/visualizer/SongIntelligencePanelV983.tsx`: V984 wird nur nach
  Vorliegen einer V983-Songidee angezeigt. Kein eigener Spotify-Polling-Timer.
- `app/api/ai/concert-story/route.ts`: Node-API mit Spotify-Session,
  Origin-/Größen-/Ratenprüfung (max. vier Anfragen pro Session-Fenster),
  kurzer serverseitiger 18-Sekunden-Timeout, OpenAI Responses API mit
  JSON-Schema und `store:false`. Nur V983-Songidee und Regiestil werden gesendet.
  Keine Spotify-Tokens, Lyrics oder Aufnahmen in der Anbieter-Nutzlast.
- KI-Texte sind **Daten**: Sie werden gereinigt und als Text angezeigt, nicht
  als Code, Hardware-Befehl oder ausführbarer Cue interpretiert.
- Keine neuen Render-Loops, Govee-/Alexa-Kommandos, Song-Seeks, Audioaufnahme,
  Speicherung von KI-Antworten oder automatische Zeitereignisse.
- Ohne bestätigte Timeline werden **keine tatsächlichen BPM, Verse/Hook-Grenzen,
  Drop-Zeitpunkte oder synchronisierten Übergänge** behauptet oder ausgelöst.
- Motion-/Performance-Gates und manuelle Vorgaben bleiben im V982 Apply-Pfad erhalten.

## Prüfung

- `npm run test:v984` – API-, Schutz- und Story-Regressionsgruppen.
- `npm run test:v984:types` – isolierte vollständige Typprüfung des neuen Pfads
  (benötigt `npm ci` / projektlokale Abhängigkeiten).
- `npm run verify:v984:focused` – weitere Vorgängerversionen, Syntax, Architektur.
- CI (`V832 Continuous Technical Validation`) und `scripts/vercel-production-build.cjs`
  enthalten die V984-Prüfungen; vor Freigabe vollständiger TypeScript-Check,
  Next.js-Produktionsbuild und GitHub-Actions-Status auf Node 24 bestätigen.

## Ausblick V985

V985 kann bestätigte Songstruktur-Daten zur sicheren Zuordnung von Story-Akten
nutzen. **Bis dahin ist V984 ein Storyboard, keine automatische Cue-Timeline.**
