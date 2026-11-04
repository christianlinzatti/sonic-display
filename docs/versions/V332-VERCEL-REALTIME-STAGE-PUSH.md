# V332 – Vercel Realtime Stage Push (Ably)

Diese Erweiterung verbindet die Live-Text-Leinwand aus V331 über Ably mit einer zentralen Realtime-Infrastruktur. Mehrere Browser/Displays und mehrere Vercel-Instanzen können denselben Kanal verwenden. Das bisherige lokale SSE bleibt erhalten, wenn `STAGE_CONTENT_ABLY_API_KEY` **nicht** gesetzt ist.

## Installation

1. Im Projektordner `npm install` ausführen (Ably-SDK wurde als Abhängigkeit ergänzt).
2. In Ably eine API-Key-Konfiguration mit **publish** und **token request**-Berechtigung erstellen. Token für Browser beschränken sich auf **subscribe**.
3. Für Next.js lokal und in Vercel folgende Umgebungsvariablen setzen:

```env
STAGE_CONTENT_PUSH_TOKEN=ein-langer-zufaelliger-token
STAGE_CONTENT_ABLY_API_KEY=appId.keyId:secret
STAGE_CONTENT_ABLY_CHANNEL=sonic-stage-live
```

4. Server neu starten bzw. Vercel neu deployen. Bestehende Spotify-Sitzung ist für den Browserempfang erforderlich.

## Senden

```powershell
$headers = @{ Authorization = "Bearer dein-langer-zufaelliger-token" }
$body = @{ title = "Live"; text = "Nächster Konzerttermin online!"; durationSeconds = 20; priority = "high" } | ConvertTo-Json
Invoke-RestMethod -Uri 'https://deine-domain.vercel.app/api/stage-content/push' -Method POST -Headers $headers -ContentType 'application/json' -Body $body
```

**Antwort:** `{ "ok": true, "id": "...", "expiresAt": ... }` nach erfolgreicher Veröffentlichung beim Provider. Das bestätigt die Veröffentlichung, **nicht** den Empfang jedes einzelnen Displays.

## Endpunkte

- `POST /api/stage-content/push`: Bearer-authentifizierte Veröffentlichung, mit Ably zentral oder ohne Ably lokal.
- `GET /api/stage-content/realtime-config`: Liefert nach Spotify-Sitzungsprüfung nur Kanalname und Aktivierungsstatus.
- `GET /api/stage-content/realtime-token`: Erstellt nach Spotify-Sitzungsprüfung einen kurzlebigen Ably-Token mit **subscribe-only**-Capability für genau einen Kanal.
- `GET /api/stage-content/live`: Bestehender V331-SSE-Kanal für lokale Installation.

**Sicherheitsregeln:** Ably-API-Key und Push-Token bleiben ausschließlich serverseitig. Niemals `NEXT_PUBLIC_` für diese Secrets verwenden. Unbekannte öffentliche Sender erhalten keine Authentifizierungsrechte. Der Ably-Abonnementkanal ist für alle bei derselben Sonic-Display-Installation authentifizierten Displays gemeinsam; für getrennte Konten/Haushalte wäre eine zusätzliche Benutzer-/Mandantenzuordnung nötig.

## Grenzen

- Ohne Ably existiert keine verlässliche Multi-Instanz-Zustellung. Ein einzelner Node-Prozess verwendet weiterhin SSE.
- Nachrichten sind Live-Ereignisse und werden nicht als dauerhafte Inbox gespeichert. Offline-Displays erhalten ältere Ereignisse nicht automatisch. Für garantierte Wiederzustellung wäre zusätzlich persistenter Speicher und Acknowledgement nötig.
- Browser/Netzwerk können den Realtime-Zugang blockieren; Video-/WebGL- und Ende-zu-Ende-Verhalten muss auf der tatsächlichen Zielumgebung getestet werden.
- Bei konfiguriertem Ably meldet der Push-Endpunkt einen Providerfehler mit HTTP 503 statt lokal irreführend Erfolg zu melden.
