# V235 – Adaptive Choreography Memory 2.0

Opt-in lokale Kontextdatenbank mit Genre/Tempo-Band/Musikphase und begrenzter Historie. Beobachtung erfolgt nur auf Phasenwechsel, nicht jedes Frame. Manuelle Phasenzuordnung hat weiterhin Vorrang, vorhandene V196-Lernwerte sind Fallback.

Im Adaptive Choreography Timeline Panel: Kontext-Auswahl und Lernen getrennt aktivieren. Wiederholungen können vermieden, Lernwerte pro Avatar gelöscht werden. Speicherung im Browser-localStorage (keine Audioinhalte). Für vorhandene Live-Motions werden die verwendeten Genres berücksichtigt; BPM=0 steht für unbekannt, da die bisherige Phase-Beobachtung kein zuverlässiges BPM liefert. Das Tempo-Banding kann von späteren Player-Integrationen befüllt werden. Das System bewertet Nutzungs-Häufigkeit und Wiederholungsabstand und besitzt keine objektive Choreografie-Qualitätsmessung.
