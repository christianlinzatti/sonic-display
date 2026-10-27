# V521 – Smart Concert Quality Presets & Benchmark Comparison

## Zweck
Drei transparente Konzertvorschauen: **Bildqualität** (High, Empfehlung 2 Tänzer), **Vier-Avatar-Balance** (Balanced, Empfehlung 4 Tänzer), **Leistungsreserve** (Low, Empfehlung 4 Tänzer). Keine behaupteten FPS-Einsparungen und keine automatische Umschaltung von Bühnenbesetzung, Licht oder Lyrics.

## Funktion
Im **3D-Renderdiagnose → Raspberry Pi Concert Performance Studio → V520** steht jetzt die V521-Profilvorschau. Diese zeigt Qualitätsstufe, empfohlene Gruppengröße, geschützte Funktionen und ausschließlich **tatsächlich aufgenommene** Messwerte bei passender Stufe, Avatarzahl und eingeschaltetem Lyrics-/Lip-Sync. Fehlende Profile sind ausdrücklich „nicht gemessen“. Paarvergleich gibt reale FPS- und P95-Änderungen aus, nie Prognosen oder garantierte Gewinne.

**Testen:** Ein Profil wählen, denselben Songabschnitt als gültige Referenz mit mindestens sechs stabilen Ein-Sekunden-Messfenstern aufnehmen. Wenn die V519-Empfehlung eine einzelne Qualitätsstufe **High → Balanced** oder **Balanced → Low** freigibt und alle V520-Schutzbedingungen zutreffen, das Profil ausdrücklich über V520 testen. Anschließend erneut messen und entscheiden, ob die Qualitätsänderung behalten oder rückgängig gemacht wird. **High-Aufstufungen, Sprünge über mehrere Stufen, Avataranzahl, Licht und Pi-Budget werden nicht automatisch gesetzt**; bestehende Einstellungen bleiben zuständig.

## Schutz und Grenzen
Die V520-Sitzungswiederaufnahme, aktuelle Messdaten, manuelle Pi-/Auto-Sperren und Rollback-Eigentümerprüfung bleiben unverändert. V521 hat keine WebGL- oder Frame-Schleife, speichert keine neuen Einstellungen und verändert weder importierte GLB-Motions, Deutschrap-Lip-Sync, Lyrics, Fuß-IK noch Choreografien. Messungen können durch Songabschnitte, Szene, Browser, Gerätetemperatur und Hintergrundlast beeinflusst sein; die Browserdiagnose erfasst keine Pi-Temperatur, GPU-Zeit oder gesamten RAM.

## Prüfungen
`npm run test:v521` und `npm run test:v521:types`, ältere V520-Regressionsreihe und Architektur/Syntax. Vollständiger Next.js-Build nur bei installierten npm-Abhängigkeiten.
