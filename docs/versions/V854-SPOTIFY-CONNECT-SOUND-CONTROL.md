# V854 – Spotify Connect Sound Control

Erweiterung von V853 auf Basis der bestehenden V851/V852-Musikbibliothek.

## Bedienung

1. Spotify verbinden und mindestens einen Spotify-Connect-Lautsprecher aktivieren.
2. In der permanenten Mini-Leiste auf das **Lautsprechersymbol** tippen.
3. Das gewünschte Gerät in der Liste antippen. Spotify Connect bekommt den
   Übertragungsauftrag mit dem aktuellen Play/Pause-Status. Die Bestätigung
   bedeutet noch nicht, dass Spotify den Wechsel bereits ausgeführt hat.
4. Lautstärke über den Schieberegler einstellen, falls das aktive Gerät
   `supports_volume` meldet. Der Wert wird erst beim Loslassen bzw. nach
   Tastaturänderungen gesendet, nicht bei jedem Schiebeschritt.
5. Shuffle an- oder ausschalten. Repeat durchläuft **Aus → Playlist → Titel → Aus**.

Einstellungen und Geräte werden beim Öffnen, bei Gerätewechseln und beim
sichtbaren 45-Sekunden-Geräte-Refresh aktualisiert. Ein Fehler wird angezeigt,
ohne die bisherige Musikbibliothek zu blockieren. Änderungen aus dem Popover
aktualisieren die Geräteauswahl im Bibliotheksdialog.

## Technik und Sicherheit

- GET `/api/spotify/player/settings`: Spotify `/v1/me/player`; normalisierte
  Geräte-ID, Lautstärkeunterstützung, Lautstärke, Shuffle, Repeat, Play/Pause.
  204 bedeutet: kein aktueller Spotify-Wiedergabestatus.
- POST auf denselben Endpunkt: `transfer`, `volume`, `shuffle`, `repeat`.
  Validierte Geräte-ID, Integer 0–100, Boolean, Repeat-Enum. Keine freien
  Spotify-Pfade oder unbekannten Argumente. Strikter Same-Origin-Check.
- Spotify OAuth-Scopes sind bereits ab V851 enthalten:
  `user-read-playback-state` und `user-modify-playback-state`.
- Nach einem Gerätewechsel kann Spotify die neue Aktivierung verzögert melden;
  deshalb erneute Abfrage nach ca. 1,8 Sekunden.
- Keine eigene Audioausgabe und kein zweites Polling von Songdaten. Der
  Mini-Player verwendet weiterhin `MusicContext`.
- Einige Connect-Geräte gestatten keine Lautstärkeänderung; dann bleibt
  der Regler deaktiviert. Spotify Premium ist für Player-Befehle notwendig.
- Spotify-Antworten können 401, 403, 404 oder 429 enthalten. Die UI bietet
  passende Fehlermeldungen und bei fehlendem Scope erneute Anmeldung.

## Prüfungen

```bash
npm run test:v854
npm run test:v854:types
npm run test:v853
npm run test:v852
npm run test:v851
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Erst nach erfolgreichem vollständigen TypeScript-Check, Next.js-Produktionsbuild
und echtem Spotify-Connect-Test auf Hardware als fertig abgenommen betrachten.
Die API unterstützt keine zuverlässigen Zusagen über die Reihenfolge
unmittelbar aufeinanderfolgender Player-Befehle.
