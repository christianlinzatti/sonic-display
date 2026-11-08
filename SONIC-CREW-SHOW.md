# Sonic Stage Crew – Musik- und Showpaket 4

Unter **Settings → Avatar → Sonic Stage Crew · Musik & gemeinsame Show** steuert
jetzt ein gemeinsamer Director die drei eingebauten Figuren. Die GLBs und ihre zwölf
Clips aus Paket 3 bleiben unverändert; dieses Paket ergänzt die Live-Steuerung und Bedienung.

## Musiksteuerung

Die Automatik arbeitet im Modus **Hybrid** mit der vorhandenen Songposition, Genre-,
Abschnitts-, Energie- und Tempoangabe. Sie erzeugt keine neue Audioanalyse.

- Ruhige Abschnitte verwenden bevorzugt `Idle_Breathe`.
- Strophen wählen je nach Genre beispielsweise House, Hip-Hop, Techno oder Robot.
- Refrains verwenden im individuellen Modus die eigenen Signature-Tänze.
- Drops wählen kräftigere vorhandene Clips, etwa Shuffle, Festival Bounce oder Robot.
- Neon Pulse bekommt einen kleinen Kopfnick im Rhythmus, Nova eine dezente Blickbewegung
  und im individuellen Intro eine Begrüßung, Chrome Beat leichte LED- und Kopfakzente.

Die Reaktionen sind geplante Gesten. Es wird kein echtes Publikum oder Applaus erkannt.
Ohne gültigen laufenden Song und Songposition bleibt der neue Director inaktiv.
Ohne brauchbare Tempoangabe wird ein ausdrücklich dokumentierter Fallback von 120 BPM verwendet.
Geschätzte Abschnitts- oder Tempoangaben bleiben Schätzungen. Zusätzliche Beatmarkierungen
werden nicht erfunden. Die vorhandene manuelle Beat-/Motion-Synchronisation bleibt verfügbar.

Die Clip-Phase folgt einer gemeinsam integrierten Beat-Uhr. Änderungen am geschätzten
Tempo skalieren nicht rückwirkend die ganze bisherige Songzeit. Eine lange 12-Sekunden-
Choreografie behält ihre 24 ursprünglichen Beats und wird nicht auf einen kurzen Loop gepresst.
Standardwechsel erfolgen an Taktgrenzen mit mindestens acht Sekunden Haltezeit.
Begrüßungen dürfen nach drei Sekunden enden; ruhige Abschnitte können nach mindestens
zwei Sekunden am nächsten Takt beruhigt werden. Die vorhandenen Live-Crossfades bleiben zuständig.

Manuelle Clips, externe Motion-Dateien, gespeicherte Loops/Sequenzen, Timeline-Steuerung,
explizite Gruppen-Motion-Directors, alternative Clip-Geschwindigkeit und Reduced Motion
haben Vorrang. Andere Avatar-Modelle erhalten weiterhin die bisherige Steuerung.
Die beiden neuen Checkboxen können Musiksteuerung und eigene Reaktionen getrennt deaktivieren.

## Trio und gemeinsame Choreografien

**Trio auf der Bühne einrichten** wählt Neon Pulse, Festival Nova und Chrome Beat und
aktiviert die vorhandene Drei-Tänzer-Bühne in einer breiten, festen Reihe.
Bestehende manuelle Motion-Einstellungen werden dabei nicht gelöscht oder ausgeschaltet.
**Trio-Einrichtung zurücknehmen** stellt im geöffneten Fenster die vorherigen Modelle,
Gruppenpositionen, Visualizer-Auswahl und Crew-Einstellungen wieder her.
Nach einem Neuladen besteht dieser temporäre Rücknahmespeicher nicht mehr.
Die normale Gruppen-Bearbeitung bleibt weiterhin verfügbar.

| Modus | Verhalten |
| --- | --- |
| Individuell | Eigene Stil-/Genre-Auswahl je Figur, gemeinsame musikalische Grundlage |
| Gemeinsamer Tanz | Gleiche vorhandene Clips und gleiche Clip-Phase für das Trio |
| Kanon | Gemeinsamer House-Loop, je Tänzer zwei Beats später |
| Wechselnde Solos | Alle vier Takte wechselt die Solo-Rolle; die anderen verwenden Begleitclips |

Solo-Rollen wechseln auch bei hohem Tempo am vorgesehenen Takt. Dabei darf die
normale Acht-Sekunden-Haltezeit übergangen werden. Lange Signature-Clips können
in diesem Gruppenmodus angeschnitten werden; einzeln bleiben sie vollständig nutzbar.
Die Bühne verwendet vorhandene getrennte Mixer und Fußkorrekturen. Die neuen
Reaktions-Overlays ändern weder Wurzelpositionen noch Füße oder Original-GLB-Tracks.

## Show-Simulation

**Show-Simulation öffnen** lädt drei echte GLBs in einer eigenen Vorschau.
Diese Ansicht ist ausdrücklich eine Simulation ohne Musikverbindung.
Abschnitt, Genre, Energie, Tempo und Position werden von dir vorgegeben.
Sie verwendet dieselbe Clip- und Phasenplanung wie die Live-Anbindung.

Mit **Show-Simulation starten/pausieren** läuft bzw. hält die Vorschau.
Die Liste darunter zeigt den tatsächlich gewählten Clip und dessen ausgewertete
Clip-Zeit pro Figur. Gemeinsamer Tanz, Kanon und Solo-Rollen lassen sich direkt vergleichen.
Die Simulation endet bei 120 Sekunden; erneutes Starten setzt sie dann auf den Anfang.
Bei Reduced Motion oder deaktivierter Musiksteuerung wird nicht weitergespielt.
Die Simulation ändert weder eine Spotify-Wiedergabe noch die reale Songposition.

## Dateien und Tests

- `components/visualizer/sonicCrewDirector.ts`: reine Clip-, Rollen- und Phasenplanung.
- `components/visualizer/useSonicCrew.ts`: Einstellungen und Live-Adapter.
- `components/visualizer/sonicCrewReaction.ts`: begrenzte, rücksetzbare Kopf-/LED-Akzente.
- `components/visualizer/GltfDancerAvatarV492.tsx`: Anbindung an die vorhandenen Live-Mixer vor Rig-/Fußkorrektur.
- `components/visualizer/SonicCrewControls.tsx`: Einstellungen und rücknehmbare Trio-Einrichtung.
- `components/visualizer/SonicCrewRehearsal.tsx`: bei Bedarf geladene 3D-Simulation mit privaten Ressourcen und Fehlerbehandlung.

```sh
npm ci
npm run test:avatars:director
npm run test:avatars:assets
npm run test:avatars:motion
npm run test:avatars:personality
SONIC_LOW_MEMORY_BUILD=1 npx next build
npm run test:avatars:playwright
```

Bei vorhandenem Chromium kann `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`
gesetzt werden. Andernfalls vorher `npx playwright install chromium` ausführen.
Die Browser-Tests starten den Produktionsserver selbst auf Port 3215.
Prüfbericht: `reports/avatar-validation/VERIFICATION.md`.
Browserbericht mit Screenshots: `reports/playwright-avatars/html/index.html`.
Der Modell- und Blender-Leitfaden bleibt in `AVATAR-UPDATE.md` erhalten.
