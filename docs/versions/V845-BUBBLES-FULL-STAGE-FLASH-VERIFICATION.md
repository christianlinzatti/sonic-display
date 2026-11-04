# V845 – Seifenblasen und Full-Stage-Flash

Aufbauend auf Sonic Display V844: V845 integriert zwei eigenständige Bühnen-Effekte. Um kompatibel zu bestehenden Ganzzahl-Versionstests zu bleiben, trägt dieses Update die Release-Version `0.1.0-v845`; interne V844.1-Dateinamen benennen die unmittelbar nach V844 entwickelte Zusatzfunktion.

## Umgesetzt

- **Seifenblasen**: eigenständige, irisierende Shader-Ringe, schwebend mit Drift und verschiedenen Größen, getrennt von der Schaumkanone. Ein Mesh mit maximal 64 GPU-Instanzen, keine Schattentexturen oder neue Render-Pässe. Dezente, mittlere und Festival-Variante; reduzierte Anzahl bei hoher Besetzung, Lyrics-Fokus und eingeschränktem Effektbudget. Bei CO₂-Emission kein zweiter starker Effekt.
- **Full-Stage-Flash**: eine kameraorientierte, kurz sichtbare, halbtransparente Ebene, die das **3D-Bühnen-Canvas** aufhellt (auch Avatare innerhalb des Canvas), aber keine HTML-Steuerung oder Lyrics-UI überlagert. **Standardmäßig AUS**, nur nach explizitem Opt-in. Begrenzt auf höchstens 0,16 Deckkraft, 35 Millisekunden und zwei Impulse pro Sekunde; Standardfrequenz 0,5 Hz.
- Beide Regien benötigen bestätigte Musikwiedergabe und beachten `reducedMotion`, manuelle Lichtregie, Blackouts, Songabschnitte, Abspielstatus und bestehende V823-/V825-Performancegrenzen. Ein aktivierter Full-Stage-Flash unterdrückt das frühere V844-Bodenstrobo (kein Stapeln mehrerer Blitzarten). Bei Lyrics- oder Gesangsfokus sowie Ensembles mit mehr als zwei Performern bleibt der Flash aus.
- Neue Einstellungen sind im **Concert FX Studio → V844.1** verfügbar und werden über die zentrale V810-Einstellungsnormalisierung gesichert.

**Warnung:** Begrenzte Blitze sind nicht generell ungefährlich für fotosensible Personen. Eine persönliche, medizinische oder normierte Sicherheitsfreigabe wird nicht behauptet.

## Verifizierter Status

| Prüfung | Ergebnis |
|---|---|
| 111 neue V845-Bubble-/Flash-Tests | PASS |
| Historische V800–V844-Regressionen | PASS 45/45 |
| Gezielte V793, V810, V816, V817, V823, V825, V829, V831, V838, V841, V843, V844 | PASS |
| Isolierte TypeScript-Kompilierung V845 und V844 | PASS |
| Syntax | PASS – 1.220 TS/TSX-Quellen |
| Architektur | PASS – 938 Referenzen |
| Windows/Linux Dateinamen | PASS – 2.071 Module |
| Paketversion und Lockfile | PASS – 0.1.0-v845 |
| Vollständiger TypeScript-Check | OFFEN – 20-Sekunden-Limit erreicht, kein verwertbares Gesamtergebnis |
| Next.js-Produktionsbuild | BLOCKIERT – lokale Projekt-Abhängigkeiten fehlen |
| Browser-, GLB- und GPU-Abnahme | NICHT AUSGEFÜHRT |
| GitHub Actions | Workflow vorhanden, hier nicht ausgeführt |

**Keine Produktionsfreigabe** ohne `npm ci`, vollständigen TypeScript-Check, Next.js-Build, reale Konzertmessungen und visuelle Prüfung. Bericht auch in `v845-verification-report.json`.
