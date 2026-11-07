# V1062 · Advanced Rap Performance 7.0

## V1062 · Advanced Rap Performance 7.0

Die optionale **Advanced Rap Performance 7.0** erweitert bestehende, bereits verifizierte Rap-Wort-Cues. Sie verfeinert bei GLB-Avataren gestische Betonungen von Kopf, Brust und Armen mit weicher Einschwing-/Ausblendkurve; vorhandene V515-Korrekturen und Clip-/IK-Priorität bleiben erhalten. Der vorhandene V837-Lip-Sync gewinnt winzige additive Rate-Anpassungen für Kiefer, `wide` und `round` sowie minimale Augenbrauen-/Wangenakzente. **Keine** Änderung an `lipsClosed`, manuell gesetzten Visemen, morph targets, Lippen-Quellinformationen, Sängerrollen oder Fußkontakten. Nur bei beobachteten synchronisierten Wörtern, verifiziertem Slot, laufendem Deutschrap/Rap und ausreichender GPU-Qualität aktiv. Die Funktion ist im **AI Show Designer → V1062 Advanced Rap Performance 7.0** abschaltbar und standardmäßig deaktiviert. Keine neuen Ticker, Audio-Abfragen, KI-Dienste, Kameras oder Gerätebefehle.

Qualitätsprüfungen: `npm run test:v1062`, `npm run test:v1062:types`, `npm run verify:v1062:focused`, `node scripts/v959-source-preflight.cjs`. Produktionsfreigabe weiterhin über GitHub Actions (Windows/Ubuntu, Next.js/Playwright).

