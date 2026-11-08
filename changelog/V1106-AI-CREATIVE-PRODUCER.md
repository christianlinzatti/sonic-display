# V1106 · AI Creative Producer / Show Remix (Feature auf stabiler V1105-Basis)

## Was ist neu?

- **OpenAI-Remix auf Knopfdruck:** optionales KI-Storyboard aus eigener Idee,
  Musikrichtung und Intensitätsobergrenze.
- **Sieben aufeinander abgestimmte Konzertabschnitte:** Intro, Strophe,
  Spannungsaufbau, Hook, Atempause, zweite Strophe und Finale.
- **Kohärente 360°-Inszenierung:** vorhandene Bühnenformen, schwebende Plattformen,
  rein virtuelle Laserlooks, Kameraperspektiven und Tänzerrollen ändern sich pro Akt.
- **Offline-Fallback:** regelbasierte, als solche gekennzeichnete Remixes für
  Deutschrap, Hardtekk, Deutschrock und Pop ohne Konto/API-Anfrage.
- **Sicherer Ablauf:** Vorschau vor Übernahme; bestehende Zeitgrenzen bleiben erhalten,
  der Showplan wird nicht ohne Zustimmung aktiviert. Konfliktsicheres Undo.
- **Performance-/Accessibility-Schutz:** maximal 85% Entwurfsintensität,
  höchstens 45 Prozentpunkte Sprung zwischen Akten, Reduced Motion bleibt maßgeblich.
  Keine Hardware-Aktionen, keine neuen Pyro- oder Strobo-Freigaben.

## Verwendung

1. **Settings → Avatare/Bühne → Bühnenstil: 360° Arena** wählen.
2. Im **V1040 AI Show Designer** den neuen **V1106 KI Creative Producer** öffnen.
3. Idee eingeben, Intensität begrenzen und entweder **Mit OpenAI kreativ gestalten**
   oder **Offline-Remix ausprobieren** wählen.
4. Sieben Szenen prüfen und auf Wunsch **in den Showplan übernehmen**.
5. Bestehenden Schalter **Diesen Showplan live auf die 360°-Bühne anwenden** einschalten.

Die OpenAI-Funktion benötigt wie bestehende Sonic-Display-KI-APIs ein serverseitig
konfiguriertes `OPENAI_API_KEY`, optional `OPENAI_MODEL`, und eine Spotify-Anmeldung.
Der Schlüssel wird nie an den Browser gesendet. Nur kurzer Prompt, Genre und Limit
werden auf ausdrücklichen Klick gesendet; keine Tracktitel, Lyrics oder Audiodaten.

## Qualitätssicherung

- `npm run test:v1106` – Validierungs-, Genre-, Sicherheit-, Undo-
  und Timeline-Regressionstests (7 Gruppen).
- `npm run test:v1106:types` – isolierte, strenge TypeScript-Prüfung.
- `tests/e2e/ai-show-remix-v1106.spec.cjs` – reale Desktop-/Touch-Browserprüfung
  mit Screenshot-Nachweis; wird von der bestehenden Playwright-Production-Suite geladen.
- Erfolgreiche lokale Tests: V1106 core, V1105, V1104, V1080, V591,
  V965 und V959 preflight (ohne installierte Next-/React-Pakete).

**Release-Metadaten bleiben bewusst V1105:** Die zuletzt grüne Pipeline und
importierbare Basis bleiben unverändert. V1106 bezeichnet hier die neue
Funktionseinheit. Ein vollständiger GitHub-Actions-/Playwright-Neulauf steht
bis zur Installation und Ausführung dieses ZIPs noch aus.
