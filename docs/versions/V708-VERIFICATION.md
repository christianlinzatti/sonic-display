# V708 – Last.fm-Automatik: tatsächlicher Prüfbericht

Stand: 29.10.2026. Basis: vollständiger Quellstand V707, ergänzt um den kontoabhängigen Opt-in-Poller V708.

## Erfolgreich ausgeführt

- `npm run test:v708`: **PASS**, 61 fokussierte Prüfgruppen und 12.000 verworfene ungültige API-Seiten. Abgedeckt: Opt-in default OFF, Aktivierung nur bei ausgewähltem Last.fm-Konto mit intaktem Archiv, Opt-out, Kontowechsel, beschädigte Zustände, separates Last.fm-Archiv, echte Wiederholungen, exakte Dubletten, Replay-Zeitstempel, ausschließlich Seite 1, Konto-/Seitenschutz, Link-/Zeitstempel-Validierung, Speicherfehler, Status, Sichtbarkeits-/API-Limit-Verträge, UI-Integration und Quellenstatistiken.
- `npm run test:v708:types`: **PASS**, V706/V708-Datenkern TypeScript isoliert.
- `npm run test:v708:ui-types`: **PASS**, V708 React-/JSX-Typecheck gegen **test-only React-Deklarationen**; dies **ersetzt nicht** den projektweiten vollständigen TypeScript-Build.
- `npm run test:v707`: **PASS**, 53 gezielte Tests / 12.000 ungültige Verlaufsereignisse.
- `npm run test:v706`: **PASS**, 81 gezielte Tests / 12.000 ungültige Scrobble-Fälle.
- `npm run test:quick`: **PASS, Exit-Code 0**, sämtliche Versionsregressionen **V669–V708** und alle anhängenden Struktur-/Sicherheitsprüfungen.
- `npm run check:syntax`: **PASS**, 985 TS/TSX-Quelltexte.
- `npm run check:architecture`: **PASS**, 634 Quellcode-Referenzen, aktuell V708.
- `npm run test:module-case`: **PASS**, 1.665 TS/TSX-Dateien ohne reine Groß-/Kleinschreibungs-Kollision.
- `npm run check:test-types`: **PASS**, acht Test-only-Typdeklarationen sind von produktiven Typen isoliert.
- `npm run test:env:spotify-build`: **PASS**, Spotify-Sitzungs-/OAuth-/Cookie-Sicherheitsprüfungen.
- ZIP nach Erstellung separat auf Dateiliste und CRC-Integrität geprüft.

## Ausgeführt, aber in dieser Umgebung blockiert

- `npm run build`: **BLOCKIERT** vor Next.js durch `check:dependencies`: nur **0/17** Projektpakete installiert und **kein `package-lock.json`** vorhanden. **Kein** erfolgreicher vollständiger Next.js-Produktionsbuild und keine erfolgreiche React-/Three.js-Produktions-Typisierung nachgewiesen.
- `npm run typecheck`: **FAIL (Abhängigkeiten fehlen)**, Next.js-/React-/Three-/Node-Modul- und Typauflösung nicht möglich.
- **Kein echter Browser-/Last.fm-Live-Lauf** mit einem persönlich eingerichteten Last.fm-API-Schlüssel, keiner echten Langzeit-/Mehr-Tab-/Offline-Abnahme. `user.getRecentTracks` wurde durch kontrollierte Fixtures getestet; die 5-Minuten-Pollinglogik wurde auf Verträge geprüft, nicht unter einem Live-Browser mit Zeitablauf gemessen.

## Produktgrenzen

- Nur sichtbarer und fokussierter, geöffneter Sonic-Display-Tab; bei geschlossenem Tab kein Polling.
- Lediglich die neueste Seite mit bis zu 200 Scrobbles; längere Nutzungslücken müssen bei Bedarf manuell seitenweise ergänzt werden.
- Maximal 8.000 lokale Last.fm-Ereignisse im bestehenden V706-Archiv. Für tragbare/verlaufsübergreifende Sicherung JSON-Backup verwenden.
- Kein Last.fm-Schreibzugriff, kein stilles Tracking ohne explizites Opt-in und keine automatische Verknüpfung/Übertragung mit einem Spotify-Konto.
- Gleichzeitige lokale Tab-Schreibvorgänge sind nicht voll transaktionssicher. Manuelles Nachladen liest vor jedem Schreiben das aktuelle Archiv, vermeidet damit einen typischen Überschreibungsfall, aber garantiert keine vollständige konkurrierende Serialisierung.

## Windows-Freigabe mit lokal installierten Abhängigkeiten

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
npm run dev
```

Anschließend in `.env.local` `LASTFM_API_KEY=...` konfigurieren, Last.fm-History öffnen, das lokale Archiv anlegen, Automatik explizit aktivieren und einige reale Scrobbles bei sichtbarer/fokussierter Anwendung prüfen. Kontrollieren: neuer Song, Wiederholung, fehlende Erfassung von Now-Playing, Deaktivierung, Kontowechsel, Netzwerkverlust und Gerätewechsel-Backup. In das endgültige Repository das mit `npm install` erzeugte Lockfile einchecken.
