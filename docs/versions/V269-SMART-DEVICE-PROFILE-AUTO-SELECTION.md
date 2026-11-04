# Sonic Display V269 – Smart Device Profile Auto Selection

V269 erweitert die bestehende Geräteprofilverwaltung aus V267/V268 um eine automatische, **rein empfehlende** Auswahl.

- Identifiziert das aktuelle Gerät über die vorhandene Hardwarekennung.
- Berücksichtigt ausschließlich valide Profile mit **exakt gleicher Gerätekennung** (keine geräteübergreifenden Versprechen).
- Bevorzugt den höchsten gespeicherten Experiment-Score, bei Gleichstand die jüngste Messung.
- Zeigt die Empfehlung in Einstellungen → Diagnose → Performance Profile Manager an.
- Erkennt, wenn Renderqualität und Multi-Avatar-Director bereits wie empfohlen eingestellt sind.
- Öffnet nur auf Knopfdruck die bestehende Vorschau; tatsächliche Änderungen erfolgen erst über „Dieses Profil übernehmen“.
- Importierte Profile können empfohlen werden, sobald ihre Kennung mit dem aktuellen Gerät übereinstimmt.
- Keine Änderung von Avataren, Choreografien, Spotify oder Lyrics.

Einschränkungen: Die browserbasierte Kennung ist kein kryptografisch stabiler Geräte-Identifier; Bildschirm- oder Browseränderungen können sie verändern. Ein Experiment-Score ist nur unter vergleichbaren Szenen zuverlässig. Keine Cloud-Synchronisierung und keine Hintergrundaktivierung.

Tests: `npm run test:v269`, `npm run verify:offline`, `npm run build` (mit installierten Abhängigkeiten).
