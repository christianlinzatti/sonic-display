# V1052 – Ultimate Live Concert Experience

## Neue Funktionen
- Eine gemeinsame lokale Konzertpartitur koordiniert die vorhandenen 360°-Bühnen-, Publikums-, Kamera- und Avatar-Systeme.
- Der songabhängige Fokus wechselt zwischen Bühnenbild, Zuschauern, Kamera und Ensemble. Bestehende sieben Showabschnitte bleiben unverändert.
- Sanfter gemeinsamer Fokuswechsel beim Szenenübergang, eine bewusst ruhigere Atempause und ein abklingender Schluss nach dem Finale.
- Die V1052-Regie verwendet ausschließlich absenkende, begrenzte Verstärkungsfaktoren (keine Überschreitung manueller Intensitäten).
- Die bestehende V1051-Publikumsregie und V1044-Handylichtsteuerung folgen optional derselben Partitur; V1043-Kamera und V1041-Choreografie nur, wenn jeweils separat freigegeben.
- Keine eigenen 3D-Systeme, Beats, künstliche Drop-Ereignisse, Kamera-Owner, Avatar-Mixer, Govee-LAN-Befehle oder Cloud-Anfragen.
- Bei Pause, nicht-360°-Bühne, ungültiger Trackposition, reduzierter Bewegung oder niedrigem Grafikprofil inaktiv. Standardmäßig deaktiviert, Regie-Zusammenarbeit 0–80 %.

## Qualität
- Test für alle sieben Kapitel, deterministische Songvarianten, weiche Übergänge, Ruhe-/Finale-Akzente, Edit-Schutz, Tier- und Bewegungsgrenzen sowie vollständige UI-Verkabelung.
- Isolierte strenge TypeScript-Prüfung; V1052 zu bestehenden Produktions- und Vercel-Regressionsprüfungen hinzugefügt.
- Der vollständige Next.js-Produktionsbuild benötigt die im CI installierten Abhängigkeiten und ist hier separat zu validieren.
