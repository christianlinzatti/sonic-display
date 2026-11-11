# Konzertprogramm, Kalibrierung und Showaufnahme

Unter „Show steuern“ stehen nun Konzertprogramm, Variantenvergleich, Kalibrierung
und Videoaufnahme bereit. Die Bühne behält ihre zwei sichtbaren Bedienelemente.

Die Setlist verwendet bis zu 40 eindeutige Song-IDs mit Titel und Showkonzept.
„Aktuellen Song ergänzen“ übernimmt die beobachtete Spotify-ID. „Spannungsbogen
planen“ verteilt einen ruhigen Einstieg, Groove, einen ruhigen Mittelteil und ein
Festival-Finale. Nach dem Speichern folgt die Regie diesen Vorgaben beim tatsächlich
beobachteten Songwechsel. Sie startet keine Spotify-Wiedergabe und verändert keine
Warteschlange. Die vorhandenen Auftritts- und Abschlussszenen bilden die Übergänge.

Bis zu acht Regievarianten werden lokal gespeichert und über eine Auswahl geladen.
Song-ID und Position dienen als Vergleichsreferenz; dieselbe Musik muss für einen
Vergleich selbst erneut abgespielt werden. Das ist keine Aufnahme von Audiodaten
und kein automatischer Spotify-Seek.

Die Kalibrierung misst acht Sekunden kontinuierlich. Der vorherige Fehler, bei
jedem neuen Messwert den Timer neu zu starten, ist beseitigt. Zu wenige oder stille
Messwerte liefern keinen Vorschlag. Die Übernahme der Empfindlichkeit bleibt eine
explizite Aktion. Die Anzeigeverzögerung kann getrennt eingestellt werden.

Die Kamera erhält aus tatsächlich dominanten geladenen Tanzaktionen einen Hinweis
auf Fußarbeit und öffnet dann ihre Ganzkörperkomposition leicht. Duelle bekommen
mehr gemeinsamen Bildraum. Rap, Pause, reduzierte Bewegung und manuelle Kamera
behalten Vorrang. Der Lichtboden ergänzt einen begrenzten farbigen Lichtglanz.
Das ist eine stilisierte Lichtwirkung, keine physikalische Spiegelung.

„Showvideo aufnehmen“ öffnet die Browserauswahl für Bildschirmfreigabe. Für Bühne
und Lyrics gemeinsam den Konzert-Tab auswählen, anschließend die Steuerung mit
Escape schließen. Die Aufnahme bleibt beim Schließen der Steuerung aktiv und
endet beim Verlassen des Konzerts, über „Aufnahme stoppen“ oder die Browserfreigabe.
WebM wird lokal angeboten, ohne Ton, maximal zehn Minuten bzw. etwa 200 MB.
Unterstützt ein Browser Bildschirmaufnahme oder WebM nicht, wird dies angezeigt.

Neue lizenzierte Mixamo-Dateien sind nicht enthalten: Es liegen weiterhin keine
entsprechenden Quelldateien vor. Der bestehende Animationsimport bleibt verwendbar.

Die CI-Browserausführung schreibt nun einen fortlaufenden browser-console.log,
auch wenn ein Prozess endet oder sein Zeitbudget erreicht. Ein Timeout erzeugt
weiterhin einen Fehler. Das Gesamtbudget wurde für die gewachsene serielle
Desktop-/Touch-Suite auf 90 Minuten erweitert; einzelne Testlimits bleiben bestehen.
Die genaue Ursache des älteren Ubuntu-Fehlers ist mangels abrufbarer Logs weiterhin
nicht abschließend bestätigt. Diese Änderung verbessert Nachweis und Laufzeitbudget,
behauptet aber keinen bereits grünen Remote-Lauf.

Prüfungen: test:v1136 enthält Programmvalidierung, Kalibrierung und einen echten
Kindprozess-Test für erfolgreiche Ausgabe und erhaltene Ausgabe nach Timeout.
Die zwölf bestehenden Orchestrierungsprüfungen bleiben verpflichtend. Die ZIP
enthält keine Testberichte oder installierten Abhängigkeiten.
