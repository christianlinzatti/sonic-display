# V1115 – AI Vocal Acting & Lip-Sync Intelligence

- **Vocal-Regiepartitur:** sieben Songphasen, drei Bühnenkünstler, Rap-/Gesangs-/Hybrid-Stile. Pro Künstler Rollen, Bewegungsabsichten und Ausdrucksintensität; keine unbewiesene Sängerzuordnung.
- **Vocal-Auftritt:** Duo- und Antwortmomente, Atempause, gemeinsam inszeniertes Finale. Bestehende V1113-/V1114-Timeline und Stage-Crew-Cues werden schreibgeschützt verwendet.
- **Opt-in:** Separater Button aktiviert *vorhandene* Lyrics-Lip-Sync-, Gestik- und Mimik-Einstellungen (V368/V371/V372), nur auf ausdrücklichen Klick, innerhalb konservativer Grenzen. Konfliktsicheres Rückgängig; Reduzierte Bewegung blockiert diesen Schritt.
- **Wichtige Grenze:** Die mitgelieferten drei Stage-Crew-GLBs haben weder Jaw-Bone noch Mund-Morph-Targets, weshalb keine echte gesprochene Phonem-Mundform erzeugt wird. Die vorhandene Avatar-Rig-Engine arbeitet bei kompatiblen Modellen wie zuvor.
- **Keine** neuen Voice-to-Text-, Sänger-, Lyrics-, Stimm-/Visemenerkennungs-, Geräte-, Netzwerk- oder Mikrofonberechtigungen; unveränderte manuelle Sängerzuordnungen und Clips.
- **Tests:** `npm run test:v1115`, `npm run test:v1115:types`, `node scripts/v959-source-preflight.cjs`; Playwright `tests/e2e/ai-vocal-acting-v1115.spec.cjs`. Volle Produktionstests in GitHub Actions nach Import.
