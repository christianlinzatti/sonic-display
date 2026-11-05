# V982 — AI Immersive Show Studio & Depth Portal

## Sichtbar neu

Im vorhandenen **Live FX Deck** befindet sich das **V982 KI Immersive Show Studio**:

1. Beschreibe die gewünschte Atmosphäre, z. B. „Düsterer Deutschrap-Club“ oder „Hardtekk-Reaktor mit Neon-Drops“.
2. Über **KI-Regie fragen** wird eine optional konfigurierte OpenAI Responses API aufgerufen. Nur der Text und das angezeigte Genre werden übertragen; es gibt keine automatische Song-, Audio-, Lyrics-, Spotify-Verlaufs- oder Geräteübermittlung.
3. Ohne `OPENAI_API_KEY` funktioniert **Lokal entwerfen**: ein deterministischer, ausdrücklich **nicht** als KI bezeichneter Vorschlag.
4. Zuerst sieht man fünf Vorschauideen (Intro, Verse, Hook, Drop, Finale), Farbwelt und konservative Intensitäten. Es sind **Ideen**, keine behauptete Audiosynchronisation.
5. Nur **Diesen Show-Look übernehmen** ändert die bereits aktivierten, virtuellen Live-FX-/V885-Atmosphäre-/V894-3D-Look-Einstellungen. Effekte werden niemals durch die Antwort neu aktiviert. FX-Intensität wird höchstens reduziert, maximal 75%. Ein Undo ist möglich, solange die Werte seit der Übernahme nicht von Hand geändert wurden.

**Zusätzliche visuelle Tiefe:** Drei subtile hintere Lichtringe im bestehenden V966-Immersions-Canvas, nur bei bestätigten, aktiven High-Energy-Szenen. Kein neuer Renderloop, kein Postprocessing-Pass, kein neues Audio und keine Steuerung echter Govee-/Alexa-Geräte. Vorhandene Schutzpfade für Lyrics, reduzierte Bewegung, Pi-Sparmodus und manuelle Szenen bleiben unverändert.

## Konfiguration

Vercel / lokale `.env.local`:

```dotenv
OPENAI_API_KEY=...                  # geheim, nie NEXT_PUBLIC_
OPENAI_MODEL=gpt-4.1-mini          # optional
```

Benötigt eine aktive Spotify-Sitzung für die serverseitige KI-Abfrage. Ohne API-Key bleibt die lokale Regie nutzbar. Die API-Abfrage kann kostenpflichtig sein. `store:false`, 18-s Timeout, Origin-Prüfung, Authentifizierung und ein best-effort In-Memory-Burst-Limit von sechs Anfragen pro fünf Minuten pro Sitzung sind integriert. Das In-Memory-Limit ist **keine** globale Missbrauchssperre auf mehreren Vercel-Instanzen; für öffentliche Installationen ggf. WAF-/Edge-Limits ergänzen.

## Testergebnisse / Freigaberegeln

- V982-Regressionen inklusive Endpoint-Mocks, validiertem Modellresultat, Eingabegrößen, Consent, Abbruch, Schutz gegen echte Geräte, API-Key-Fallback und Renderer-Budget.
- Alle bestehenden V966, V967–V981 (soweit im jeweiligen Testlauf dokumentiert) müssen weiterhin grün sein.
- Ein vollständiges `npm ci`, `tsc --noEmit` und `next build` ist **vor Produktionsfreigabe Pflicht**. Ohne installierte Abhängigkeiten oder Node 24 ist ein lokaler erfolgreicher Produktionsbuild **nicht nachgewiesen**.
- `scripts/vercel-production-build.cjs` enthält V982-Regression und isolierten TypeScript-Gate vor dem echten Next.js-Build. Der ZIP-Importer prüft `sonicRoadmapRelease=v982` und importiert die neue Version über `releases/SonicDisplay-V982.zip`.

## Grenzen

Die AI setzt Farb-/Intensitätspräferenzen, keine direkt generierten Musikabschnitte. Diese Vorschläge werden vom vorhandenen Timeline-/Safety-System nur bei verifizierter Wiedergabe berücksichtigt. Die Wirkungen auf einem echten Raspberry Pi sowie ein echter OpenAI-Anbieteraufruf sind nicht ohne entsprechendes Gerät bzw. Schlüssel bestätigt.
