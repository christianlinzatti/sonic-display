# Sonic Display V904 – Concert Quality Regression Guard

V904 ergänzt den V901/V902/V903-Bereich um **nur lesende Wiederholbarkeitsdiagnostik**.

## Bedienung

1. In einem bestätigten Songabschnitt die V826-Livetelemetrie laufen lassen.
2. Einen nachvollziehbaren V902-Vorschlag über Vorschau und Bestätigung anwenden.
3. V903 muss zuerst mindestens drei frische Vorher-Fenster, zwei verworfene
   Nachher-Übergangsfenster und mindestens drei gültige Nachher-Fenster sammeln.
4. Zum gleichen Song, gleichen Abschnitt und gleichen FPS-Ziel/Tier zurückkehren,
   einen **identischen** Einstellungswechsel erneut **explizit** vornehmen
   (gegebenenfalls nach expliziter V903-Rücknahme) und erneut messen.
5. Ab **drei separaten abgeschlossenen Vergleichen** zeigt V904 eine
   vorsichtige Tendenz. Schwankende Vorzeichen/spitze Streuung werden als
   instabil markiert, ein nicht einheitlicher Vorteil als 'kein Vorteil'.
6. Aggregierten JSON-Bericht herunterladen oder den Sitzungsverlauf nach
   zweiter Bestätigung löschen. Keine Show-Einstellung wird dabei verändert.

## Messung und Grenzen

- Quellwerte: vorhandene V826-Frameabstände, V903-Validierung und echte
  V902-Übernahme. Keine Vorhersagen, keine GPU-Zeit, keine Bildanalyse.
- Vergleichsmerkmale: exakter **privater** Songschlüssel, Szenenindex,
  Patch (Ziel, Feld, ursprünglicher und neuer Wert), FPS-Ziel, Tier.
- Gruppen von verschiedenen Songs werden **nicht** zusammengefasst.
- Zustände: zu wenige Wiederholungen, schwankend, kein konsistenter Vorteil,
  möglicher Vorteil, mögliche Verschlechterung.
- Drei Messungen sind keine ausreichende Grundlage für statistische Signifikanz;
  selbst ein günstiges Ergebnis belegt keine ursächliche Verbesserung.
- Höchstens 24 abgeschlossene Vergleiche, höchstens 8 angezeigte Gruppen.
  Nur flache Fensteraggregate im Arbeitsspeicher; keine Persistenz.
- Export enthält **keine** Track-ID, Wiedergabezeit, Rohframes oder Spotify-Daten.
- Kein zusätzlicher V826-Listener/RAF, kein WebGL-Mesh, keine automatische
  V902-Übernahme und kein automatischer V903-Rollback.

## Entwicklungstests

```powershell
npm ci
npm run verify:v904:focused
npm run typecheck
npm run build
npm run dev
```

Die fokussierte Prüfkette ist von einem echten vollständigen Next.js-Build
und einem visuellen WebGL-Test zu unterscheiden.
