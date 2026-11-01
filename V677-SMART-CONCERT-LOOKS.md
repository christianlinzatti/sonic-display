# Sonic Display V677 – Smart Concert Looks

## Was ist neu?

Im Tab **Zuletzt gespielt → Konzert-Designer** befindet sich der neue Abschnitt **Automatische Look-Auswahl**. Das Feature ist **standardmäßig AUS** und wird vom Benutzer durch einen separaten Schalter eingeschaltet. Es setzt mindestens einen selbst gespeicherten, gültigen V676-Look voraus.

- Beim Beginn eines neuen, tatsächlich **abgespielten** Spotify-Titels wird das **aktuell erkannte, ausreichend sichere** Genre verwendet. Eine manuelle Genre-Korrektur ist ebenfalls gültig.
- Die Genre-Zuordnung ist mit der ID genau dieses Songs verknüpft. Ein zurückgebliebenes Ergebnis des Vorgängersongs kann keine Bühnenumschaltung auslösen.
- Auswahlpriorität: **genaues Genre → verwandte Genre-Familie → universeller Look**; keine Auswahl, wenn keine gültige Zuordnung oder kein passender Look vorliegt.
- Bei mehreren gleich gut passenden gespeicherten Looks entscheidet ein stabiler Song-Hash. Das erzeugt Variation zwischen Songs, ohne zufällige Neuauswahl während desselben Songs.
- Ein Look darf nur in den ersten **20 Sekunden** des Titels automatisch angewendet werden. Kommt die Genre-Erkennung später, bleibt die aktuelle Show unangetastet.
- Es werden **ausschließlich** sechs V676-Regler geändert: Bühne, Lichtreaktion, Lichtstärke, Tanzstil, DanceFX an/aus und FX-Stärke. Kamera, Lyrics, Phoneme, Sängerrollen, Show-Regie, Ablauftimelines, GLB-Modelle und andere Nutzervoreinstellungen sind tabu.
- **Manuelle Bühnen-, Licht- oder Tanzänderungen beenden die Automatik.** „Auf Bühne anwenden“ aus der Look-Bibliothek schaltet die Automatik ebenfalls aus.
- Ausgeschaltete Automatik verändert die derzeit sichtbare Bühne nicht. Ein Pausieren/Weiterlaufen desselben Titels wechselt nicht erneut den Look.

## Was bedeutet „Stimmung“?

Der angezeigte Begriff („Rap-Groove“, „Festival-Energie“, „Live-Arena“, „Sanfte Atmosphäre“ usw.) ist eine **Beschreibung des Genre-Stils**, **keine** gemessene Emotion und **keine** Echtzeit-Audioenergieanalyse. Die automatische Auswahl verwendet nur das validierte Genre und den Songschlüssel; sie behauptet nicht, Verse/Hook/Drop selbst neu zu erkennen.

## Technik und Einstellungen

- `lib/smart-concert-look-v677.ts`: reine Selektionslogik und Schutzhilfen.
- `components/SmartConcertLookControllerV677.tsx`: einmalig auf der Hauptseite montierter, unsichtbarer Controller, ohne zusätzliche API-Aufrufe oder Timers.
- `hooks/useGenreDetection.ts` und `context/MusicContext.tsx`: liefern `genreTrackId` für sichere Erkennung.
- `components/ConcertLookDesignerV676.tsx`: Schalter und aktuelle Empfehlung, V676-Library bleibt unverändert. Bibliotheksänderungen aktualisieren die Auswahl erst zum nächsten Songwechsel.
- `smartLookAutoV677` wird in `sonic-display-ui-preferences-v1` gespeichert; die vorhandene **Gesamtsicherung** deckt diese UI-Einstellung und die separate V676-Look-Library bereits ab. Keine neuen Berechtigungen, Tokens oder gespeicherte Hörverläufe.

## Hinweise

Die Genre-Erkennung verwendet weiterhin die vorhandene Genre-Pipeline; für Last.fm-gestützte Informationen kann `LASTFM_API_KEY` erforderlich sein. Nicht erkannte Genres führen zu **keinem** automatischen Lookwechsel. Der Beginn der Wiedergabe muss im Spotify-Polling sichtbar sein und die Erkennung innerhalb des frühen Songfensters fertig werden.

Tests: `npm run test:v677` und `npm run test:smoke:v677`. Ein Produktionsrelease setzt darüber hinaus erfolgreiches `npm run typecheck` und `npm run build` in einer vollständig installierten Umgebung voraus.
