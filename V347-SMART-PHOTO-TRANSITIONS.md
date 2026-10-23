# Sonic Display V347 – Smart Photo Transitions

## Änderungen
- Optionales, standardmäßig **deaktiviertes** Übergangssystem für bestehende V345-Bildkompositionen.
- Bildkacheln animieren Änderungen von Position, Rahmengröße und Sichtbarkeit weich.
- V346-Moods (`focus`, `balanced`, `impact`) nutzen dieselbe Kachelidentität; verborgene Bilder bleiben während des Übergangs montiert.
- Beim Wechsel des Bild-URLs überblendet ein kleines DOM-basiertes React-Element zwei Fotos. Die Anzahl der WebGL-Objekte wächst nicht.
- Optionaler Beat-Gate: Wechsel beim nächsten steigenden Beat-Akzent oberhalb der Schwelle, spätestens nach kurzer Timeout-Obergrenze. Offline- oder pausierter Zustand wechselt sofort.
- Parameter: Stil, Animationsdauer, Überblendungsdauer, Beat-Schwelle, maximale Wartezeit.
- Keine externe Bild-URL in den Übergangseinstellungen gespeichert. Einstellungen in `localStorage`, Aktualisierung per Event.
- `prefers-reduced-motion` und `reducedMotion` verhindern die animierten Effekte.

## Bedienung
Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V347 Smart Photo Transitions.
V345-Mehrbild-Komposition aktivieren. Für automatische, musikabhängige Stimmungswechsel zusätzlich V346 aktivieren.

## Checks
`npm run verify:offline`; ergänzend auf dem eigenen Rechner nach `npm install`: `npm run verify`.
Das Entwicklungsumfeld enthält nicht die vollständigen lokalen npm-Pakete, deshalb kann `next build` hier ggf. nicht gestartet werden.
