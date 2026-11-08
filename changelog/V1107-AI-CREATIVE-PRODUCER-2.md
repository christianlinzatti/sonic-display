# Sonic Display V1107 – AI Creative Producer 2.0

## Neue Konzertregie

Die vorhandene KI-Show-Remix-Oberfläche aus V1106 hat einen eigenständigen Regiefeinschliff erhalten:

- **Vier Regiestile:** filmische Dramaturgie, große Festivalshow, intime Live-Session und überraschende Perspektiven.
- **Dynamikkurve:** Regler für Kontrast zwischen ruhigen Szenen und Höhepunkten, ohne extreme Helligkeitssprünge.
- **Überraschungen:** steuerbare, nachvollziehbare Perspektiv-/Bühnenwechsel in der späten Showphase.
- **Stimmungshinweis:** optionaler manuell gewählter oder lokal aus aktuell gemessenem Mikrofonpegel abgeleiteter Hinweis.
- **Transparente Vorschau:** Anzahl verschiedener Kameraperspektiven und Bühnenvarianten sowie die errechnete Dynamikspanne.
- **Freigabe und Undo:** Nichts wird auf die Livebühne übernommen, bevor der Nutzer den Vorschlag bestätigt. Die ursprünglichen Start-/End-Zeiten, Szenen-IDs und die vorhandenen Pausen-/Reduced-Motion-Schutzmaßnahmen bleiben erhalten.

Der Offline-Regisseur funktioniert ohne Internet und verändert nur die 360°-Show-Timeline nach expliziter Bestätigung. Bei vorhandener Spotify-Anmeldung und optionalem serverseitigem `OPENAI_API_KEY` kann die gleiche Regie über OpenAI als strukturierter Vorschlag angefordert werden. KI-Antworten werden streng validiert und anschließend sicher auf zulässige virtuelle Cues reduziert. Fehler überschreiben den Showplan nicht.

**Wichtig:** Die sieben Abschnitte bleiben zunächst ein dramaturgischer Entwurf, keine bestätigte Songstruktur- oder Drop-Erkennung. Keine neuen Gerätebefehle, Govee-Automationen, Pyrotechnik oder Stroboskopimpulse.

## Technische Integration

- `lib/aiCreativeProducerV1107.ts`: geprüfte Regieparameter, deterministische Stilvarianten, Intensitätsgrenzen, Audit.
- `components/visualizer/AiShowRemixPanelV1106.tsx`: zusätzliche Controls in der bestehenden Show-Designer-UI.
- `app/api/ai/show-remix/route.ts`: optionale Regieparameter, serverseitige Validierung, kein ungeprüftes Modell-Ergebnis.
- `tests/v1107-ai-creative-producer-regression.cjs`, `tests/tsconfig.v1107-core.json`, `tests/e2e/ai-creative-producer-v1107.spec.cjs`: Kern- und Browserprüfungen.

## CI und Installation

Die Projektversion wurde auf **0.1.0-v1107** erhöht, einschließlich Lockfile und Release-Metadaten. Die bestehende grüne V1105-Pipeline und ihre Ubuntu/Windows-Aufgabenteilung bleiben erhalten. Die V1107-Regression läuft zu Beginn der verpflichtenden `prebuild`-Kette; ältere V1105-Prüfungen bleiben enthalten. Nach GitHub-Import sind der vollständige Next.js-Build und die Playwright-Screenshot-Artefakte weiterhin die maßgebliche Freigabe.
