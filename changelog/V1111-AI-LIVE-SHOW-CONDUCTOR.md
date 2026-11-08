# V1111 · AI Live Show Conductor

- Ein lokaler, deterministischer Regiekoordinator verbindet Kamera, Gruppen- und Lead-Tanz, 360°-Bühnenform, Schwebebühnen und Laserlooks pro Szene.
- Drei Stile: cinematic, festival, balanced; wahlweise Überraschungskamera vor dem Finale.
- Eine V1111-Probepartitur mit 7 synchronisierten Regie-Cues und expliziter Qualitätsvorschau.
- Virtuelle Probenposition (Slider); optionaler, expliziter Follow-Modus für die tatsächlich gemeldete Spotify-Songposition. Keine Befehle über den Probenregler.
- Die vorhandene V1040-Showplan-Aktivierung und der V1106-Übernehmen-/Rückgängig-Pfad bleiben unverändert.
- Bestehende V1109-Story- und V1110-Drop-Entwürfe lassen sich kombinieren, aber befehlen keine realen Lichter oder Geräte.
- Strenge Typen, Intensitätsobergrenze (30–85%), maximal 45 Punkte Sprung, Ruhephase, Finale und exakte Songgrenzen.
- Kein automatisches Hochladen von Audio/Lyrics, keine neue Govee-/Strobo-/Pyro-Anbindung.
- Tests: `npm run test:v1111`, `npm run test:v1111:types`, GitHub Actions Produktionsbuild + Playwright.
