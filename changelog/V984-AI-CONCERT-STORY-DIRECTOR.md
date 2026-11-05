# V984 – AI Concert Story Director

- Neuer KI-gestützter, zusammenhängender Fünf-Akt-Regieentwurf nach V983 Song Intelligence.
- Drei Inszenierungen (filmisch, Festival, intim) mit wiederkehrenden Lichtmotiven,
  relativer Energiedramaturgie, Kameravorschlägen und virtuellen Szenenübergängen.
- Neue Song-Story-API mit begrenzten strukturierten Antworten, Opt-in,
  Session-/Origin-/Rate-Limits, ohne Gerätedaten oder Spotify-Schlüssel in der KI-Anfrage.
- Offline-Fallback mit reproduzierbarer Handlungskurve ohne OpenAI-Zugang.
- Übernahme ausschließlich auf bereits vorhandene und freigegebene virtuelle Looks;
  bestehende Undo-Funktion und reduzierte Bewegung bleiben berücksichtigt.
- Kein erfundener Beat-, Drop- oder Timelinenachweis und keine Hardwarebefehle.
- Regression `tests/v984-ai-concert-story-regression.cjs`, TypeScript-Konfiguration,
  CI-/Vercel-Gates und Dokumentation ergänzt.

**Hinweis:** Vollständiger TypeScript-Check und Next.js-Produktionsbuild müssen nach
`npm ci` mit kompatibler Node-Laufzeit vor einer Produktionsfreigabe grün sein.
