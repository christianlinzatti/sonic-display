# V967 – Alexa Custom Skill für virtuelle Konzertregie

## Umfang und Schutzgrenzen

Die Version implementiert **privates Alexa-Custom-Skill-Handling über AWS Lambda**, ein
signiertes Vercel-Relay und einen **opt-in Empfänger** im bestehenden
`ConcertRoadmapStudioV958`. Ein Amazon-Echo oder Alexa-Simulator kann danach
Konzertautomatik und **virtuelle** Bühneneffekte anstoßen. Die Integration greift
**nicht** in Spotify-Playback, Lautstärke, Govee-Hardware, Stroboskop/Flash,
Kamera-Timelines oder bestehende manuelle Shows ein.

Ein Kommando wird auf dem Server 75 Sekunden in Upstash Redis bereitgehalten,
und das geöffnete Konzertstudio fragt etwa alle 4 Sekunden nach Befehlen.
Die Bestätigung durch Alexa bedeutet lediglich, dass der Befehl angenommen und
bereitgestellt wurde, **nicht**, dass ihn der Browser bereits angewendet hat.
Automatisch erzeugte Bühneneffekte setzen weiterhin V958/V966 verifizierte
Songphasen voraus.

## Architektur

Alexa-Gerät -> Amazon Alexa Custom Skill -> **AWS Lambda mit Alexa Skills Kit Trigger
und eingeschalteter Skill-ID-Prüfung** -> signierter HTTPS-POST
`/api/alexa/command` -> Upstash Redis (NX-Nonce, TTL 180 s; letztes Kommando
TTL 75 s) -> authentifiziertes GET `/api/alexa/pending` ->
`components/AlexaConcertControlV967.tsx` -> vorhandene
`saveConcertRoadmapV958`-Einstellungen (virtuell, HardwareSync immer AUS).

**Warum Lambda?** Amazon übernimmt für den Alexa Skills Kit Trigger die
Authentifizierung der Skill-Aufrufe. Es ist keine unsichere, ungeschützte
Alexa-POST-Schnittstelle auf Vercel notwendig. Ein HMAC-SHA256-Signaturcheck
mit Timestamp, einmaliger Nonce und konstantem Vergleich schützt die separate
Lambda->Vercel-Bridge. Eine direkte Alexa->Vercel-Konfiguration ist nicht unterstützt.

## Einrichtung

1. Im [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
   einen Custom Skill anlegen: Name z.B. **Sonic Display**, Sprache Deutsch (DE),
   Aufrufname **sonic display**. Das Interaktionsmodell aus
   `integrations/alexa/interaction-model.de-DE.json` in den JSON-Editor übernehmen
   und das Modell bauen.
2. In AWS Lambda eine Node.js-Funktion (Node.js 22 oder aktueller unterstützter
   Runtime) anlegen und `integrations/alexa/handler.cjs` hochladen, entweder per
   separatem Lambda-ZIP oder durch Kopieren. **Handler: `handler.handler`.**
   Einen Alexa Skills Kit Trigger hinzufügen, **Skill-ID-Verifizierung aktivieren**
   und dort genau die Skill-ID dieses eigenen Skills hinterlegen.
3. In AWS Lambda folgende **Umgebungsvariablen** setzen:
   - `ALEXA_SKILL_ID` = vollständige Skill-ID (`amzn1.ask.skill.…`)
   - `ALEXA_ALLOWED_USER_ID` = eigene Alexa Benutzer-ID aus dem Alexa
     Request (`context.System.user.userId`), **nicht** die Amazon-E-Mail.
     Nur diese eine ID ist in V967 autorisiert. Beim initialen Test kann die
     Request-JSON im Alexa-Testsimulator ausgewertet werden, ohne Identitäten
     in Logs oder Code zu speichern.
   - `ALEXA_BRIDGE_SECRET` = kryptografisch zufälliger Wert, min. 32 Zeichen
   - `SONIC_DISPLAY_ORIGIN` = öffentliche Produktions-URL,
     z.B. `https://deine-app.vercel.app`, **ohne Pfad, Port oder Slash-Suffix**.
4. In den **Vercel Server-Environment-Variables** für dieselbe Deployment-Umgebung
   setzen: `ALEXA_BRIDGE_SECRET` (genau derselbe Wert wie Lambda),
   `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN`.
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`
   generiert ein geeignetes Secret. **Nie** im Repository oder ZIP ablegen.
   Danach erneut auf Vercel deployen.
5. In Alexa Console -> Endpoints den AWS Lambda ARN eintragen. Im Alexa
   Testsimulator die eigene Alexa-ID ermitteln und als Allowlist-Variable in Lambda
   setzen; Alexa danach erneut testen. Die Skill-ID muss sowohl beim Trigger
   als auch in `ALEXA_SKILL_ID` übereinstimmen.
6. Sonic Display im Browser mit gültiger Spotify-Sitzung öffnen, unter
   **Govee LAN -> Ultimate Concert Experience Studio -> V967 Alexa**
   den Empfang **bewusst aktivieren**. Das Studio muss offen bleiben, um
   die Befehle anzuwenden. Danach mit dem lokalen Festival-Testknopf beginnen,
   erst anschließend den Skill über Alexa testen.

## Sprachbefehle (Beispiele)

- „Alexa, öffne Sonic Display“
- „Alexa, sage Sonic Display, starte Festival“
- „Alexa, sage Sonic Display, starte Arena“
- „Alexa, sage Sonic Display, starte Club“
- „Alexa, sage Sonic Display, starte eine ruhige Atmosphäre“
- „Alexa, sage Sonic Display, deaktiviere virtuelle Effekte“
- „Alexa, sage Sonic Display, beende die Konzertautomatik“

Die Erkennung ist von Amazon-Spracheinstellungen abhängig. In der Alexa Console
können Phrasen für Deutsch (DE) angepasst werden.

## Sicherheits- und Betriebsgrenzen

- Nur **ein privat freigeschalteter Alexa-Benutzer**; V967 hat noch **kein**
  OAuth-Account-Linking, Pairing mehrerer Geräte oder Mandantentrennung.
  Die neuesten Kommandos sind für alle angemeldeten Sonic-Display-Browser
  derselben Instanz sichtbar, wenn dort Alexa-Empfang eingeschaltet ist.
  **Nur für ein privates Single-User-Deployment verwenden.**
- Govee Sync wird beim Übernehmen eines Alexa-Kommandos auf `false` gesetzt.
  Virtual-FX werden nur über vorhandene Show-Composer aktiviert, nie per
  direktem Hardwarezugriff. Für Bilder mit Blitzcharakter gelten weiterhin
  die existierenden Show-Sicherheitsgrenzen.
- Ohne `ALEXA_BRIDGE_SECRET` oder Upstash erfolgt **kein** in-memory
  Ersatz: die Endpunkte geben 503 zurück. Abgelaufene, doppelte,
  ungültige oder nicht signierte Befehle werden abgewiesen.
- Unterbrochene/geschlossene Displays verlieren Befehle nach 75 Sekunden.
  Das Relay ist aktuell **last-message-wins**, keine persistente Aufgaben-Queue.
- Historischer Umfang von V967: keine Spotify-Sprachsteuerung. Seit V1007 sind explizit freigegebene Künstler-Follow-/Unfollow-Befehle möglich; siehe `changelog/V1007-ALEXA-ARTIST-AND-DEPLOYMENT.md`. Playback und Lautstärke bleiben unverändert.
- **Nicht** kompatibel mit einem Alexa-HTTPS-Custom-Skill-Endpoint auf Vercel:
  hierfür wären die zusätzlichen Amazon-Zertifikats- und Timestamp-Prüfungen
  erforderlich. V967 nutzt bewusst Lambda.
- Vor Freigabe im eigenen Konto: `npm run test:v967`, `npm run test:v967:types`,
  `npm run test:structure`, kompletter TypeScript-Check und Next.js-Build in CI.

## Referenzen

- Amazon: https://developer.amazon.com/en-US/docs/alexa/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html
- Amazon: https://developer.amazon.com/en-US/docs/alexa/custom-skills/handle-requests-sent-by-alexa.html
- Spotify: https://developer.spotify.com/policy
