# V696 – Produktive Konzertabnahme für 1, 2 und 4 GLB-Avatare

## Was tatsächlich neu ist

Sechs reproduzierbare Produktions-Abnahmeprofile, **je eine echte Song-Aufnahme je Genre und Besetzung**:

| Szenario | Musik | GLB-Darsteller |
|---|---|---:|
| `rap-solo` | Deutschrap | exakt 1 |
| `rap-duet` | Deutschrap | exakt 2 |
| `rap-quartet` | Deutschrap | exakt 4 |
| `tekk-solo` | Hardstyle/Hardtekk | exakt 1 |
| `tekk-duet` | Hardstyle/Hardtekk | exakt 2 |
| `tekk-quartet` | Hardstyle/Hardtekk | exakt 4 |

Keine Änderung am Live-Rendering, keine neue zusätzliche Abhängigkeit, keine versteckte Aufnahme, keine automatisch erzeugte Spotify-Musik, Animation, GLB-Modelle oder Screenshots. Der V592-Benchmark nimmt ausschließlich die wirkliche `VisualizerStage` auf. Die Abnahme verwendet keine Messung aus einer anderen App/Test-Fakeroutine. **Die Tests im Repository benutzen ausschließlich deutlich getrennte künstliche Test-Fixtures.**

## Windows – Voraussetzungen und Aufbau

1. Projekt vollständig entpacken, Node 20+ verwenden, `npm install`, `npm run typecheck`, `npm run build`. Lockfile nach erfolgreicher Installation aufbewahren und erneut kontrollieren.
2. `npm run start` in einem separaten Fenster. Tatsächliche Spotify-Anmeldung, laufende Wiedergabe, synchronisierte Lyrics und **eigene tatsächliche GLB-Avatare** erforderlich. Keine GLB-Assets werden im Quellarchiv mitgeliefert.
3. Im selben Chromium-Browser dieselbe **Auflösung**, dasselbe Device-/Qualitätsprofil und pro Genre möglichst denselben Song über **1, 2 und 4 Avatare** hinweg verwenden. Die globale Sound-/Avatar-Konfiguration darf nach Möglichkeit nur in der Zahl der Darsteller variieren. Bei ungleichen GLB-Modellen sind FPS nur eingeschränkt vergleichbar.
4. Für ein bereits angemeldetes, für CDP aktiviertes lokales Chromium-Fenster: `--debug-port=9222` als zusätzliches Argument benutzen. Remote-Debugging muss in einem **separaten, vom Benutzer selbst eingerichteten Chrome-Profil** aktiviert und die Anmeldung dort bewusst durchgeführt worden sein; die Skripte lesen keine anderen Browserprofile oder Spotify-Cookies. Aktuelle Chromium-Versionen erlauben Remote-Debugging unter Umständen nur mit einem alternativen User-Data-Verzeichnis. Die Skripte dürfen keinen Login umgehen.
5. Wer nur ein frisches Chromium ohne Login verwendet, erhält beim V592-Benchmark korrekt `blocked`. Das ist **kein** Qualitätstest der Show.

## Schritt 1: Manuelles Prüfblatt anlegen

```powershell
npm run audit:v696:init
```

Datei `artifacts/v696/review.json` wird **nur bei Nichtvorhandensein** angelegt. Bestehende Einträge werden nie überschrieben. Felder `reviewer`, `device`, `browser` ausfüllen; jeder der sechs Abschnitte enthält `genreConfirmed` und eine Liste mit `checks` (`status`: `pending`/`pass`/`fail`, `note`, `songTimeSec`). Bei `pass` oder `fail` sind eine begründete Bemerkung mit mindestens 12 Zeichen sowie die tatsächliche Song-Zeitmarke zwingend. Manuelle Angaben sind als solche gekennzeichnet; die Zeitmarke ist kein automatisch nachgewiesener Lip-Sync.

### Visueller Prüfplan (alle Profile)

- GLB-Rig ist korrekt geladen; keine Fehlproportionen, eingefrorenen Posen oder fehlenden Gliedmaßen.
- Fußkontakt beim Stehen, Drehen und Ducken; keine auffälligen Gleit-/Durchdringungsfehler.
- Übergänge und Tanzbewegungen am ganzen Körper natürlich, variantenreich, nicht mechanisch repetitiv.
- Lyrics-Kontrast, lesbare Wort-Synchronisation, keine störenden Überlagerungen von Text und Köpfen – auch bei 10-Zoll-Darstellung.
- Kamerabild hält alle Performer sichtbar, motivierter Wechsel zwischen Totale/Nahaufnahme, keine ungeplanten Sprünge.
- Moving Heads, Gobo, LED-Wand, Bodennebel und Gesichtsausleuchtung erhalten die Lesbarkeit.
- FPS / P95, Ruckler, WebGL Context Losses und Gesamt-Spannungsbogen vom Verse bis zum Finale prüfen.
- Deutschrap: **echte Lippenbewegung**, Silben/Verse/Hook-Flow und Feature-Handoffs (bei 2/4 Avataren).
- Hardstyle/Hardtekk: musikalischer Kick, Build/Drop, Footwork und Bewegung zum Beat (bei 2/4 Avataren auch Gruppenformationen).
- Quartet: keine Überfüllung, Kollisions-/Kopf- und Lyrics-Verdeckung, alle vier Performer klar erkennbar.

## Schritt 2: Sechs echte V592-Live-Profile erstellen

Vor *jedem* Durchlauf die jeweilige Besetzung und Musik in der echten App einstellen. Am besten die Aufnahme am Songanfang starten, damit 90 Sekunden Strophe/Build/Hook/Drop möglichst gut abdecken. **Nicht** während einer V592-Aufnahme suchen, pausieren oder per Seek springen.

```powershell
npm run benchmark:v696:rap-solo -- --debug-port=9222
npm run benchmark:v696:rap-duet -- --debug-port=9222
npm run benchmark:v696:rap-quartet -- --debug-port=9222
npm run benchmark:v696:tekk-solo -- --debug-port=9222
npm run benchmark:v696:tekk-duet -- --debug-port=9222
npm run benchmark:v696:tekk-quartet -- --debug-port=9222
```

Jede Messung schreibt `artifacts/v696/captures/<szenario>/report.json`, `report.html` und mehrere `live-XX.png`. Für einen akzeptierten Bericht sind unter anderem aktuelle Aufnahme, echte Song-ID, laufender Fortschritt, keine Context Losses, mindestens drei verifizierbare PNG-Screenshots und **genau die jeweils geforderte GLB-Mesh-Anzahl** erforderlich. Das CLI hat keine eigene Fake-GLB-Erzeugung. Für manuelle QA gelten die echten Bilder und das Verhalten in der laufenden Show als zusätzliche Prüfgrundlage.

**Hinweis:** Ein Screenshot belegt weder eine natürlich wirkende Tanzbewegung noch stimmige Lippenbewegung oder einen akustisch präzisen Drop. Diese Kriterien nur bei tatsächlicher Beobachtung als `pass` markieren.

## Schritt 3: Ergebnis und Gegenüberstellung

```powershell
npm run audit:v696:collect
```

Erstellt `artifacts/v696/acceptance.json` und `artifacts/v696/acceptance.html`. Das HTML enthält sechs Einzelprofile samt Bildverweisen, manuelle Bewertungsfelder, Probleme und je Genre eine Gegenüberstellung der tatsächlichen rAF-FPS und P95-Framezeiten. **Die Profilvergleiche werden nur als vergleichbar ausgewiesen, wenn pro Genre Track-ID, Auflösung und Chromium-Modus übereinstimmen.** Weitere Unterschiede wie Gerätehitze, Songabschnitt, GPU-Auslastung und GLB-Komplexität bleiben ausdrücklich möglich.

- `blocked`: fehlende, alte oder nicht passende reale Liveberichte.
- `needs-manual-review`: Liveberichte liegen vor, aber menschliche Sichtprüfungen fehlen oder Bedingungen sind nicht vergleichbar.
- `issues-found`: manuelle Prüfungen enthalten Mängel.
- `ready-for-final-signoff`: sechs Liveberichte sind vorhanden, formal vergleichbar, manuell begutachtet, keine als fehlgeschlagen markierten Kriterien. **Trotzdem immer `approved:false`**, keine automatische Produktionsfreigabe.

Der eigentliche V695-Freigabe-Check für Lockfile, TypeScript, Next.js, QA-Neustart und WebGL ist **zusätzlich** erforderlich (`npm run audit:v695:release`), nicht durch V696 ersetzbar.

## Daten, Sicherheit und Grenzen

Die persönlichen Song-/Avatar-Messbilder, Notizen und JSON-Berichte bleiben lokal unter `artifacts/v696`; sie werden nicht in eine öffentliche Projekt-ZIP übernommen. Es wird nichts automatisch auf Spotify, einen Server oder in die V694-Historie hochgeladen. Ohne Browser- und GLB-Nachweise erzeugt V696 lediglich einen **blockierten** Bericht. JSON- und PNG-Dateien sind lokale Nachweise und nicht kryptografisch gegen Fälschung geschützt. Kein Raspberry-Pi-Benchmark, solange kein entsprechendes Gerät verfügbar ist.
