# Sonic Display V1015 – Adaptive Request Intelligence

## Funktion
- Automatische Hintergrundkapazität auf Basis tatsächlich abgeschlossener Netzwerkversuche. Keine synthetischen Prüfanfragen, keine zusätzlichen Polling-Timer.
- Getrennte, feste Kapazitäten für Benutzeraktionen und aktuelle Wiedergabe. Nur `regular` (Lyrics/Genre) und `optional` (Bilder/Biografien) werden angepasst.
- Sofortige Reduktion bei HTTP 429 (Spotify `Retry-After` bleibt unabhängig als Anbieter-Sperre aktiv); nach zwei aufeinanderfolgenden transienten Netzwerkfehlern oder drei langsamen Antworten wird je ein Slot entzogen.
- Wiederaufbau mit höchstens einem Slot nach jeweils sechs schnellen erfolgreichen Antworten, nie höher als die konfigurierte Kapazität; nie unter einem Slot.
- HTTP 401/403 und absichtlich abgebrochene Anfragen zählen nicht als instabile Netzwerkqualität. Bestehende Fehler-Wiederholungslogik und Circuit Breaker bleiben unverändert.
- Passives Dashboard unter Service-Status mit Kapazität, Anpassungsgrund und Zählern. Weder URLs, Titel, Zugriffstokens, Konten noch Fehlertexte werden protokolliert.
- Kontoabmeldung/Kontowechsel stellt Original-Limits und Diagnosezähler wieder her.

## Technische Prüfung
- `npm run test:v1015` – Echtzeit-Scheduler + deterministischer AIMD-Kern inklusive Schutz vor Kapazitätsüberlauf.
- `npm run test:v1015:types` – isolierter strikter TypeScript-Check.
- Historische Regressionen V1010–V1014, CI-Preflight und Routing; Windows-/Linux-Matrix und Vercel-Gate bleiben verpflichtend.
- Vollständiger Node-24-Next.js-Produktionsbuild muss in GitHub Actions bestätigt werden.
