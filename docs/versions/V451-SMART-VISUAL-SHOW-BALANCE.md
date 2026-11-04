# V451 – Smart Visual Show Balance

Eine zentrale, deterministische Priorisierung für **automatische** Genius-Karten. Die Avatare, Kamera, Lyrics und manuell gespeicherten Choreografien werden nicht verändert.

- Bei aktiven synchronisierten Lyrics haben Karaoke und Bühne Vorrang; passive V447/V448/V450-Karten bleiben unsichtbar.
- In Textpausen ab 2,8 Sekunden sind kleine Informationskarten erlaubt. Im immersiven Lyrics-Modus sind für große Karten mindestens vier Sekunden nötig.
- Bei passender Songinformation und Verbindung wird nie mehr als **eine automatische** Genius-Karte gleichzeitig gezeigt. Die V450-Verbindung hat bei Kollision Vorrang; V449 als vom Nutzer aufklappbare Entdeckung bleibt unabhängig verfügbar.
- Ohne synchronisierte Lyrics oder bei explizit versteckten Lyrics bleibt die Show-Info verfügbar; in Pause erfolgt keine automatische Einblendung.
- Ein einziger Schalter in Einstellungen → Anzeige, standardmäßig an. Ausschalten stellt den V450-Anzeigemodus wieder her.
- Keine zusätzliche API/Abhängigkeit und kein Raw Audio. Reduzierte Bewegung und responsive Textspalte unterstützt.

**Ehrliche Grenze:** Songabschnitte werden nicht akustisch klassifiziert. Die Priorisierung basiert auf vorhandenen Lyrics-Zeiten; in Songs mit durchgehenden Lyrics kann die Genius-Info selten erscheinen. Manuell zu öffnende Entdeckungen bleiben erreichbar.

Prüfung: `npm run verify:v451`, nach `npm install` zusätzlich `npm run typecheck` und `npm run build`.
