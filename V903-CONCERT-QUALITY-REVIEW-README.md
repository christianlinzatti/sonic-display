# V903 – Concert Quality Before/After Review

## Bedienung

1. Konzert mit aktivem V900, V826-Live-Telemetrie und verifiziertem Songabschnitt abspielen. Im LIVE-FX-Qualitätsdashboard einige aktuelle Messfenster abwarten.
2. Unter **V902 Automatic Concert Quality Advisor** einen begründeten Vorschlag auswählen und ihn ausdrücklich bestätigen.
3. Unter **V903 Concert Quality Before/After Review** beginnt die Nachmessung. Die ersten zwei neuen V826-Messfenster werden bewusst verworfen; die nächsten drei Fenster liefern – bei gleichbleibender Szene, Performance-Stufe und FPS-Ziel – einen transparenten, rein beobachtenden Vorher/Nachher-Vergleich.
4. Bei Bedarf **Rücksetzen prüfen** und danach **Jetzt ausdrücklich zurücksetzen** wählen. Das Rücksetzen funktioniert nur, solange der zuvor übernommene Wert unverändert aktiv und der betroffene Effekt eingeschaltet ist. Eine zwischenzeitliche manuelle Änderung wird nie überschrieben.
5. Der JSON-Export enthält nur Einstellung, Messfenster und Zahlenwerte, **keine Track-ID oder persönliche Historie**. Vergleiche werden nicht dauerhaft gespeichert.

## Interpretation

Die Werte stammen aus V826-Renderer-Frameabständen und enthalten FPS, Durchschnitts-Framezeit, den **Mittelwert der P95-Framezeiten pro V826-Messfenster** und FX-Druck. Sie messen keine GPU-Zeit, keine reale Sichtbarkeit der Lyrics oder der Tänzer und beweisen keine Kausalität. Ein vermeintlicher Gewinn kann durch variierende Szenenkomplexität, andere Prozesse oder thermische Effekte beeinflusst werden. Sind zu wenig Messungen vorhanden, pausiert die Show, ändert sich die Songszene oder wechselt die Performance-Stufe, wird ausdrücklich kein Vergleich ausgegeben.

V903 aktualisiert die Daten ausschließlich über die bereits vorhandene V826-Live-Subscription, ohne eigene RAFs, zusätzliche 3D-Objekte, Netzwerkanfragen, WebGL-Readbacks oder Timer. Die erfolgreiche isolierte Typprüfung ersetzt keinen vollständigen Produktionsbuild.
