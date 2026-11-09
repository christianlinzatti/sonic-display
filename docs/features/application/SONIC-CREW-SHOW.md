## V1116 – AI Artist Interaction (Lead-Wechsel, Dialoge und Duos)

Der **V1116 AI Artist Interaction**-Bereich im AI Show Designer verbindet die bisherigen Character-, Dance- und Vocal-Regiepartituren zu sieben sichtbaren Interaktionsszenen. Vier Stile (Dialog, Duo, Rap-Battle und Festival) wechseln die Kameraführung zwischen den vorhandenen V1040-Modi. Die Regie nennt Lead-/Partnerrollen, Antwortgesten und gemeinsame Bühnenmomente, aber behauptet **keinen erkannten Gesang, physischen Blickkontakt oder neue GLB-Clips**. Die Original-Songgrenzen und die Govee- und Laserwerte bleiben bis zur expliziten Annahme unverändert.

Optional kann nach einer separaten Zustimmung der vorhandene **V1079 Live Artist Interaction**-Modus aktiviert werden. Dieser visualisiert Partnerakzente ausschließlich bei echten, synchronisierten Lyrics-Lücken. Es werden keine Audiodaten gesendet und keine individuellen Kopf- oder Blickanimationen erfunden. Die Regler lassen sich konfliktgeschützt rückgängig machen. Details: `changelog/V1116-AI-ARTIST-INTERACTION.md`, `docs/V1116-RELEASE-AND-TESTS.md`.

## V1115 – AI Vocal Acting & Lip-Sync Intelligence

Die optionale Vocal-Regiepartitur zeigt sieben Songphasen, drei Stage-Crew-Charaktere und wechselnde Rollen für Rap, Melodie und Festival-Hybrid. Ihre Sänger-/Adlib-Rollen sind **Inszenierungsvorschläge**, keine automatische Sprechererkennung. Ein zweiter Opt-in-Schritt aktiviert begrenzte, bereits bestehende V368/V371/V372-Parameter (Lip-Sync zu vorhandenen Lyrics, Gestik, Augen/Blick, Gesichtsintensität); Rückgängig ist konfliktgesichert. Manuell gesetzte Vocal-Cues und zeitlich ausgerichtete Viseme bleiben unangetastet. Die mitgelieferten GLBs haben keine Jaw-Bones oder Mund-Morph-Targets, deshalb ist ihre echte Gesichts-Lippensynchronisation damit noch nicht möglich. Keine neuen KI-, Audio-, Mikrofon- oder Geräteberechtigungen.

Siehe `changelog/V1115-AI-VOCAL-ACTING-LIP-SYNC.md` und `docs/V1115-RELEASE-AND-TESTS.md`.

## V1114 – AI Dance Choreographer 4.0 (Stage Crew mit echten GLB-Clips)

Der 360° AI Show Designer bietet eine lokale **Sieben-Szenen-Choreografie** für die mitgelieferten Performer Neon Pulse, Festival Nova und Chrome Beat. Vier wählbare Stile und eine Probenpartitur planen Solo, Duo, Kanon (zwei Beats Versatz), Gruppensynchronisation, Atempause und Finale. Die vorhandenen V1040-Zeitgrenzen, Intensitätsgrenzen sowie manuelle Kamera-/Tanzentscheidungen bleiben bis zur ausdrücklichen Übernahme unverändert. Die Darstellung ist eine dramaturgische Vorschau, **keine echte Echtzeit-Analyse der Musikstruktur**.

Neu ist außerdem der optionale Stage-Crew-Modus **„V1114 Auto-Choreografie · Abschnitte wechseln“**. Die bereits bestehende Live-GLB-Engine schaltet bei *vorhandenem Abschnittssignal* automatisch zwischen Ruhe-Animationen (Intro/Break), Spotlight-Solos (Verse), 2-Beat-Kanon (Hook) und Unisono (Drop). Sie wählt ausschließlich Clips, die tatsächlich im geladenen GLB vorkommen, und behält Fallbacks, 8-Sekunden-Haltezeiten, Pausen-, Reduced-Motion- und manuelle Prioritätsregeln bei. In der KI-Vorschau kann der Modus **gesondert und reversibel** eingeschaltet werden; auch eine Trio-Einrichtung ist wie bisher erforderlich. Die Partitur wird nicht als individuelle Clip-zu-Clip-Timeline persistiert: tatsächliche Live-Tänze orientieren sich an den zur Laufzeit verfügbaren Abschnittssignalen und Clips. Kamera-Tracking pro Künstler und neue Rig-Motion-Captures werden nicht erfunden. Kein dauerhafter KI-Aufruf, keine neuen Geräte- oder Audio-Rechte.

Tests: `npm run test:v1114`, `npm run test:v1114:types`, `node scripts/v959-source-preflight.cjs`. Desktop-/Touch-Browser-E2E: `tests/e2e/ai-dance-choreographer-v1114.spec.cjs`. Die lokalen Unit-Checks ersetzen keinen vollständigen GitHub-Actions-/Next.js-Produktionsbuild.


## V1113 – Performance-Charakterregie

Neon Pulse, Festival Nova und Chrome Beat erhalten eigene Spotlight-, Gestik- und Energieideen. Die Choreografie-Notizen sind keine per-GLB gesteuerten Clips; Live wird nur die vorhandene gemeinsame Choreografieregie verändert.

## V1112 · AI Avatar Personality – individuelle Stage-Crew-Regie

Neon Pulse, Festival Nova und Chrome Beat erhalten im 360°-Show-Designer **jeweils einen wählbaren Bühnencharakter**: charismatischer Frontmann, energiegeladener Hype-Artist, präziser Tänzer oder mysteriöser Performer. Die reine lokale KI-Regie plant für sieben Konzertphasen einen Rollen-/Fokuswechsel und passt **Kamera und Tanzmodus der bestehenden V1040-Timeline** dazu an. Die Vorschau zeigt die Bewegungsabsichten für jeden der drei Performer. Die Auswahl ist bewusst optional; ohne Aktivierung bleibt die V1111-Regie unverändert. Speichern erfolgt ausschließlich mit dem bestehenden Button und kann rückgängig gemacht werden.

**Technische Grenze:** Die verfügbaren Tanzmodi gelten derzeit für die gesamte Bühne. Unabhängige GLB-Animationen jedes Avatars sowie echtes Kamera-Tracking einzelner Performer sind noch nicht umgesetzt. Es werden keine Audio- oder Personendaten an KI-Dienste gesendet und keine Govee-Geräte gesteuert. TypeScript und Regression: `npm run test:v1112:types`, `npm run test:v1112`. Desktop-/Touch-Browserprüfungen: `tests/e2e/ai-avatar-personality-v1112.spec.cjs`.

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

## V1124 – Virtuelles Publikum synchronisieren

Im AI Show Designer schlägt die V1124-Regie sieben Crowd-Phasen entlang der
Showtimeline vor. Optische Armbewegungen, virtuelle Handy-/Lichtbandwellen
und Jubelgesten stammen aus bestehenden Crowd-Modulen. Die Stage-Crew-GLB-Clips,
Sängerzuordnung und manuelle Choreografien bleiben unverändert. Ohne ausdrückliche
Bestätigung bleibt es bei einer reinen Vorschau; es entstehen keine Stimmen
oder echten Geräteaktionen.

## V1125 – Festival Crowd Director 2.0

Die virtuelle Crowd kann um die drei Stage-Crew-Künstlerfokusse in acht
räumlich unterschiedlichen Sektoren leuchten und dezent reagieren. Die
Künstlernamen stehen für geplante Inszenierung und nicht für erkannte
Stimmen oder belegte Rollen. Keine Änderung an Avatarrigs, Tanzclips,
Kamerazeiten oder Showplangrenzen. Echte Stage-Crew-/Publikumsreaktionen
bleiben an die vorhandenen V1074-Grenzen gebunden.
