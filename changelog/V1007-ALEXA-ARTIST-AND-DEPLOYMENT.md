# V1007 – Künstler mit Alexa liken/entliken und Vercel-302-Fix

## Einspielen

`SonicDisplay-V1007.zip` unverändert nach `releases/` auf `master` hochladen und committen.
Die App und Tests aus V1006 bleiben vollständig enthalten. Der vorhandene Importer startet
**Sonic Display · V1007 · Production & Playwright** für Linux und Windows.

## Alexa einmalig aktualisieren

Der Projektimport aktualisiert die App. Die bereits eingerichtete Alexa-Cloud-Anbindung
benötigt zusätzlich diese zwei Updates:

1. In der Alexa Developer Console den Inhalt von
   `integrations/alexa/interaction-model.de-DE.json` in den JSON-Editor übernehmen,
   speichern und **Build Model** ausführen. Der Aufrufname bleibt **sonic display**.
2. In der bestehenden AWS-Lambda-Funktion `integrations/alexa/lambda-v1007.zip` hochladen
   und deployen. Das kleine ZIP enthält `handler.cjs` auf oberster Ebene.
   Der Lambda-Handler bleibt **handler.handler**, die vorhandenen Umgebungsvariablen und
   der Alexa-Skills-Kit-Trigger mit Skill-ID-Prüfung bleiben bestehen.

Danach im Display unter **Settings → Govee LAN → Alexa** den allgemeinen Alexa-Empfang
und **„Künstler auf Spotify per Alexa folgen und entfolgen erlauben“** aktivieren.
Spotify auf diesem Display verbinden; falls nötig neu verbinden, um
`user-follow-read` und `user-follow-modify` freizugeben. Die Seite muss sichtbar geöffnet
bleiben; die Einstellungen dürfen geschlossen werden.

Beispiele:

- „Alexa, sage Sonic Display, bitte like den Künstler.“
- „Alexa, sage Sonic Display, bitte entlike den Künstler.“
- „Alexa, sage Sonic Display, folge diesem Künstler nicht mehr.“

**Liken bedeutet einem Künstler auf Spotify folgen**, entliken bedeutet entfolgen.
Es wird nur der erste/Hauptkünstler des aktuell von Spotify gemeldeten Titels geändert,
nicht alle Gastkünstler und nicht der Song. Wiederholte Befehle sind explizite Zielzustände,
kein Toggle. Ohne Künstler, Sitzung oder Spotify-Freigabe erfolgt keine Änderung.

Die Lambda leitet lediglich einen signierten Befehl weiter und erhält keine Spotify-Tokens.
Das Display holt den aktuellen Künstler unmittelbar vor der Aktion ab und verwendet die
vorhandene authentifizierte Künstler-API einschließlich Status-Rückabfrage bei Spotify.
Erst danach aktualisiert sich der Künstlerstatus auf dem Display. Alexa bestätigt zunächst
nur die Weiterleitung; sie behauptet keinen bereits ausgeführten Spotify-Follow.

Künstlerbefehle verfallen nach 15 Sekunden und müssen nach beiden lokalen Freigaben erzeugt
worden sein. Ein übernommener Befehl wird nicht automatisch wiederholt. Ausgeblendete Tabs,
widerrufene Freigaben und fehlende Verbindungen stoppen den Empfänger. Die bisherigen
virtuellen Alexa- und separat freigegebenen Govee-Befehle bleiben erhalten.

## Fix für GitHub-Run 42136875915

Der verlinkte Lauf scheiterte beim Deployment-Erreichbarkeitstest mit `HTTP_302`, nicht beim
Next.js-Kompilieren. Der Workflow stellt `VERCEL_AUTOMATION_BYPASS_SECRET` bereit, die alte
Skriptfassung ignorierte es jedoch. `scripts/check-vercel-deployment-v965.cjs` sendet den
vorhandenen Wert jetzt als `x-vercel-protection-bypass`, ausschließlich an die erlaubte
Sonic-Display-Vercel-Adresse. Der Wert erscheint weder in URLs noch in Berichten.

Redirects werden weiterhin nicht verfolgt. Eine Login-Seite mit HTTP 200 gilt ebenfalls
nicht als Erfolg: Der Check erwartet tatsächliches Sonic-Display-HTML. Falls der externe
Check trotz des Fixes wieder 302/401 meldet, muss der vorhandene GitHub-Secret-Wert zu den
Vercel-Protection-Einstellungen dieses Projekts passen. Der lokale Test ersetzt diese
externe Konfiguration nicht und erzwingt keinen grünen Status.

## Prüfung

- Neue Unit-/Integrationstests für Intent-Zuordnung, HMAC, Freigaben, Frische, Hauptkünstler,
  Follow/Unfollow, Spotify-Rückbestätigung und Fehlerfälle.
- React-Empfängertest für Standard-aus, beide Freigaben, Deduplizierung, Hintergrundtab,
  bestätigte UI-Ereignisse, Entfolgen und Widerruf.
- Vercel-Smoke-Regressionen für Bypass-Header, strenge Zielprüfung, keine Weiterleitungen,
  ungültige Header und Login-HTML ohne falsches Erfolgsergebnis.
- **36 Playwright-Tests** (Desktop und Touch), einschließlich aller Avatar-Tests aus V1006
  sowie der neuen Freigabe-Oberfläche und der authentifizierten Künstler-API.

Lokal: `npm run test:v1007` und `npm run test:e2e:production`.
Ein tatsächlicher Echo-Aufruf und echte Spotify-Kontoänderungen werden lokal nicht
vorgetäuscht: Cloud-/Spotify-Abhängigkeiten der Fachtests sind kontrollierte Testantworten.
Die Playwright-Suite nutzt den echten Produktionsserver ohne simulierte App-API-Antworten.
