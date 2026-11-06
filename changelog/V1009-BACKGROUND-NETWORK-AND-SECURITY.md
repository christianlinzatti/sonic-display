# V1009 – Hintergrundabfragen, echte Abbrüche und Abhängigkeiten

## Einspielen

**Zuerst [PR #10](https://github.com/christianlinzatti/sonic-display/pull/10) zusammenführen.**
Danach `SonicDisplay-V1009.zip` unverändert unter `releases/` auf `master` hochladen und committen.
Der vorhandene Workflow mit Linux und Windows bleibt zuständig; es kommt kein weiterer
automatischer Workflow hinzu. Alle Alexa-Funktionen aus V1008 sind enthalten, insbesondere
„Bitte allen Künstlern folgen“ und das kontogebundene Rückgängig.
Falls V1008 bereits auf Alexa eingerichtet ist, ist kein erneutes Modell-/Lambda-Update nötig.
Andernfalls die Anleitung aus V1008 verwenden (Lambda-Timeout mindestens 8 Sekunden).

## Sicherheitsänderungen

Der veraltete `genius-lyrics-api`-Unterbau samt altem jsdom/request/form-data wurde entfernt.
Der neue Adapter nutzt native asynchrone Fetch-Aufrufe und einen gepflegten HTML-Parser.
Genius-Schlüssel werden nur im Authorization-Header an die offizielle API gesendet.
Öffentliche Lyrics-Seiten erhalten keinen Schlüssel. Titel und Künstler müssen zum Suchtreffer
passen. Weiterleitungen bleiben auf HTTPS und `genius.com` beschränkt; Zugangsdaten in URLs,
fremde Hosts und fremde Ports werden abgelehnt. Antworten sind größenbegrenzt; ausschließlich
Lyrics-Container werden als Text ausgewertet, kein Skript wird ausgeführt. Änderungen am
Genius-Seitenformat können weiterhin zu fehlenden Lyrics führen; andere Anbieter bleiben verfügbar.

`@vercel/blob` wurde auf 2.8.2 aktualisiert. PostCSS und die transitiv gepinnte Zod-Version
werden über kompatible Overrides auf korrigierte Versionen gesetzt. Die Produktionsprüfung
mit `npm audit --omit=dev` meldete am 6. November 2026 null bekannte Schwachstellen.
Das ist keine Garantie gegen künftige oder noch unbekannte Sicherheitslücken.

## Behobenes Speicherleck bei GLB-Vorschauen

Der neue Speichertest hat ein tatsächliches Leck beim wiederholten GLB-Wechsel aufgedeckt:
Gecachte Materialien behielten Dispose-Listener früherer WebGL-Renderer. Über deren Canvas
blieben komplette geschlossene Einstellungsansichten erreichbar. Die Heap-Analyse bestätigte
diese Referenzkette auch ohne Playwright-Aufzeichnung.

Avatar-Instanzen besitzen nun eigene Geometrien, Materialien und Texturobjekte und geben sie
beim Entfernen gezielt frei. Innerhalb einer Instanz werden identische Ressourcen weiterhin
wiederverwendet. Die gecachten Originale sowie gemeinsame Bilddaten werden dabei nicht
disponiert oder geschlossen. Die Korrektur gilt für Avatar-Editor, Vorschauen, Vergleiche,
Benchmarks und Live-Avatare. Aktive Instanzen benötigen eigenen Geometriespeicher; die großen
Texturbilddaten bleiben geteilt. Der Speichertest misst nach asynchronem Renderer-Abbau und
Garbage Collection, ohne Trace-Aufzeichnung, mit unveränderten Wachstumsgrenzen.

## Verhalten bei langsamer Verbindung

Netzwerkanfragen laufen asynchron. Spotify-Polling, Lyrics, Genreerkennung und Bühneninhalte
halten die Bedienoberfläche nicht an. Lyrics werden weiterhin unabhängig von Spotify geladen;
Bühnenanbieter veröffentlichen ihre Ergebnisse einzeln. Ein langsamer Anbieter hält die
Anzeige anderer Quellen nicht auf. Bei Verbindungsfehlern bleiben vorhandene Wiedergabedaten
sichtbar; Wiederholungen verwenden den bisherigen Backoff.

Ergänzte Fristen decken auch das Einlesen von JSON-Antworten ab: Genre, Künstleraktionen,
Alexa-Empfang, Statusdiagnose, Künstlerinfos und die Echtzeit-Konfiguration. In der Regel gelten
12 Sekunden, bei bestätigungspflichtigen Spotify-Schreibaktionen 20 Sekunden. Der Genius-Abruf
hat ein gemeinsames Budget von fünf Sekunden für Suche, Weiterleitungen und Seitendekodierung.
Zeitlimit, Titelwechsel und das Schließen eines Empfängers brechen die zugehörigen Anfragen ab.
Abbruchsignale der Lyrics-Route werden an ihre Anbieter weitergereicht. Die serverseitige
Genreabfrage hat auch für den Künstler-Fallback ein gemeinsames Zeitbudget.

Es gibt keine globale Wartesperre für die Oberfläche. Einzelne Aktionen zeigen während ihrer
Bestätigung einen lokalen Ladezustand. Anmeldung, bewusster Download und Dateiupload behalten
ihren normalen Ablauf. Dauerverbindungen für Echtzeitnachrichten sind absichtlich langlebig.
Ein Timeout bei einer Spotify-Schreibaktion beweist keinen Abbruch auf Spotify: Bei unbekanntem
Ergebnis wird kein Erfolg behauptet; vor einer Wiederholung den aktuellen Status prüfen.

## Tests und Speicherprüfung

Die Produktionssuite enthält 48 Fälle für Desktop und Touch. Ein neuer Fehlerfall hält Spotify-
und Diagnoseantworten künstlich zurück und prüft, dass Einstellungen geöffnet/geschlossen und
Anzeigeoptionen weiter geändert werden können. Dieser Fall verwendet gezielte Netzfehler;
die normalen Produktionsfälle arbeiten weiterhin mit dem echten lokalen Next-Server.
Unit-Tests prüfen unter anderem tatsächlichen Netzwerkabbruch, hängende Antwortkörper,
Weiterleitungsgrenzen, HTML-Extraktion und dass private Tokens nicht in URLs gelangen.

Zusätzlich führt der bestehende Produktionsworkflow nach den Browsertests einen kurzen
Speichertest aus: wiederholte reale GLB-/Procedural-Wechsel, Öffnen und Schließen des Previews,
anschließende Messung von Chromium-JS-Heap und DOM nach Garbage Collection. Ein Aufwärmabschnitt
verhindert, dass einmalige Modul-/Assetladungen als Leck gemeldet werden. Starkes Wachstum
oder Browserfehler lassen den Job fehlschlagen. Bericht und Messpunkte stehen im vorhandenen
Produktionsartefakt unter `v959-regression-logs/playwright-soak.log`.

Für einen längeren lokalen Lauf gegen den zuvor erstellten Produktionsbuild:

```sh
npm ci --include=dev
npx playwright install --with-deps chromium
npm run test:e2e:production
npm run test:soak:production -- 60
```

Ohne Minutenangabe läuft der Speichertest 60 Minuten; maximal acht Stunden sind möglich.
Lokal liegen Messpunkte und Bericht unter `reports/playwright-soak/`. Die kurze CI-Messung
ist ein Regressionstest und keine Garantie für einen leckfreien Dauerbetrieb. GPU-VRAM wird
damit nicht direkt gemessen. Anmelde-, Spotify-Konto- und echte Echo-Tests erfolgen weiterhin
in der jeweiligen Benutzerumgebung.

## GitHub-Actions-Laufzeit und sichtbare Testübersicht

[PR #10](https://github.com/christianlinzatti/sonic-display/pull/10) aktualisiert die bestehenden
checkout/setup-node/upload-artifact-Actions auf v6 mit Node-24-Laufzeit und ergänzt eine
Ergebnisübersicht. Diesen PR vor dem ZIP-Import zusammenführen: Workflow-Dateien werden beim
ZIP-Import ausdrücklich geschützt. Der Deployment-Erreichbarkeitstest bleibt separat und
verweist auf [Production & Playwright](https://github.com/christianlinzatti/sonic-display/actions/workflows/v965-room-wave-production.yml).
Dort laufen Linux und Windows mit den bestehenden Feature-Checks und dem Produktions-Gate.
Die Zusammenfassung nennt protokollierte Prüfungen, Fehler, übersprungene Browserfälle und die
Speichermessung. Fehlende Berichte werden nicht als Erfolg dargestellt.
