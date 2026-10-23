# Sonic Display V81 – 3D Word Karaoke

- Im Avatar-Visualizer und bei aktivierten Immersive 3D Lyrics wird jedes Wort als separates drei-dimensionales Textobjekt gerendert.
- Wenn echte Wort-Zeitstempel vorhanden sind, leuchten die Wörter entsprechend ihrer Start-/Endzeit. Sonst wird innerhalb der Zeile geschätzt.
- Aktive Wörter wechseln die Farbe und vergrößern sich subtil. `Reduced motion` deaktiviert die Skalierung.
- Vorherige und folgende Textzeile bleiben sichtbar. In anderen Visualizern wird der bestehende CSS-Fallback verwendet.
- Der bestehende Lyrics-Studio-Regler für Intensität steuert auch die 3D-Wortbewegung.

Hinweis: Die Positionierung nutzt geschätzte Glyphenbreiten und ist daher nicht pixelgenau. Ein vollständiger Next.js-Build wurde nicht durchgeführt.
