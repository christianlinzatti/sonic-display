# V331 – Live-Text-Push für die Stage Content Plugins

Die bisherige Text-API (`GET /api/...` mit Track-Platzhaltern) wird nur beim Laden von Tracks abgefragt. Neu: Per `POST /api/stage-content/push` können Programme Texte aktiv an die Leinwand senden. Ein geöffneter Client empfängt sie via SSE `GET /api/stage-content/live` sofort, zeigt sie für die gewünschte Dauer an und kehrt danach zur regulären Canvas-/Cover-/Info-Rotation zurück. Neue Nachrichten unterbrechen ältere. Die Leinwand muss unter Settings → Dynamic Stage → Stage Content Plugins eingeschaltet sein. Das normale Text-Plugin muss für den Live-Push nicht separat aktiviert werden.

## Setup

`.env.local`:

```env
STAGE_CONTENT_PUSH_TOKEN=hier-ein-langer-zufaelliger-geheimer-token
```

Token **niemals** mit `NEXT_PUBLIC_` exportieren. Entwicklungsserver neu starten. Für SSE ist eine gültige Spotify-Sitzung als Zugriffsschutz erforderlich. Das sendende Programm benötigt dagegen nur den Push-Token.

## Beispiel (PowerShell)

```powershell
$headers = @{ Authorization = 'Bearer hier-ein-langer-zufaelliger-geheimer-token' }
$body = @{ title = 'Live-Nachricht'; text = 'Der DJ beginnt in 5 Minuten'; durationSeconds = 12; priority = 'high' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/stage-content/push' -Method Post -Headers $headers -ContentType 'application/json' -Body $body
```

Für curl:

```bash
curl -X POST http://localhost:3000/api/stage-content/push \
 -H 'Authorization: Bearer DEIN_SECRET' \
 -H 'Content-Type: application/json' \
 -d '{"title":"Live-Nachricht","text":"Jetzt beginnt die Show!","durationSeconds":15,"priority":"high"}'
```

## Ablauf

- Server nimmt POST nur mit gültigem Bearer-Token an und begrenzt die JSON-Größe auf 8192 Zeichen.
- Texte bis 1600 Zeichen, Titel bis 90, Dauer 3–120 Sekunden.
- SSE erhält die Nachricht ohne Intervallabfrage und unterbricht die normale Content-Rotation.
- Nach Ablauf erscheint wieder das vorhergehende Plugin, außer inzwischen kam eine weitere Nachricht.
- Bei kurzem Verbindungsabbruch erhält ein neuer SSE-Client auch die noch gültige letzte Nachricht.

## Wichtige Produktionsgrenze

Die Implementierung benutzt **prozesslokales In-Memory-Pub/Sub** und ist deshalb für einen **dauerhaft laufenden einzelnen Node.js-Prozess** (z.B. lokal, eigener Server) gedacht. Bei Vercel/serverlosen oder mehreren Serverinstanzen sind SSE-Verbindungen, gemeinsam sichtbare Nachrichten und erneute Zustellung **nicht zuverlässig gewährleistet**. Für Deployment dort braucht es einen dauerhaft verfügbaren zentralen Realtime-Dienst (z.B. Redis Pub/Sub mit SSE-fähigem Host oder Ably/Pusher) und optional durable Event-Speicherung. Ohne diese zusätzliche Infrastruktur darf keine globale Sofortzustellung versprochen werden. Keine Historie nach Neustart.

`priority` wird bereits akzeptiert und zurückgemeldet; die aktuelle Leinwand behandelt jede Push-Nachricht als sofort vorrangig. Eine echte prioritätsgesteuerte Warteschlange ist nicht Bestandteil von V331.
