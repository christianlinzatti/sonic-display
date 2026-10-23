# Sonic Display V296 – Live Camera Keyframes

Die V295-Kamerafahrten können jetzt optional die echte Three.js-Kamera der Live-Bühne steuern.

- Unter **Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director** die neue Live-Option aktivieren.
- **Eigene Kamerapresets verwenden**, **Smart Stage Director** und **Echte 3D-Kamerafahrten** müssen ebenfalls aktiv sein.
- Für Verse, Break, Build, Hook und Drop ein Preset zuweisen, das Keyframes enthält.
- Die Keyframe-Interpolation nutzt die Spotify-Songposition in Sekunden und wiederholt sich nach dem letzten Keyframe. Song-Sprünge bleiben deterministisch.
- Presets ohne Keyframes fallen automatisch auf die bisherige V290-Pose bzw. V289-Regie zurück.
- Pausieren und Reduced Motion deaktivieren die Fahrt wie zuvor. Die neue Funktion ist standardmäßig aus.
- Kein zweites Canvas, kein React-State-Update pro Frame; Änderungen an Presets/Keyframes werden per Events nachgeladen.

Die Fahrten sind an die Songposition gekoppelt, nicht an eine exakte Takt- oder Animations-Phase. Dadurch können Abspieltempo und Animation unterschiedlich ausfallen.
