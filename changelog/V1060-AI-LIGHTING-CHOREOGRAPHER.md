# V1060 · AI Lighting Choreographer

## Neue Funktion

- Eine gemeinsame, lokale und **regelbasierte** Konzertlichtregie koordiniert vier bereits vorhandene opt-in-Effekte: V1056 Verfolger-Spots, V1057 Laser, V1058 Nebel/Lichtkegel und V1059 LED-Ring.
- Sieben Showkapitel priorisieren die jeweiligen Systeme unterschiedlich: Fokus auf die Sänger in der Strophe, Laser im Aufbau, LED-Wand in der Hook, Lichtatmosphäre im Zwischenspiel und abgestimmtes Finale.
- Sanfte Übergänge orientieren sich am bereits bestätigten Songfortschritt. Es werden keine eigenen Songabschnitte, Beats, Tropfen oder Sängerrollen erkannt oder erfunden.
- **Nur optische Absenkung:** V1060 erhöht keinen bestehenden Licht-/Laser-/Nebel-/LED-Wert über seine Ausgangsgrenze und schaltet keine manuell deaktivierten Funktionen ein.
- Unveränderte Bedienregeln: Manuelle Laser-/LED-Muster, Lampenabschaltung, Reduced Motion und Low-GPU-Preset haben Vorrang.
- Keine neuen 3D-Objekte, echten Lampen, Govee-Kommandos, Netzwerkaufrufe, Ticker oder Cloud-KI-Abfragen.

## Aktivierung

1. AI Show Designer öffnen, eine gültige Show erzeugen und live aktivieren.
2. Unter V1056 bis V1059 die gewünschten visuellen Effekte einzeln aktivieren.
3. Unter **V1060 · AI Lighting Choreographer** die Koordination einschalten und die Stärke wählen.

## Prüfung

- `npm run test:v1060`
- `npm run test:v1060:types`
- `npm run verify:v1060:focused`
- `node scripts/v959-source-preflight.cjs`

Die vollständige Produktions-/Playwright-Zertifizierung erfolgt nach ZIP-Import über die GitHub-Actions-Matrix auf Windows und Ubuntu.
