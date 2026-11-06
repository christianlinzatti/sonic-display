# V1014 – Network Diagnostics 2.0

- **Live-Laufzeiten:** 5-Minuten-Fenster mit Median (P50) und P95 für Antwortzeiten und Warteschlangenverzögerung. Eigene Metriken für alle vier Prioritätsbereiche und sichere Dienstkategorien.
- **Echtzeit-Engpässe:** Alter der ältesten aktiven und wartenden Anfrage; Hinweise für Warteschlangen, ausgelastete Slots, langsame Dienste, Timeouts, Offline-Betrieb und Spotify-429.
- **Datenschutz:** Maximal 120 abgeschlossene Versuche im Browser-RAM, keine URLs, Suchtexte, Spotify-Kontonamen, Songinformationen, Tokens, Fehlertexte oder Antwortdaten. Jede Kontoänderung löscht die Messhistorie und verwirft Spätantworten.
- **Keine Zusatzabfragen:** Kennzahlen stammen ausschließlich aus den bereits durch V1010 laufenden Requests. Dashboard und Diagnosefunktion sind lesend.
- **Stabilität:** V1010–V1013 bleiben aktiv; V1014-Regressionen und isolierter TypeScript-Check werden in Vercel und GitHub Full Production Gate aufgenommen. Ein fehlgeschlagener Gate wird nicht übergangen.

## Testschwerpunkte

Abbrüche, parallele Abrufe, P50/P95, echte Warteschlangenverzögerung, Fehlersortierung, Prüfung der Datenisolation, 120er-Ringpuffer, Kontowechsel und sensible Daten. Der vollständige Node-24-Next.js-Build inklusive Playwright muss auf GitHub bestätigt werden.
