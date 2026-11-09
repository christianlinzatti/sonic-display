# V1132 – Expressive Performance

## Ausprobieren

Wie bisher: `npm ci`, Konfiguration anhand `.env.example` übernehmen und `npm run dev` starten.

Unter **Settings → Avatar → Sonic Stage Crew**:

1. **Intelligente Show aktivieren**.
2. Bei **Charakterausdruck** zwischen **Dezent**, **Ausgewogen** und **Bühnenstark** wählen. Die Auswahl wird auf diesem Gerät gespeichert und funktioniert mit bestehenden Crew-Einstellungen; ohne gespeicherten Wert gilt „Ausgewogen“.
3. Ein Trio auswählen und **Show-Simulation öffnen**. Unter den Clip-Namen erscheinen jetzt die Persönlichkeits- und Bewegungsfolgen-Bezeichnungen.
4. Mit verschiedenen Genres, Abschnitten und Positionen vergleichen. Die vorhandenen Spotify-/Lyrics-Daten können weiterhin in die Probe übernommen werden. Die Probe steuert Spotify nicht.

## Eigener Ausdruck für jede Figur

Alle elf vorhandenen Avatare erhalten ein eigenes Profil für Kopf, Schultern und Arme:

- Neon Pulse: präziser Taktgeber.
- Festival Nova: verspielte Frontfrau.
- Chrome Beat: mechanischer Popper.
- Ember Rock: kraftvoller Rocker.
- Luna Flow: fließende Träumerin.
- Sol Groove: warmer Groove.
- Velvet Jazz: eleganter Improvisator.
- Atlas Prism: präziser Bühnenarchitekt.
- Aurora Synth: weite Synth-Wellen.
- Rio Carnival: lebendige Rhythmustänzerin.
- Quantum Bass: druckvoller Bass-Roboter.

Die Profile legen begrenzte zusätzliche Oberkörperbewegungen über die echten GLB-Animationen. Standfüße und Root-Position werden dabei nicht verändert. Rollen- und Ausdruckswechsel werden zeitbasiert geglättet. Bei Pause, manueller Priorität oder deaktivierten Reaktionen wird die eigene Zusatzbewegung freigegeben. Bewegungsreduktion hat weiter Vorrang.

## Bewegungsfolgen statt reiner Clip-Abwechslung

Die Regie kombiniert bereits vorhandene Tänze zu Phrasenfolgen: **Groove & Schritte**, **Kontrast & Akzent** und **Signatur & Antwort**. Genre, Song-ID, musikalische Phrase, Refrain-Besuch und verfügbare Clips bestimmen die Auswahl. Individuelle Phrasenfolgen vermeiden bei verfügbarer Alternative die direkte Wiederholung des zuletzt gewählten Clips. Gemeinsame Gruppenfolgen verwenden die gemeinsame Clip-Bibliothek, damit alte und neue Figuren zusammenpassen.

Ruhige Teile, Aufbauten und dichte Lyrics geben weiterhin der bestehenden Song-Dramaturgie Vorrang. Die vier gemeinsamen Fußarbeits-Clips aus V1131 bleiben erhalten. Es wurden keine zusätzlichen Avatare oder Animationsdateien hinzugefügt: weiterhin elf GLBs und 240 eingebettete Clips, jetzt mit zusätzlichen Kombinations- und Ausdrucksmöglichkeiten.

## Sanftere Wechsel von Kanon und Unisono

Wenn derselbe Clip weiterläuft und sich nur der gewünschte Versatz ändert, korrigiert die Wiedergabe ihre Phase schrittweise. Zwischen den regelmäßigen Regie-Updates wird diese Korrektur auch im Render-Takt fortgeführt. Die Korrektur ist so begrenzt, dass der Clip bei unterstützten Tempi nicht rückwärts läuft. Neue Clips verwenden weiterhin die vorhandenen weichen Übergänge. Songwechsel und große Sprünge setzen den Bewegungszustand zurück.

## Tests und Grenzen

Die Show-Regie bleibt lokal und regelbasiert, ohne externes generatives KI-Modell oder neue Audioanalyse. Spotify, Genre und Lyrics werden für Browser-Tests weiterhin gemockt. Der Testtext ist original und mit kontrollierten Zeitmarken versehen; produktive Provider-Routen sind unverändert.

- `npm run test:v1132`: bisherige Tanz-/Songprüfungen plus Profile, Bewegungsfolgen, gemischte Gruppen, kontinuierliche Phasenkorrektur und tatsächliche Rig-Bewegung aller elf Figuren.
- `npm run typecheck`.
- Produktionsbuild: `SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build`.
- Anschließend `npm run test:v1132:browser`. Lokal gegebenenfalls `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` voranstellen oder einen passenden Playwright-Browser installieren.

Die ZIP enthält Quellcode, vorhandene Assets, Test-Mocks, Lockfile, Anleitung und Prüfbericht. Abhängigkeiten, Build-Caches und Zugangsdaten sind nicht enthalten.
