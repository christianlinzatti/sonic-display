## V1063 · Ensemble Choreography 4.0

Optionale lokale Ensemble-Regie für die bestehende 360°-Bühne. Sie ergänzt automatische Gruppenformationen (2–4 Avatare) um sehr kleine Fächer-, Bogen- und diagonale Versätze und einen optisch wechselnden Ensemble-Blickfokus. **Kein physischer Partner-Platztausch, keine neuen Singer-Zuordnungen oder erkannten Beats.** Die bestehende Animations-, Fußkontakt- und Kollisionsregie behält Vorrang; manuelle Shows, niedrige GPU-Stufe, Pausen und Reduced Motion deaktivieren den Zusatz. Nutzt einen vorhandenen gemeinsamen Frame-Loop; keine neue Netzwerk-/Govee-Aktion. Die Funktion muss unter **AI Show Designer → V1063 Ensemble Choreography 4.0** aktiviert werden.

Qualitätsprüfungen: `npm run test:v1063`, `npm run test:v1063:types`, `npm run verify:v1063:focused`, `node scripts/v959-source-preflight.cjs`. Vollständiger Next.js-/Playwright-Build über GitHub Actions nach Import.

