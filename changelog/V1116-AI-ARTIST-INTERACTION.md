# V1116 – AI Artist Interaction

- Vier lokale Interaktionsstile: Dialog, Duo, Rap-Battle und Festival-Call-and-Response.
- Sieben handlungsbezogene Regieszenen für Neon Pulse, Festival Nova und Chrome Beat: Lead-Wechsel, Partnerantworten, ruhige Momente und Gruppenfinale.
- Echte vorhandene Kameramodi (`wide`, `lead`, `orbit`, `group`) verändern nach ausdrücklicher Bestätigung nur die V1040-Vorschau; Dauer, Zeitmarken, Laser, Plattformen und Tanzmodus bleiben erhalten.
- Zusätzlicher gesonderter Opt-in nutzt den vorhandenen V1079-Live-Artist-Interaction-Modus für Partnerakzente an echten synchronisierten Lyrics-Pausen. Konfigurations-Rücknahme ist konfliktgeschützt.
- Keine erfundenen Stimmen, Sprecher-/Singer-Erkennung, keine automatische physische Blicksteuerung, keine neuen GLB-Clips, keine externen KI- oder Geräteaufrufe.
- Regressionen: `npm run test:v1116`, `npm run test:v1116:types`, CI Desktop/Touch Playwright `tests/e2e/ai-artist-interaction-v1116.spec.cjs`.
