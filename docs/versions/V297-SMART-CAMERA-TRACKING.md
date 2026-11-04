# Sonic Display V297 – Smart Camera Tracking

- Optionales avatarbasiertes Nachführen der bestehenden Three.js-Kamera (standardmäßig AUS).
- Ermittelt alle 200 ms die echten animierten Bounds der Avatargruppe via Three.js Box3.setFromObject(..., true), auch bei Duo.
- FOV- und Aspect-basierter Sicherheitsabstand mit sanfter Kamerainterpolation; kein React-Update pro Frame.
- Live-Keyframes aus V296 bleiben primäre Kameraregieführung, Tracking ergänzt erforderliche Bildreserve.
- Deaktiviert bei Pause/Reduced Motion. Unter Camera Preset Studio einschaltbar.
- Hinweis: Kameraentfernung hängt vom jeweiligen Modell und dessen Bewegung ab. Ein absoluter Sichtbarkeitsnachweis in allen Szenen ist nicht möglich.

Test: `npm run verify:offline`; vollständiger Build: `npm install && npm run build`.
