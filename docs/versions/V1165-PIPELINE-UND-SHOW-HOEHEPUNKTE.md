# Pipeline-Reparatur und neue Show-Höhepunkte

## Belegter CI-Abbruch

Die Push-Pipeline für `80a9ae8` brach unter Ubuntu und Windows vor `npm ci` im Schritt „Verify lockfile and cross-platform source names“ ab. Acht historische Readiness-Prüfungen erwarteten den Governor-Aufruf mit `coordinatedLookV1154`. Die Ensemble-Erweiterung reicht inzwischen `ensembleLook` an denselben abschließenden Governor weiter. Die Gerätebegrenzung war vorhanden, wurde aber von den älteren String-Prüfungen nicht erkannt. Weitere geerbte Regressionstests enthielten dieselbe alte Erwartung und wurden ebenfalls angepasst.

`lib/goveeSenderInvariant.cjs` prüft jetzt die bekannte Verarbeitungskette gemeinsam und ohne installierte Abhängigkeiten: Show-Look → Raumlicht → optionale Koordination → optionales Ensemble → abschließender V961-Governor → genau ein LAN-Look-Versand. Auch die erneute Auto-Sync-Prüfung unmittelbar vor dem Versand muss bestehen bleiben. Eingebaute Ebenen dürfen nicht übersprungen oder hinter den Governor verschoben werden. Die Prüfungen laufen auf dem tatsächlichen Sender-Quelltext; historische Assertions zu manuellen Prioritäten, Datenfreigaben und Helligkeitsgrenzen bleiben erhalten.

`tests/govee-sender-invariant.cjs` testet die aktuelle und frühere Route, Windows-Zeilenenden sowie absichtlich fehlerhafte Varianten: übersprungene Lichtschichten, ungefilterten Versand, doppelte Befehle, fehlende Auto-Sync-Prüfung und einen Governor, der nur noch in einem Kommentar steht. Der Test gehört zur aktiven `test:v1136`-Suite. Es wurden keine CI-Schritte übersprungen, keine Prüfungen auf „continue-on-error“ gesetzt und keine Schutzschicht aus dem Gerätepfad entfernt.

Die echte Vorabprüfung wurde in einem frischen exportierten Quellbaum reproduziert: vorher acht Fehler bei 2.298 Prüfungen, nach der Korrektur keine Fehler. Der unabhängige Quellbaum verhindert, dass die automatische lokale Synchronisierung historischer Workflow-Titel als Änderung am Projekt eingecheckt wird.

## Tatsächlichen Geräteversand begrenzen

Eine zusätzliche Browserprüfung zeigte eine echte Timing-Lücke: Der alte Scheduler markierte einen Durchlauf bereits vor langsamer Inventar-/Bridge-Arbeit als gesendet. Dadurch konnte der nächste tatsächliche Lampenbefehl zu früh folgen. `lib/goveeLookPacing.ts` begrenzt nun den bestehenden Sender direkt am Netzwerkaufruf: höchstens eine laufende Look-Anfrage und mindestens 900 ms nach deren Abschluss pro Bridge/Lampe. Der Zustand bleibt über Einstellungswechsel bestehen; maximal 64 Einträge, keine Warteschlange und keine neuen Timer. Fehlgeschlagene Anfragen geben ihre Reservierung im `finally`-Block frei. Die vorhandenen Retry- und Auto-Sync-Regeln bleiben bestehen.

Der Govee-Browsertest verzögert das Inventar der Mock-Bridge bewusst und behält seine bisherige Abstandsprüfung bei. Pure Tests prüfen außerdem überlappende Anfragen, Neustarts des Sender-Effekts, voneinander unabhängige Lampen und die Speichergrenze.

## Audio-Prüfungen vom Grafik-Browser trennen

Die bereits zuvor zeitweise instabilen Web-Audio-Prüfungen erhalten über `tests/e2e/audio-fixtures.cjs` getrennte Worker für Worker- und Fallback-Pfad mit frischen Browserprozessen. Damit übernehmen die virtuellen Aufnahmeuhren keinen Browser, in dem vorher aufwendige WebGL-Shows liefen. Die zwei Varianten werden in getrennten Spec-Dateien über eine Worker-Option isoliert. Die echte Web-Audio-Pulserzeugung, der unveränderte BPM-/Konfidenzbereich, Worker-/Fallback-Prüfungen, Projektoptionen, Screenshots und der Schutz gegen externe Browser-Anfragen bleiben bestehen. Es gibt keine pauschalen Wiederholungen oder aufgeweichten Tempo-Grenzen.

## Drei neue Bühneneffekte

Die vorhandenen Hintergrund- und Bodenflächen zeigen bei Refrains, Instrumentalbildern und im Finale zusätzliche Akzente:

- Lichtportale öffnen die Bühne optisch in die Tiefe.
- Meteorspuren ziehen mit weichen Schweifen durch den Hintergrund.
- Kreisende Lichtfächer verbinden den Raum mit sanften Bodenringen.

Wiederholte Refrains variieren das zusätzliche Motiv. Seine Stärke folgt der bestehenden Songdramaturgie und dem Phrasenverlauf; es handelt sich um geplante Show-Bilder, nicht um eine neue akustische Beat-Erkennung. Farbpalette, vorhandenes Raum-Motiv und Finale-Rückbezug bleiben gemeinsam erhalten. Der Bereich hinter Gesichtern bleibt gedämpft und die feste Lyrics-Zone frei.

Die Effekte verwenden dieselben zwei Shader-Zeichenflächen. Es gibt keine zusätzlichen Lichtquellen, Schatten, Draw Calls, Timer oder Netzwerkabfragen. Bei Pause, wichtigen Textstellen, dichtem Rap, reduzierter Bewegung, niedriger Leistungsstufe oder ausgeschalteten Raumeffekten werden die zusätzlichen Akzente entfernt. Manuelle Lichtregie bleibt vorrangig. Die bestehenden Schalter „Raum- und Bodeneffekte“ und „Effektstärke“ regeln auch die neuen Bilder; weitere Bedienfelder kommen nicht dazu.

`tests/concert-atmosphere.cjs` prüft Motivauswahl, Grenzen und Schutzfälle. `tests/e2e/concert-atmosphere.spec.cjs` prüft die tatsächlich gesetzten Shader-Uniformen für alle drei Akzente, die Pause, Shader-Fehler und den getrennten Lyrics-Bereich. Spotify und Lyrics bleiben gemockt; die Govee-Regressionsprüfung verwendet eine Mock-Bridge. Physische Leuchten werden durch diese Tests nicht angesprochen.

## Seitliche Bühnen-Screens für Bilder und Text

Zwei seitliche Screens ergänzen die bestehende LED-Wand. Links erscheint das aktuelle Albumcover mit Titel und Interpret außerhalb des unverändert eingepassten Bildes. Rechts stehen Songinformationen oder die echte, aktuell freigegebene Refrain-Zeile. Die primäre Lyrics-Zone bleibt unverändert zugänglich und frei von Bühnenbildern. Bei wichtigen Textstellen und Rap werden die seitlichen Screens gedimmt und ihre zusätzlichen Lyrics entfernt.

Die Performance-Regie erlaubt auf hoher Stufe zwei, auf mittlerer Stufe einen und auf niedriger Stufe keinen zusätzlichen Screen. Manuelle Bühnenregie behält Vorrang. Unter „Bühne & Effekte“ lässt sich „Albumcover & Titel auf Bühnen-Screens“ ausschalten; der Schalter bleibt nach Neuladen erhalten. Es gibt keine neuen Bedienelemente auf der Konzertfläche.

`lib/concertStageScreens.ts` prüft Track-Identität, Inhalt und Budget und malt die Originalbilder im richtigen Seitenverhältnis in feste Canvas-Texturen. `ConcertStageScreens` besitzt und entsorgt diese Texturen. Bilder werden einmal pro Song über die vorhandene Cover-URL geladen; URLs mit fremdem HTTP, Zugangsdaten oder ausführbaren Protokollen werden abgewiesen. Bei fehlendem Bild, fehlender CORS-Freigabe oder Ladefehler wird ein lokales Motiv mit echten Songinformationen gezeigt. Alte Lade-Callbacks können nach einem Songwechsel keine neuen Texturen überschreiben. Vorschau-Bühnen ohne Track erhalten keine fremden Musikdaten.

Die bestehenden Raum-Effekte behalten ihre zwei Shader-Zeichenflächen; die neuen Bildschirme benötigen zusätzlich höchstens zwei einfache Flächen. Sie haben keine eigenen Frame-Schleifen oder Netzwerk-Timer. Die Cover-Textur wird bei Metadaten-/Bildwechsel, die Textkarte bei einem echten Zeilenwechsel neu gezeichnet.

`tests/concert-stage-screens.cjs` prüft Identität, Budgets, Leseschutz, URL-Regeln und die tatsächlichen Canvas-Zeichenaufrufe einschließlich unbeschnittener Bildproportionen. `tests/e2e/concert-stage-screens.spec.cjs` prüft die geladenen Bildschirme, Songwechsel, Bild-Fallback, Rap-Dimmung, Abstände zur Lyrics-Zone und den gespeicherten Opt-out. Die Tests sind in die aktive Release-Suite aufgenommen.
