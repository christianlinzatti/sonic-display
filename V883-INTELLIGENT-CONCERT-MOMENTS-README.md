# Sonic Display V883 – Intelligent Concert Moments

**Vollständige Weiterentwicklung der bereitgestellten V882**, nicht nur ein
Patch. Alle bisherigen V880/V881/V882-Funktionen bleiben enthalten.

## Was ist neu?

- **Regiegeplante Highlights:** Aus den tatsächlich vorhandenen und geprüften
  V763/V604-Show-Szenen werden dosiert Hook-Momente, Drop-Impacts, Aufbauten
  und gegebenenfalls ein Show-Finale vorgeschlagen. Maximal sechs pro Song,
  mindestens 18,5 Sekunden Abstand, maximal zwei pro Songviertel. Ruhige
  Portrait-/Dialog-/Breath-Szenen erzeugen keine neuen V883-Momente.
- **3D-Bühnen-Kopplung:** Drop und Hook erhalten sanfte 3D-Bassringe;
  das ausgewählte Finale kann das vorhandene **instanzierte 3D-Konfetti**
  nutzen. Build-ups/Hooks/Finale beeinflussen den **vorhandenen** Spotlight-
  Sweep. Automatische Tänzer bekommen nur einen geringfügigen zusätzlichen
  Akzent. Keine zusätzlichen WebGL-Objekte, Kamera-Eingriffe, Strobes oder
  Full-Stage-Flashes; vorhandene V882-Obergrenzen bleiben gültig.
- **Neue Bedienoberfläche:** Im rechten oberen `✦ LIVE FX` die Gruppe
  **V883 · Intelligent Concert Moments** öffnen. Dort lassen sich
  die Automatik, eine Moment-Einblendung, Countdown und drei Profile
  (`Ausgewogen`, `Cinematic · dezent`, `Festival · energischer`) einstellen.
  Darunter stehen alle geplanten Show-Momente mit Songpositionen und
  Begründungen. JSON-Export für die Moment-Liste steht zusätzlich zum
  bisherigen V881-Szenenexport bereit.
- **Persistenz:** Einstellungen bleiben unabhängig von V881/V882 unter
  `sonic-concert-moments-v883` im lokalen Browser gespeichert. Speicherfehler
  werden im FX-Deck gemeldet.
- **Bewegungs- und Sicherheitsgrenzen:** Fehlende Timeline, falscher Track,
  Seek, Pause, reduzierter Bewegungsmodus, niedrige Performance-Stufe,
  bewusst geschaltete Blackouts und manuell bearbeitete Tanz-/Licht-Timelines
  werden respektiert. Ein manuell ausgelöster V881-FX hat beim Überschneiden
  Vorrang vor dem automatischen V883-Moment.

## Grenzen der Funktion

**„Intelligent“ bedeutet hier eine nachvollziehbare regelbasierte
Show-Dramaturgie, keine neue KI- oder Audioanalyse.** Die genaue
Songabschnittsquelle stammt aus den vorhandenen V604/V763-Planern. V883
identifiziert weder live gesungene Stellen noch echte Bass-Drops per
Mikrofon/Stems. Das Finale ist eine dramaturgische *Empfehlung* innerhalb
des bestätigten letzten Abschnitts – keine Behauptung über das tatsächliche
Musik-Ending. Bei fehlenden verifizierten Szenen bleibt V883 aus; die drei
manuellen V881-Effekte funktionieren weiterhin.

Im Avatar-/3D-Modus nutzt die Show die V882-Floor-Ring- und Konfetti-Objekte.
In anderen Visualizer-Modi siehst du weiterhin die leichten 2D-Looks und die
V883-Bannereinblendung, jedoch keine zusätzlichen 3D-Objekte.

## Unter Windows testen

```powershell
npm ci
npm run verify:v883:focused
npm run check:architecture
npm run typecheck
npm run build
npm run dev
```

Oder das Windows-Gate mit Node/npm-PATH-Absicherung:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-v883-windows.ps1
```

Nach dem Start: Spotify-Titel abspielen, Avatar-/3D-Modus wählen,
`✦ LIVE FX` öffnen und V883 einschalten. Der Moment-Plan erscheint nur,
wenn die Bühne eine gültige V604/V763-Timeline veröffentlicht. Bei laufender
Show ein paar verifizierte Hooks/Drops/den Schluss beobachten und manuelle
Schalter, Pausen, Songwechsel und reduzierte Bewegung ausprobieren.

## Nachweis

Siehe `V883-VERIFICATION.md`. Die fokussierten Prüfungen sind grün, der
vollständige produktive Next.js-Build konnte aufgrund fehlender
npm-Dependencies in dieser Offline-Umgebung **nicht bestätigt** werden.
Vor einem produktiven Release sind alle Gates unter vollständigen
Lockfile-Abhängigkeiten sowie ein tatsächlicher Browser-/WebGL-Test Pflicht.
