# V986 – AI Atmosphere Designer (V985 → V986)

## Ziel und tatsächlicher Funktionsumfang

Die V983-Songidee und die V984-Fünf-Akt-Story erhalten ein zusammenhängendes
visuelles Atmosphärenkonzept: Farbfamilie mit fünf passenden Akzentfarben,
virtuelle Lichtstärke, Vorschläge für Nebel/Strahlen, LED-Motiv und weiche
Szenenübergänge. Die fünf Akte sind **kreative Gestaltung**, keine gemessenen
Refrains, Drops oder musikalischen Zeitpunkte.

**Wirksam nach ausdrücklicher Freigabe:**

1. Ein globaler virtueller Bühnen-Look wird über die schon in V982 vorhandene,
   deaktivierte und rücksetzbare Look-Übernahme angewendet. Nur bereits
   eingeschaltete virtuelle Systeme werden geändert; die bestehende
   FX-Obergrenze kann nur sinken.
2. Optional können virtuelle **Helligkeits-Cues** der `lighting`-Lane von V354
   **an tatsächlich bestätigten** V604/V763-Szenengrenzen importiert werden.
   Vorhandene/manuelle Cues in derselben Zeit werden nicht überschrieben,
   und die Timeline bleibt im ursprünglichen Aktivierungszustand.
3. Farbwechsel, Nebel-/Beam-Entwürfe und LED-Muster **je Akt sind noch
   Vorschauen**, keine automatisch ausgeführten dynamischen Einzel-Cues.
   Eine spätere Version kann sie über schon existierende virtuelle Systeme
   mit eigener, validierter Ausführung verbinden.

**Nicht enthalten:** Akustische BPM-Erkennung, echte Govee-Steuerung,
Alexa-/Matter-Befehle, Stroboskop/Blitz/Pyro-Hardware, automatisch
zeitgesteuerte LED-Muster, zusätzliche Shader/Renderloops.

## Bedienung

1. Im Live FX Deck eine V983-Songidee erzeugen (lokal oder per KI).
2. In V984 eine Geschichte erstellen.
3. Unter **V986 AI Atmosphere Designer** entweder
   **Lokale Lichtwelt erstellen** oder **KI-Lichtwelt gestalten** drücken.
4. Farben, fünf Akte und Grenzen ansehen. **Virtuelle Lichtwelt übernehmen**
   verändert den begrenzten V982-Look nach Freigabe. Der Rückgängig-Button
   bleibt im V982 Immersive Show Studio.
5. Für optionale songgebundene Licht-Cues braucht es eine bestätigte
   V604/V763-Timeline und die **passende V354-Songshow**; bei Bedarf diese im
   V985-Panel sicher anlegen. Markieren, Konflikte prüfen, bewusst importieren.
   Ohne Bestätigung keine Cues, keine Show-Aktivierung.

## KI & Datenschutz

Die Anfrage an `POST /api/ai/atmosphere` erfolgt **nur auf Klick** und enthält
nur die zuvor entworfene V984-Story und den Stimmungsbezeichner aus V983.
Spotify-Zugangstoken, Audiodaten, Lyrics und Historie werden nicht bewusst
übertragen. Ein serverseitiger `OPENAI_API_KEY` ist nötig, optional `OPENAI_MODEL`.
Die Route verlangt eine gültige Spotify-Sitzung, beschränkt Origin,
Payloadgröße, Antwortformat und Anfragen pro Sitzung, verwendet
`store:false` und validiert jede Modellantwort anhand der V986-Whitelist.
Ohne Schlüssel funktioniert der **lokale deterministische Entwurf**.

## Grenzen und Sicherheit

- Farbpalette und erlaubte Akzentfarben sind fest definiert.
- Virtuelle Beleuchtung max. 65, Dunstidee max. 35, Beamidee max. 55;
  V354-Lichtgain nur 0,65–1,25.
- Bestätigte Zeitpunkte stammen ausschließlich von V763 `verified-v604`;
  Track-ID, Songdauer und Szenenindex werden erneut geprüft.
- Kein Überschreiben vorhandener Cues, keine automatische Aktivierung,
  keine direkten Geräte-/Netzbefehle im Client und kein zusätzlicher
  WebGL-/Timer-/RAF-Prozess.
- Deaktivierte Automatik/Reduced Motion verhindern die globale V982-Übernahme.

## Prüfungen

```bash
npm run test:v986
npm run test:v986:types
npm run test:v985
npm run check:syntax
npm run check:architecture
```

`npm ci`, vollständiges `npm run typecheck`, `next build` und reale
GitHub-Actions-/Vercel-Builds sind gesonderte, notwendige Production Gates.
Das ZIP enthält die V832-Workflow-Ergänzung, aber der bestehende
GitHub-ZIP-Importer schützt `.github/workflows`: der Workflow-Patch muss
**separat über einen autorisierten GitHub-Commit** übernommen werden.
Das Paket aktiviert die neue Regression zudem im Prebuild und im
Vercel-Produktionsgate.
