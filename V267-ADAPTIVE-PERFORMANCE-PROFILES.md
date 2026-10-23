# V267 – Adaptive Performance Profile Manager

Aufbauend auf V266 können fertig gemessene Performance-Experimente ausdrücklich als **lokale gerätespezifische Profile** gespeichert werden. Die Gerätekennung nutzt den vorhandenen `currentDeviceFingerprint` (Plattform, CPU-Kerne, verfügbare Browser-Angaben, Bildschirm und DPR). Bis zu 30 Profile werden im lokalen Browser-Speicher gespeichert und auf Eingabevalidität geprüft. Die Empfehlung zeigt nur passende Geräteprofile und bevorzugt den höchsten heuristischen Mess-Score. Eine Profilübernahme benötigt eine Vorschau und einen bestätigenden Klick; sie verändert nur Rendering-Modus und Multi-Avatar-Director, nicht Avatare oder Choreografie. Rückgängig ist möglich. Geräteübergreifende Synchronisierung und automatische Anwendung finden nicht statt.

Prüfung: `npm run test:v267`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
