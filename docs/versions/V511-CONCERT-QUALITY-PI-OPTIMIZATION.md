# Sonic Display V511 – Concert Quality & Raspberry Pi Optimization

## Implementiert

- Read-only V511-Diagnosekarte im existierenden 3D-Renderdiagnose-Bereich (unterhalb V480): Quelle sind die *tatsächlich* aus V508 berechneten animierten Knochenkapseln der Duett- und 3-/4er-Gruppenszene.
- Berichte: Zahl der überprüften Paarungen, potenziell enge Kapselpaare, stärkste automatische Gestendämpfung, Näherungsabstand, GLB-Abtastrate und aktives Pi-Budget.
- Explizite Zustände für unvollständige oder veraltete Knochenmessungen, inklusive Abdeckung aller Avatar-Paare. **Keine Behauptung echter Skinned-Mesh- oder Handkollisionen.**
- Maximal 45 flüchtige Sitzungsmessungen; Ausgabe höchstens einmal pro Sekunde; durch Anwender löschbar. Keine neuen Render-Loops, Webworker, npm-Abhängigkeiten, Serverübertragung oder persistente Speicherung.
- Adaptive Abtastraten *nur* der V508-Nebenprüfung bei aktiviertem V479-Pi-Budget und mindestens drei Avataren: Balanced 6 Hz, Eco 4 Hz. Ohne aktives Pi-Profil 12/7 Hz, Grafikstufe Low bleibt aus. Keine Veränderung von manuellen Presets.

## Verbindliche Schutzgrenzen

Die V508-Risikowerte bremsen lediglich automatische Zusatzgesten, V506 führt weiter den räumlichen Abstandsschutz, V494 bleibt allein für Root-Korrekturen zuständig. Die neue Diagnose greift nicht in Mund/Lippen, Sängerzuweisungen, Wortzeitpunkte, GLB-Clips, Fußkontakt, V509-Choreografie oder WebGL ein. Die Drosselung ist **kein** Ersatz für visuellen Praxistest auf echter Raspberry-Pi-Hardware.

## Prüfung

`npm run test:v511`, `npm run test:v511:types`, historische Versionstests und `npm run check:syntax`, `npm run check:architecture`. Vollständiger `npm run build` benötigt installierte Projektabhängigkeiten.
