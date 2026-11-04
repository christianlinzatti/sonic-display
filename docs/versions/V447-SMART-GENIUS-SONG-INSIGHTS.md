# V447 – Smart Genius Song Insights

V447 erweitert Sonic Display V446 um **optionale, automatisch eingeblendete Genius-Songmetadaten**. Die 3D-Show, Lyrics, Kamera und sämtliche manuellen Konfigurationen bleiben unverändert.

## Anzeige

- Songbeschreibungen als kurze Textauszüge (max. ca. 170 Zeichen).
- Produzenten, Songwriter, Featured Artists und Veröffentlichungsdatum, falls vorhanden.
- Bis zu zwei von Genius ausdrücklich ausgewiesene Samples/Interpolationen/Cover/Remixe, jeweils mit Genius-Quellenlink. Die Anwendung erfindet keine Verbindungen.
- Bis zu drei Genius-Annotationen, sofern sie einen Link, ein Textfragment und eine Erklärung enthalten. Diese werden **ausschließlich auf einer tatsächlich übereinstimmenden Zeile synchronisierter Lyrics** eingeblendet; Genius liefert selbst keinerlei Zeitstempel.
- Unaufdringlicher Informationsbereich auf der Track-Seite statt eines Overlays über Avataren oder Lyrics: ab 12 Sekunden, maximal 11 Sekunden pro 28-Sekunden-Zyklus. Bei Pausen/fehlenden Daten ausgeblendet. Über `V447 · Genius Song Insights automatisch anzeigen` in den Anzeigeeinstellungen deaktivierbar.

## Einrichtung

Die bereits für den optionalen Genius-Lyrics-Fallback verwendete Umgebungsvariable wird auch hier genutzt:

```env
GENIUS_ACCESS_TOKEN=dein_genius_client_access_token
```

In `.env.local` und bei Deployments in den Server-Umgebungsvariablen hinterlegen, **nie** unter `NEXT_PUBLIC_*`. Keine zusätzliche Bibliothek, keine neue Installation und keine Token-Eingabe im Browser. Ohne echten Token, ohne eindeutig passenden Song oder ohne verwendbare Metadaten bleibt die Anzeige leer.

## Architektur und Sicherheit

- Serverroute: `GET /api/genius/insights?title=...&artist=...` (Spotify-Session erforderlich).
- Genius-Suche, Detaildaten und optional Referents/Annotationen über dokumentierte `api.genius.com`-Endpunkte; kurze feste Netzwerk-Timeouts.
- Song-Match berücksichtigt normalisierten Titel und mindestens einen ausdrücklich übereinstimmenden Künstler; keine freie Zuordnung über einen zufälligen Song mit demselben Titel.
- Serverinterner TTL-Cache: positive Ergebnisse 6 Stunden, echte Nichttreffer 15 Minuten, höchstens 100 Einträge; nicht persistiert.
- Browser: GET nur an eigenen Server, Abrufabbruch bei Trackwechsel, gegen Track-ID geprüfte Antwort (keine alten Songs).
- Externe Links sind ausschließlich `https://genius.com` bzw. Genius-Subdomains; keine externen HTML-Einbettungen, Skripte oder Assets.
- Referent-Fragmente werden anhand separater synchronisierter Lyrics nach Text verglichen. **Keine automatischen Sprecher- oder Künstler-Zeitzuordnungen**.
- Kurze Auszüge mit sichtbarem Quell-Link; die Nutzungsbedingungen/Lizenzen für Genius-Inhalte sind bei produktiver Nutzung zu prüfen.

## Prüfen

```bash
npm install
npm run test:v447
npm run verify:v447
npm run typecheck
npm run build
```
