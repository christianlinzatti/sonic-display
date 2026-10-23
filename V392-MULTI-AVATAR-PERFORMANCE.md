# V392 – Multi-Avatar Performance 3.0

## Überblick

V392 ergänzt die bisherigen V206/V274 Duo-Regie und V326 Gruppenbühne um eine abschaltbare, übergeordnete Rollenakzentuierung. **Standardmäßig aus**. Die Einstellungen befinden sich unter **Einstellungen → Avatar tuning → V392 – Multi-Avatar Performance 3.0**.

- Modi: **Aus**, **Dezent**, **Ausdrucksstark**, zusätzliche Stärke 0–100 %.
- Eine gemeinsame Song-/BPM-basierte 4-Beat-Phrase für bis zu vier Rollen: Lead, Backing und Tänzer. In der Verse-Phase wechselt die Lead-Akzentuierung gelegentlich zu einem Partner (Call and Response), ohne die tatsächliche Stimme zu identifizieren.
- Stabilisierte Verse/Hook/Build/Drop/Break-Wechsel. Bereits ermittelte Bühnenabschnitte haben Vorrang; sonst werden Energie/Kick als **Heuristik** genutzt.
- Duo: Leichte yaw-Blicke und Gewichtung **bestehender** Partnergesten. Gruppe: Gewichtung individueller reaktiver Audiosignale und dezente Bühnen-Yaw-Bewegung. Es werden keine Animationen/Mixer oder GPU-Effekte neu angelegt.
- Der Gruppen-Editor V326 bestimmt weiterhin vollständig alle Positionen. Vorhandene Foot IK, Kontaktpunkte und importierte GLB-Animationsdaten bleiben unangetastet.
- Manuelle Gesangsrollen V385, explizite Gruppenzuordnung sowie priorisierte Choreografien und Show-Aufstellungen deaktivieren die zusätzlichen V392-Akzente automatisch.
- Pause, reduzierte Bewegung, 0-%-Stärke und Modus Aus liefern den Originalzustand. Songwechsel und Wiedergabesprünge setzen den gemeinsamen Rollenstatus zurück.

**Einschränkung:** Spotify stellt keine isolierten Gesangsspuren bereit. „Lead“/„Backing“ sind ausschließlich **visuelle Bühnenrollen**; keine tatsächliche Sprecher-/Vokal-Erkennung. Die zusätzliche Reaktion wird nur angezeigt, wenn Duo/Gruppe aktiviert sind.

## Prüfung

`npm run test:v392`, `npm run check:syntax` und `npm run verify:offline`. Für den vollständigen Next.js-Produktionsbuild müssen die npm-Abhängigkeiten installiert werden (`npm install && npm run verify`).
