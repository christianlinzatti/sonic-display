# Sonic Display V85 – Performance-Profile

- Settings → Diagnose → 3D-Performance-Benchmark → Performance-Profile.
- Geräteprofile speichern, benennen, anwenden oder löschen.
- Abgeschlossenen Benchmark als Profil mit FPS, Frame-Zeit und langsamen Frames speichern.
- Optional beim Laden automatisch das zuletzt gespeicherte Profil des aktuellen Browsers/Bildschirms anwenden.
- Profile liegen ausschließlich in `localStorage` des jeweiligen Browsers, nicht in Vercel Blob. Dies ist keine geräteübergreifende Synchronisation.
- Eine abweichende Bildschirmauflösung oder ein anderer Browser kann zu einer anderen Gerätekennung führen.
- Die Benchmark-Messung verändert nur die Qualitätsstufe und stellt den bisherigen Modus wieder her.
