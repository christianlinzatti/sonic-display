# V425 – Expressive Rap Performance Director

Optionales, konservatives Ausdrucksprofil auf Basis ausdrücklich gespeicherter V416-Szenen. Es passt die bestehenden V368-Gesichts- und V371-Körperausdrucksstärken additiv und begrenzt an. Bestehende manuelle V385-Sängerzuordnung, pausierte Wiedergabe, reduzierte Bewegung sowie nicht zum aktuellen Song passende Daten sind geschützt.

Das neue Panel in den Anzeige-Einstellungen bietet eine separate Live-Aktivierung, Intensitätsregelung, lokale Scrub-Vorschau und Diagnose für Gesicht/Gesten/Kamera-Impuls. Die Anzeige des Kamera-Impulses ist **nur diagnostisch**; V425 überschreibt weder V295/V400-Kamera-Keyframes noch die vorhandenen automatischen Kameraregeln. Es handelt sich weder um Emotionserkennung noch um Sprechererkennung. Für die Showwirkung sind die vorhandenen V416-Szenen notwendig.

Prüfen: `npm run test:v425`, `npx tsc -p tests/tsconfig.v425-core.json`, danach bei vorhandenen Abhängigkeiten `npx tsc --noEmit` und `npm run build`.
