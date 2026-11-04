# Sonic Display V195 — Music Structure Timeline Director

Adds an opt-in live timeline under **Character & Motion Library** for a selected avatar. Observations from the existing V194 drop estimator are published at a maximum of four events per second and aggregated into bounded in-memory segments. Each segment displays phase, active library motion and a transparent rule-based explanation (energy, kick, bass, anticipation). A low-energy verse frame is displayed as an estimated break; this is a display-only classifier and does not alter V194's dance phase or control playback. Nothing is persisted or sent to a server.

The timeline can only observe while its panel is open and enabled; it is **not** a full-song timeline or genuine look-ahead prediction. Spotify audio stream and precise future song structure are unavailable. Transitions and existing motions remain controlled by V194.

Test: `npm run test:structure-timeline`, `npm run check:syntax`. Install dependencies before `npm run typecheck && npm run build`.
