# V364 – PWA-Grundlage (Teilimplementierung)

Enthält Web App Manifest, Icon, Service Worker für App-Installation, sicheren Offline-Hinweis ohne Caching von Spotify-API-Antworten sowie einen Schalter zur Benachrichtigungsberechtigung.

**Nicht implementiert:** Echte Push-Abonnements, VAPID-Schlüssel, serverseitige persistente Subscriptions, Cron-Release-Prüfung und Hintergrund-Push bei geschlossener App. Der Berechtigungsschalter allein versendet keine Meldungen. Für den vollen Funktionsumfang braucht es einen serverseitigen Scheduler und Datenbank/Subscription-Store; eine Spotify-Sitzung allein im Browser-Cookie ist dafür nicht ausreichend.

HTTPS ist für die Installation und Service Worker außerhalb von localhost erforderlich. Für produktive Android-PWA-Icons sind PNG-Größen 192 und 512 zusätzlich empfehlenswert.
