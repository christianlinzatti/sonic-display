# V294 – Motion Timeline Camera Editor

Aufbauend auf V293: Seekbare Motion-Timeline direkt im visuellen Kameraeditor. Slider, Start-Button, Pausieren/Pose einfrieren und Einzelbildschritte (1/30 s). Die Animation wird ausschließlich auf der geklonten Avatar-Szene abgespielt. `AnimationMixer.setTime` setzt den Zeitpunkt einmal pro Nutzerinteraktion; ein Änderungszähler verhindert das wiederholte Zurücksetzen während des Abspielens. Fortschrittsanzeigen werden höchstens rund 8-mal pro Sekunde aktualisiert.

Kameraposition speichern wie bisher mit „Perspektive speichern“. Der gewählte Motion-Zeitpunkt selbst wird nicht im Kamera-Preset gespeichert, sondern dient zur visuellen Ausrichtung.

Tests: `npm run test:v294`, `npm run verify:offline`. Vollständiger Build: `npm run build` mit installierten Abhängigkeiten.
