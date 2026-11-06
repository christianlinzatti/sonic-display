# V1008 – Alexa: alle Künstler, Auswahl, Rückgängig und Anzeige

## Einspielen und Alexa aktualisieren

`SonicDisplay-V1008.zip` unverändert unter `releases/` auf `master` hochladen und committen.
Der vorhandene Importer startet die Produktionsprüfung mit Playwright für Linux und Windows.
Die Funktionen, Avatare und der Vercel-Protection-Bypass-Fix aus V1007 bleiben enthalten.

Die Alexa-Anbindung benötigt zusätzlich ein Update in den vorhandenen Konsolen:

1. `integrations/alexa/interaction-model.de-DE.json` in der Alexa Developer Console übernehmen,
   speichern und **Build Model** ausführen. Aufrufname: **sonic display**.
2. `integrations/alexa/lambda-v1008.zip` in die bestehende AWS Lambda hochladen und deployen.
   Es enthält **handler.cjs und voice-v1008.cjs** auf oberster Ebene; beide werden benötigt.
   Handler: **handler.handler**. Vorhandene Umgebungsvariablen, private Benutzerfreigabe und
   Skill-ID-Prüfung beibehalten. **Lambda-Timeout auf mindestens 8 Sekunden setzen.**
3. Im Display unter **Settings → Govee LAN → Alexa** den allgemeinen Empfang aktivieren und
   Künstleraktionen separat erlauben. Spotify verbinden; gegebenenfalls für die Berechtigungen
   `user-follow-read` und `user-follow-modify` neu verbinden.
4. Anzeigebefehle zusätzlich mit **„Anzeige per Alexa steuern erlauben“** freigeben.

Die Spotify-Verbindung und eine sichtbar geöffnete Display-Seite werden weiterhin benötigt.
Das ZIP führt keine Bereitstellung in deinem Alexa-/AWS-Konto aus.

## Sprachbeispiele

Mit „Alexa, sage Sonic Display, …“:

- „bitte like den Künstler“ / „bitte entlike den Künstler“
- **„bitte allen Künstlern folgen“** – folgt allen Künstlern des aktuellen Spotify-Titels.
- „folge ich diesem Künstler schon?“ – liest den aktuellen Status ohne Änderung.
- „letzte Künstleraktion rückgängig“ – stellt den vorher bestätigten Zustand wieder her.
- „like den Hauptkünstler“ – wählt direkt den ersten Künstler.
- „Lyrics einblenden“ / „Lyrics ausblenden“
- „Avatar wechseln“ / „ruhige Darstellung“ / „normale Darstellung“
- „Verbindungsstatus“ / „letztes Ergebnis“

Liken bedeutet einem Künstler auf Spotify folgen. Bei mehreren Künstlern fragt der einfache
Like-/Entlike-/Statusbefehl nach einer Nummer. Antworte zum Beispiel „der erste“ oder „Nummer vier“.
Die Auswahl gilt nur für den ursprünglichen Titel; bei Titelwechsel erneut fragen.
„Allen Künstlern folgen“ braucht keine Einzelauswahl und prüft vor der Änderung die vollständige
Künstlerliste des aktuellen Titels. Bereits abonnierte Künstler bleiben abonniert.

Rückgängig gilt zehn Minuten für die letzte bestätigte Änderung auf diesem Display und demselben
Spotify-Konto. Bei einer Sammelaktion werden nur neu hinzugefügte Abonnements entfernt.
Änderungen, die inzwischen einen anderen Zustand haben, werden nicht blind überschrieben.
Der Zustand liegt im Sitzungsspeicher dieses Browsers. Bei fehlender oder unvollständiger
Spotify-Bestätigung wird kein vollständiger Erfolg behauptet.

Alexa wartet bis zu sechs Sekunden auf die Rückmeldung des Displays. Bei Verzögerung bestätigt
sie nur den Versand; mit „letztes Ergebnis“ lässt sich das Ergebnis des jüngsten Auftrags für
kurze Zeit erneut abrufen (120 Sekunden). Befehle laufen nach 30 Sekunden ab; die Warteschlange
ist auf 20 Einträge begrenzt. Eine serverseitige exklusive Übernahme verhindert, dass mehrere
Displays denselben Auftrag ausführen. Der lokale Empfang kann jederzeit widerrufen werden.

## Anzeige und Diagnose

Der Avatarwechsel verwendet tatsächlich installierte Modelle. Mit nur einem verfügbaren Avatar
wird keine Änderung behauptet. Lyrics ausblenden beendet auch immersive Lyrics. Ruhige Darstellung
ändert die vorhandene Einstellung für reduzierte Bewegung. Unter „Anzeige lokal ausprobieren“
lassen sich dieselben Anzeigefunktionen per Klick testen.

„Alexa- und Spotify-Verbindung prüfen“ prüft eine echte Spotify-Statusantwort, die vorhandenen
Follow-Berechtigungen und das konfigurierte Redis-Relay. Fehlende Anmeldung, unerreichbare
Dienste und fehlende Relay-Konfiguration werden getrennt benannt. Die Diagnose beweist keinen
erfolgreichen Echo-/Skill-Aufruf; dieser muss nach dem Konsolenupdate einmal praktisch erfolgen.

## Sicherung und Wiederherstellung

Vor dem nächsten Import im sauberen lokalen Git-Checkout eine Sicherung außerhalb des Checkouts
anlegen (Beispielpfad entsprechend anpassen):

```sh
python3 scripts/release-recovery.py --snapshot ../sonic-backup.zip
```

Die Ausgabe enthält Commit und SHA-256. Das ZIP sichert eingecheckte Projektdateien und
Workflows, keine privaten Laufzeitdaten oder Zugangsdaten. Persönliche Dateien und lokale
Browserdaten separat mit der vorhandenen Exportfunktion sichern.

Für die Wiederherstellung den vollständigen 40-stelligen Commit einer zuletzt funktionierenden,
bereits importierten Version aus der Git-Historie einsetzen:

```sh
python3 scripts/release-recovery.py --ref FULL_COMMIT_SHA
python3 scripts/release-recovery.py --ref FULL_COMMIT_SHA --apply
git diff --stat
npm ci --include=dev
node scripts/v965-production-verify.cjs
```

Der erste Befehl zeigt nur die geplanten Änderungen. `--apply` setzt den geprüften Quellstand
lokal zurück und erfordert einen sauberen Git-Stand. Workflows, Importer, Wiederherstellungstool,
persönliche Laufzeitdaten und unversionierte Dateien bleiben geschützt. Kollisionen mit lokalen
Dateien stoppen den Vorgang. Erst nach Prüfung und bestandenen Tests bewusst committen/pushen;
das Skript veröffentlicht nichts. Alte ZIPs nicht blind erneut hochladen: Der normale Importer
lehnt niedrigere Versionsnummern ab. Ein älterer Quellstand muss mit den erhaltenen Workflows
weiterhin erfolgreich getestet werden.

## Prüfung und Grenzen

Die Tests prüfen Künstlerauswahl, Sammel-Follow, Status, Rückgängig, Kontobindung,
Titelwechsel, HMAC, Replay-Schutz, Übernahme eines Auftrags, Ergebnisrückmeldung und Wiederherstellung.
Spotify- und Alexa-Aufrufe werden dafür kontrolliert simuliert; es werden keine echten
Künstlerabonnements geändert. Die 46 Playwright-Fälle laufen gegen `next build` → `next start`
auf Desktop und Touch, einschließlich echtem GLB-Avatar, Anzeigeoptionen und API-Zugriffsschutz.
Ein echter Echo-/Spotify-Kontotest und die GitHub-/Windows-Ausführung erfolgen nach dem Einspielen.
