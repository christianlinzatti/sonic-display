# Sonic Display V968 – Alexa Concert Commands 2.0

V968 erweitert den privaten Alexa Skill aus V967. **Keine Spotify-Steuerung, keine physischen Licht- oder Effektgeräte.** Die neue Auswahl verändert echte virtuelle 3D-Geometrie und Farbpaletten im bestehenden `ConcertFestivalFxV958`-Renderer.

## Neue Befehle

Alle Beispiele beziehen sich auf den eigenen Alexa Skill. Ansprache z. B. „Alexa, sage Sonic Display, …“:

| Bereich | Gesprochener Befehl | Technischer Befehl | Effekt |
|---|---|---|---|
| Bühne | „beleuchte die Bühne“ | `zone-stage` | Bühnenkegel/Bodenakzente sichtbar, LED-Wand und Publikumsrand ausgeblendet |
| Hintergrund | „beleuchte den LED Hintergrund“ | `zone-backdrop` | Nur animierter LED-Hintergrund und Atmosphäre dahinter |
| Publikum | „beleuchte das Publikum“ | `zone-audience` | Virtuelle Publikumsrandbeleuchtung |
| Ganze Szene | „beleuchte die ganze Bühne“ | `zone-all` | Alle virtuellen Bereiche wie zuvor |
| Warm | „mach das Licht warm“ | `mood-warm` | Orange/warme Palette |
| Kühl | „mach das Licht kühl“ | `mood-cool` | Blaue/kühle Palette |
| Neon | „aktiviere Neonfarben“ | `mood-neon` | Neonpalette |
| Zurück zur Automatik | „nutze Genre Lichtfarben“ | `mood-auto` | Ursprüngliche genreabhängige Palette |
| Lichtkegel | „zeige virtuelle Lichtkegel“ | `effect-beams` | Ein virtueller Lichtkegel-Effekt |
| Nebel | „zeige virtuellen Nebel“ | `effect-fog` | Drei einfache transparente Nebelplatten |
| Konfetti | „zeige virtuelles Konfetti“ | `effect-confetti` | Begrenzte Papierpartikel, nur Hook/Drop/Outro |
| Papierluftschlangen | „zeige virtuelle Luftschlangen“ | `effect-streamers` | Begrenzte Partikel, nur Hook/Drop/Outro |
| Auto-FX | „lass die Effekte automatisch wechseln“ | `effect-auto` | Rückkehr zur normalen Konzertautomatik |
| Zusatzeffekte aus | „schalte Zusatzeffekte aus“ | `effect-off` | Keine zusätzlichen FX, Immersion kann bleiben |

Die bisherigen sieben V967-Befehle funktionieren weiter. Alexa-Modes (Arena, Festival, Club, Ruhig) setzen die V968-Zonen, -Farben und -Effekte auf ihre automatischen Standards zurück.

## Implementierung

- `lib/alexaConcertV968.ts`: enge Erlaubnisliste (21 Befehle), reine Settings- und Szenenlogik, keine Netzwerk-/Hardwarezugriffe.
- `integrations/alexa/interaction-model.de-DE.json`: neue feste Intent-Namen und deutsche Beispiele (keine ungebundenen Textslots).
- `integrations/alexa/handler.cjs`: AWS-Lambda-Intent → signierte Vercel-Kommandobrücke mit derselben privaten Skill-ID und Alexa-User-Allowlist wie V967.
- `app/api/alexa/command/route.ts`: erlaubt ausschließlich validierte V968-Befehle, prüft HMAC, Timestamp, Nonce und JSON-Größe wie in V967.
- `lib/alexaRedisV967.ts`: weiterhin ein einzelner kurzlebiger Befehl mit 75-Sekunden-TTL.
- `components/AlexaConcertControlV967.tsx`: Empfang bleibt ausdrücklich opt-in und nur beim geöffneten Studio aktiv; lokale Auswahl ist ohne Echo testbar.
- `components/visualizer/ConcertFestivalFxV958.tsx`: V968-Farbpalette und Effektwahl werden nur in die automatische WebGL-Szene projiziert.

## Sicherheits- und Qualitätsbedingungen

1. **Autorisierte Voice-Befehle schalten `hardwareSync` immer aus.** V968 hat keine Lampen- oder Spotify-API.
2. Die virtuelle Vorschau setzt wie bisher `enabled`, `virtualFx`, eine laufende Wiedergabe und eine **verifizierte echte V318-Songphase** voraus. Ohne bestätigte Abschnittsdaten kein sicherheitshalber erfundener Drop.
3. **Manuelle Shows, eigene Timeline-Cues, Eco-Budget und reduzierte Bewegung haben Vorrang.** Bei diesen Bedingungen werden keine neuen Sprach-FX über die Szene gelegt.
4. Zusatzeffekte werden auf höchstens ein zuvor festgelegtes Mesh-Rezept begrenzt. Die bestehenden Material-Opazitäten und Sicherheitsgrenzen bleiben unverändert; es gibt keine Vollblitze.
5. Bühnenbereich und Effekttyp sind getrennte Filter: „nur LED-Hintergrund“ kann keinen Bodennebel anzeigen. Dafür zuerst „beleuchte die Bühne“ oder „beleuchte die ganze Bühne“ sagen.
6. Bestehende V967-Protokoll- und Redis-Schlüssel bleiben gleich; alte Alexa Skills funktionieren mit altem Funktionsumfang, bis **beide** Komponenten (Lambda-Code **und** Alexa-Interaktionsmodell) aktualisiert sind.

## Einrichtung / Upgrade

1. Vollständige Projekt-ZIP mit dem bestehenden `releases/SonicDisplay-V965.zip`-Importer hochladen; Package-Release-Marker muss aus Workflow-Kompatibilitätsgründen `v965` bleiben, fachlich ist die Version V968.
2. AWS-Lambda-Code über das zusätzliche `SonicDisplay-Alexa-V968-Lambda.zip` aktualisieren und bisherigen Handler `handler.handler` beibehalten.
3. Im [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) in dem **bestehenden Skill** das neue deutsche JSON aus `integrations/alexa/interaction-model.de-DE.json` einfügen, Build/Test starten.
4. Bestehende `ALEXA_SKILL_ID`, `ALEXA_ALLOWED_USER_ID`, `ALEXA_BRIDGE_SECRET`, `SONIC_DISPLAY_ORIGIN` und Upstash-Vercel-Umgebung unverändert beibehalten. Keine Secrets in GitHub ablegen.
5. Im geöffneten Ultimate Concert Experience Studio die lokalen Dropdowns testen, dann Alexa-Empfang einschalten und echte Voice-Befehle testen.
6. In GitHub Actions V968-Tests, V967-Regressionen, vollständigen TypeScript-Check und Next.js-Produktionsbuild kontrollieren. Ein lokaler Test mit einem Alexa-Gerät war hier nicht möglich.

Offizielle Dokumentation: https://developer.amazon.com/en-US/docs/alexa/custom-skills/define-the-interaction-model-in-json-and-text.html

## Prüfstand (lokale Entwicklungsumgebung)

- V968: 14 funktionale Testgruppen + 14 einzelne signierte neue Lambda-Intents: bestanden.
- V967: 9 Rückwärtskompatibilitäts-Testgruppen + 15 signierte Relay- und Poll-Prüfungen: bestanden.
- V966: 18 Testgruppen und 8.000 deterministische Immersionszustände: bestanden.
- V965, V958, Struktur-, Syntax- und Architekturregressionen: bestanden.
- Isolierter TypeScript-Check V968/V967/V966/V965: bestanden.
- Vollständiger TypeScript-Check und Next.js-Produktionsbuild: **nicht nachgewiesen**; die Umgebung bietet Node 22 statt Node 24 und keine installierten Next-/React-Abhängigkeiten.
- AWS-Lambda-Verknüpfung mit privatem Alexa-Konto und realer Echo-Hardware: **nicht durchgeführt**.
