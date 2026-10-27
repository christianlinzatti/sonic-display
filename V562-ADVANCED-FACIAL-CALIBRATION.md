# Sonic Display V562 – Advanced Facial Calibration (25.10.2026)

## Ziel und Umsetzung

Auf Basis von V561 unterstützt die gleiche `VocalRigV368`-Engine jetzt eine **optionale, je GLB-Avatar gespeicherte** Mundkalibrierung. V562 ersetzt keine Gesichtserkennung und keine Phonem-Timestamps; sie limitiert nur die durch bestehende Lyrics-/Vokal-Pipeline erzeugten Posen.

- `advancedFacialCalibrationV562.ts`: pure, deterministische Kalibrierung (Kiefer-Maximum, Lippenschluss bei bilabialen Formen, Reduktion überlappender breiter/runder Vokale), Eingaben gegen NaN/Infinity geschützt und begrenzt. Der deaktivierte Zustand ist eine vollständige No-op-Rückgabe.
- `facialRigStudioV370.ts`: optionales Feld `mouthCalibrationV562` innerhalb von `FacialProfileV370`, gespeichert unter der stabilen Avatar-ID in `avatarFacialProfilesV370`. Presets Neutral, Deutschrap und Gesang; gesonderte Regler für die drei Parameter. Keine stillen Änderungen; manuelle Morph-Mappings und Geometrie-Gains aus V424 bleiben erhalten.
- `VocalRigV368.tsx`: die bisherige Gesichtsberechnung und Glättung bleiben bestehen. Post-Kalibrierung auf den resultierenden Mundkanälen; zusätzlich greift bei Kiefer-Morph oder Kiefer-Bone das Maximalmaß **auch nach** etwaigen alten Gains über 100%. Gezielter Einzel-Morph-Test (V383) ist ausdrücklich ausgenommen.
- `StagePreviewModal.tsx`: echter V561-GLB bleibt Grundlage. V562 lässt sich für den Vergleich *nur temporär in der Vorschau* deaktivieren, ohne gespeicherte Profile zu ändern. Mundkanal-Abdeckung wird angezeigt; fehlende Morphs werden nicht erfunden.
- `advancedFacialRigV383.ts`: bestehender JSON-Export/Import wird abwärtskompatibel um das opt-in V562-Feld erweitert, ungültige Strukturen werden abgelehnt, Zahlen aus externer JSON werden normiert.

## Bedienung

1. **Einstellungen → Gesichtsanimation Studio** öffnen, GLB auswählen und geeignete Morph-Zuordnungen prüfen. Falls ein Mundkanal fehlt, ggf. *manuell* einem passenden Morph zuweisen.
2. Unter **V562 · Präzisere Mundform-Kalibrierung** zunächst eines der Presets wählen, dann mit den drei Reglern anpassen. Presets aktivieren die Korrektur; sie verändern nicht die alten V424-Gains.
3. Unter **Einstellungen → Konzert-Bühneneffekte → 3D-Effekte & GLB-Lip-Sync kalibrieren** den echten GLB und die Gesichtsnähe aktivieren, Deutschrap-/Gesangs-Demo auswählen und mit **V562-Kalibrierung an/aus** vergleichen. Beim aktuellen Song sind weiterhin *nur vorhandene* echte synchronisierte Lyrics nutzbar.
4. Jederzeit im Studio deaktivieren (V561-Verhalten) oder einzelne Regler erneut anpassen.

## Grenzen und Tests

Keine tatsächlichen Phoneme, keine Stimmtrennung, keine physikalische Kollisionssimulation von Lippen und Zähnen, keine automatisch bestätigte anatomische Qualitätsverbesserung. Transparente/komplexe Rigs, GLBs mit anderen Morph-Benennungen und Geräte-FPS müssen im Browser geprüft werden. Kein zusätzlicher Shader, keine Schattenkarte, keine GPU-Lichtquelle; die aktive Kalibrierung führt einige einfache Rechenoperationen je Frame aus.

`npm run test:v562` prüft Grenzfälle und Codeintegrationen; `npm run test:v562:types` prüft pure Typen; `npm run verify:v562` führt ältere Regressionen inklusive Syntax und Architektur aus. Ein vollständiger `next build` und reale WebGL-/Raspberry-Pi-Hardwaretests sind in dieser Umgebung ohne Projektabhängigkeiten nicht validiert.
