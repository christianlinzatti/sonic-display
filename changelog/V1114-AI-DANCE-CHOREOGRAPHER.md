# V1114 · AI Dance Choreographer 4.0

- Vier Tanzstile und sieben dramaturgische Proben-Cues mit Solo, Duo, 2-Beat-Kanon und gemeinsamen Ensemble-Momenten.
- Drei feste Stage-Crew-Avatare, Clip-Vorschläge nur mit existierenden GLB-Animationsnamen.
- V1114 `story`-Modus im **realen** `sonicCrewDirector`: ruhige Clips für Intro/Break, Spotlight-Solos für Strophe, Kanon für Hook und Unisono für Drop. Verwendet nur die bereits verfügbaren Songabschnittssignale und bereits geladene Clips.
- Explizite, getrennte Zustimmung für Stage-Crew-Automatik und V1040-Showplan; Rückgängig mit Konfliktschutz; kein automatischer Geräte-/Mikrofon-/Cloud-Zugriff.
- Manuelle Bewegungen, Wiedergabepausen, Clip-Fehler und Reduced Motion behalten Vorrang.
- Rückwärtskompatible Tests für V1106–V1113; V1106-Typprüfung isoliert gegen fehlende Umgebungs-@types, V1109-Integrationstest aktualisiert für den bestehenden V1114-Vorschaupfad.
- 576 neue Kombinationen aus Genre, Choreografiestil, Performance-Regie und Intensitätsobergrenze. Zusätzliche Browser-Tests für Probe, separate Crew-Aktivierung und Undo.
- Technische Grenze: Probenpartitur ist nicht identisch mit einer individuell gespeicherten Clip-Timeline, die Echtzeitsteuerung folgt vorhandenen Abschnitts- und Clipdaten.
