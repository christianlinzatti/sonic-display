# V970 – Alexa & Govee Room Immersion (opt-in)

V970 verbindet den bereits privaten **Alexa Custom Skill** mit den **vorhandenen Govee-LAN-Leuchten**. Es gibt **keine automatische Lampeneinschaltung**, keine Alexa-Steuerung der Spotify-Wiedergabe und keine neue Govee-Bridge oder eigene Geräte-Sendeschleife.

## Was neu ist

Im **Ultimate Concert Experience Studio → Alexa Konzert- und Raumlichtsteuerung → V970** gibt es eine separate Zustimmung:

**„Govee-Lichtstimmungen durch Alexa auf diesem Display ausdrücklich erlauben“** (standardmäßig **aus**).

Die Erlaubnis alleine aktiviert keine Hardware. Das Display muss zusätzlich **Alexa-Empfang** aktiviert haben und unter **Einstellungen → Govee LAN** müssen Govee-Lichtintegration, automatische Musik-Synchronisation, Bridge-Token und ausgewählte Lampen bereits vollständig eingerichtet sein. Das Studio muss geöffnet sein, während der Alexa-Befehl eintreffen soll. Das Govee-System arbeitet weiter auf der Home-Seite, solange Musik läuft; wenn die Wiedergabe pausiert oder der Tab im Hintergrund ist, werden keine neuen Lichtbefehle gesendet.

| Eigener Alexa-Skill: Sprachbeispiel | Wirkung beim nächsten regulären Govee-Musik-Sync | Befehl |
| --- | --- | --- |
| „Alexa, sage Sonic Display, aktiviere Govee Arena Raumlicht“ | Warme Arena-Akzente | `govee-arena` |
| „… aktiviere Govee Festival Raumlicht“ | Violett/Festival-Farben | `govee-festival` |
| „… aktiviere Govee Club Raumlicht“ | Kühle Club-Farben | `govee-club` |
| „… aktiviere ruhiges Govee Licht“ | Ruhige gedeckte Farbpalette | `govee-calm` |
| „… dimme Govee Raumlicht“ | Sanft gedimmte bestehende Helligkeit | `govee-dim` |
| „… schalte Govee auf Automatik“ | Entfernt die Sprachüberblendung | `govee-auto` |

Die Alexa-Look-Überblendung läuft **maximal 3 Minuten** oder endet beim Zurückschalten auf Automatik, Ausschalten des Alexa-Empfangs oder Entziehen der lokalen Freigabe. Der Zustand ist flüchtig und wird **nicht** als dauerhafte Lichtshow abgespeichert. Ein Seitenreload beginnt ohne aktiven Voice-Look.

## Sicherheit / Prioritäten

- **Identität:** Der Alexa-Skill läuft über AWS Lambda mit Alexa-Skill-ID/zulässiger User-ID; die Vercel-Relay-API prüft HMAC-Signatur, Zeitstempel und Nonce. Der angemeldete Browser prüft **zusätzlich** eine lokale, unabhängige Freigabe. Eine erfolgreiche Relay-Antwort bedeutet **nur „in die Queue gestellt“** und garantiert keine Lampenänderung.
- **Keine Macht-Eskalation:** Alexa darf weder die Bridge starten noch `GoveeConfig.enabled`, `autoSync`, `token`, `selectedIps` oder `ConcertSettings.hardwareSync` verändern. Neue Befehle können **nur** bestehende LAN-Sync-Farben vorsichtig überblenden. Keine Ein-/Aus-Befehle, keine Blitze, keine physische Nebel-/Pyrosteuerung.
- **Prioritäten:** Gespeicherte V912-Lichtshows, manuelle/authorierte Bühnen-Cues und die V930/V934-Wiederherstellungs-Fallbacks behalten Vorrang. Die V961-Lichtbegrenzung wird **nach** der Alexa-Überblendung angewandt.
- **Sanftheit:** Farbkanäle verändern sich um höchstens 28/normalem Sendezyklus, Helligkeit um höchstens 8 Einheiten, **niemals über die bestehende begrenzte Helligkeit**. Es wird **kein zusätzliches UDP-Paket** und **kein zusätzlicher Netzwerk-Timer** eingeführt. Bereits konfigurierte Govee-Gruppen und Auswahl bleiben erhalten.
- **Kein zusätzliches Gerät:** Ein eigenes Amazon-Echo-Gerät, ein eingerichteter Skill und funktionsfähige Govee LAN Bridge sind für reale Tests weiterhin Voraussetzung. Die Anwendung enthält keine Zugangsdaten.

## Einrichtung

1. V970 als `releases/SonicDisplay-V970.zip` auf `master` hochladen und auf den **GitHub-Import sowie den nachfolgenden Linux-/Windows-Produktionsbuild** achten.
2. Bestehenden V967–V969 Alexa-Skill über **`integrations/alexa/handler.cjs`** (AWS Lambda ZIP) und **`integrations/alexa/interaction-model.de-DE.json`** (Alexa Developer Console) auf V970 aktualisieren, das deutsche Modell bauen. Keine Änderung an den bisherigen Umgebungsvariablen nötig.
3. Govee Bridge wie gewohnt (V909) verbinden, Lampen auswählen, Govee aktivieren und **Musik-Auto-Sync** einschalten. Bereits aktive LAN-Lampen werden nicht durch Alexa eingeschaltet.
4. Im **Ultimate Concert Experience Studio** zuerst **Alexa-Empfang**, dann **separate Govee-Freigabe** aktivieren.
5. Einen Song starten; **„Festival-Raumlicht lokal testen“** prüfen. Danach Alexa-Befehl testen. Bei ausbleibender Reaktion Empfangsstatus, laufende Musik, Bridge-/Lampenstatus und Browsersichtbarkeit prüfen.
6. Mit **„Zur Govee-Musikautomatik zurückkehren“** den Voice-Look aufheben oder die separate Erlaubnis entziehen.

## Prüfungen

```bash
npm run test:v970
npm run test:v970:lambda
npm run test:v970:types
npm run test:v967:relay
npm run typecheck
npm run build
```

`test:v970` prüft 15 Funktionsbereiche und 10.000 synthetische Raumlichtzustände (die **keinen** realen Govee-Befehl auslösen). `test:v970:lambda` prüft die sechs neuen signierten Lambda-Intents. Der V970-Test ist in `scripts/vercel-production-build.cjs` und `scripts/v931-production-gate.cjs` eingehängt.

**Der echte Next.js-Build, die Hardware-/Echo-Abnahme und reale Vercel-/Upstash-Integration gelten erst nach tatsächlich grünen CI- und Gerätetests als bestätigt.**
