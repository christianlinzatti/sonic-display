# V535 – Intelligent Motion Library 2.0

## Ziel

Die Motion-Bibliothek soll mit später ergänzten GLB-Animationen wachsen, ohne das Erscheinungsbild der fünf Sonic-Avatare oder die bestehenden manuellen Choreografien zu verändern.

## Funktionen

- Im vorhandenen **Character & Motion Library**-Panel: Filter nach Name/Kategorie, Favoriten, manuell änderbare Bewegungskategorien und nach Favoriten sortierte Ergebnisse.
- **Eingebettete Avatar-Clips** aus der vollständigen Avatar-GLB oder der V531-Shared-Motion-Quelle auf Knopfdruck auflisten; bis zu 64 sichtbare Clips pro Quelle. Auswahl einer eingebetteten Animation startet denselben vorhandenen 3D-Viewer mit `selectedEmbeddedClipIndex`; keine separate Animation in die GLB schreiben.
- Favoriten und Kategorieänderungen für die eingebetteten Clips sind an Avatar-URL und Clipindex gebunden und werden lokal im Browser gespeichert. Änderungen greifen nicht in den laufenden V530-Hybrid-Motion-Director oder die Karaoke-/Lip-Sync-Regie ein.
- Beim Import **separater Motion-GLBs** erzeugt V535 einen SHA-256-Fingerabdruck über die tatsächlichen Track-Pfade, Interpolationen, Keyframe-Zeiten und -Werte, nicht über Dateiname oder Clipname. Gleiche Namen mit unterschiedlichen Keyframes werden akzeptiert. Nur exakt gleiche Keyframe-Fingerabdrücke **für denselben Avatar** überspringen den erneuten Upload. Originaldateien, die GLB-Motion-Bibliothek und bereits ausgewählte aktive Motions bleiben intakt.
- Für alte Einzelclip-Bibliothekseinträge ohne Fingerabdruck: auf ausdrücklichen Klick höchstens 24 GLBs seriell prüfen. Mehrfachclip-Quellen, nicht erreichbare Dateien, Dateien mit beschädigten Tracks und Clips über dem Rechenbudget werden **nicht als Dubletten angenommen**. Der Prüfdurchlauf lädt ohne Hintergrund-Scan.
- Kategorisierung ist regelbasiert (z. B. Idle, Rap, Tanz, energetisch, Gesten, Fortbewegung, Sonstige), mit manueller Korrektur. Das ist weder ML-Klassifikation noch ein Versprechen, dass Clipnamen den Tanzstil korrekt ausdrücken.
- `characterMotionLibrary.ts` ergänzt optionale, sanitisierte Metadaten zu Version 1; frühere Einträge und `chooseCharacterMotion` funktionieren weiterhin. Separate Motion-Bibliothek bleibt auf 250 Einträge begrenzt.

## Grenzen / Qualität

SHA-256-Gleichheit beweist Datenidentität **nur der Animationskurven**, nicht gleiche Meshes, Skins, Ruheposen oder schöne Wiedergabe. Deshalb wird nie über verschiedene Avatar-IDs hinweg automatisch dedupliziert; die V531-Rigprüfung für den *Charakter*-Import bleibt davon unabhängig. Unbekannte oder nicht prüfbare Clips werden normal importiert. Die manuelle 3D-Vorschau ist weiterhin maßgeblich. Keine automatische Qualitätsfreigabe und kein generelles Retargeting fremder Skelette.

## Tests

`npm run test:v535 && npm run test:v535:types && npm run check:syntax && npm run check:architecture`. Die V535-Regressionen vergleichen unterschiedliche Kurven trotz gleichem Namen, identische Kurven trotz anderem Namen, Interpolation und Zielbone, sichere Altmetadaten, Favoriten und Filter und prüfen die Clipnamen aller fünf realen GLBs. Ältere Regressionen bleiben Teil des Build-Preflights.

Der vollständige Next.js-Produktionsbuild und ein gerenderter Pi-/WebGL-Sichtvergleich erfordern eine lokale Umgebung mit installierten Node-Abhängigkeiten. Die fünf vom Nutzer bereitgestellten GLBs werden nicht automatisch in das Projektarchiv aufgenommen.
