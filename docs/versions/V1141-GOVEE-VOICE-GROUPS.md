# V1141 · Einzelne Govee-Leuchten und Lichtgruppen per Alexa

## Sprachbefehle

- Alexa, sage Sonic Display, schalte Govee Lampe 1 ein.
- Alexa, sage Sonic Display, schalte Govee Lampe 2 aus.
- Alexa, sage Sonic Display, schalte Govee Bühne ein.
- Alexa, sage Sonic Display, schalte Govee Ambient aus.

Die Zahlen 1–4 entsprechen **der Reihenfolge der bereits ausgewählten Govee-Geräte** unter Einstellungen → Govee. Gruppen verwenden entweder aktive V915-Gruppen mit zugewiesener Lichtrolle (Bühne/wall, Rhythmus, Neon, Ambient) oder die einzelne Geräte-Lichtrolle. Nur freigegebene, ausgewählte private LAN-IP-Adressen werden angesteuert; Alexa darf niemals Geräte-IP-Adressen oder Gruppenschlüssel frei bestimmen.

Neue Skill-Intents/Slots stehen in `integrations/alexa/interaction-model.de-DE.json`. Nach GitHub-Push das Modell in der Alexa Developer Console neu importieren/builden und die aktualisierte `integrations/alexa/voice-v1008.cjs` in Lambda veröffentlichen.
