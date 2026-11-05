# V964 – Verified Peak Recovery & Deployment Artifact Guard

V964 baut auf der erfolgreich nach V963 eingeführten **Vercel-Paritätsprüfung unter Node 24** auf und ergänzt die Govee-Konzertregie, ohne die bestehenden manuellen Funktionen zu verändern.

## Konzert: kontrollierte Erholungsphase nach einer echten Hook-/Drop-Spitze

- In der bestehenden Govee-Autosynchronisation kann die neue Option **V964: Erholungsphase nach Hook/Drop** aktiviert werden.
- Verwendet nur echte, zeitlich zusammenhängende V318-Abschnitte aus demselben Track. Der vorige Abschnitt muss `hook` oder `drop` und hinreichend bestätigt sein; der aktuelle Abschnitt muss `verse`, `break` oder `outro` sein. Niedrige Konfidenz, Titelwechsel, Seek, Pause oder fehlende Phasen deaktivieren die Funktion.
- Nach einem bestätigten Drop läuft der dezente Abdimm-Effekt in 2,5 Sekunden aus; nach einer Hook in 1,8 Sekunden. Er ist für Hardtekk/Hardstyle etwas ausgeprägter als für Deutschrap. Maximal 18 Prozent Dimmung, niemals eine Helligkeitsanhebung oder Änderung der RGB-Farbkanäle.
- Gespeicherte V912-Shows, manuelle V354-/V948-Cues, Lampenwiederverbindung und deaktivierter Opt-in bleiben vollständig unangetastet. Kein eigener Timer, keine weiteren LAN-Befehle, keine neue Bridge-HTTP-Abfrage.
- Einstellungen werden im vorhandenen V958-Schema gespeichert (`sonic-display:ultimate-concert-v958`), kompatibel mit alten Presets und weiterhin standardmäßig **ausgeschaltet**.

## Deployment: Vercel und GitHub überprüfen das Ergebnis, nicht nur den Befehl

- Der `scripts/vercel-production-build.cjs`-Pfad führt nun zusätzlich V964-Regressions- und isolierte TypeScript-Tests aus; danach weiterhin volle TypeScript-Prüfung und **echten** Next.js-Build unter Node 24.
- Nach einem erfolgreichen Build validiert `scripts/check-next-build-v964.cjs` die frisch erzeugten Artefakte `BUILD_ID`, `build-manifest.json`, `prerender-manifest.json` und `server/app-paths-manifest.json`. Ein fehlendes, leeres, veraltetes oder ungültiges Build-Ergebnis verweigert die Freigabe.
- Regressionen prüfen echte und defekte Manifest-Fälle, auch für Windows/Linux-Dateipfade. Die historischen GitHub-Regressionsketten bleiben erhalten und laufen weiterhin getrennt vom Vercel-Deploymentpfad.
- Der neue GitHub-V964-Gate arbeitet auf **Windows und Ubuntu mit Node 24**, führt den vererbten V931-/V963-Gate inklusive vollständigem `tsc` und `next build` aus und speichert eine fehlersichere V964-Produktionsbeweisdatei.
- Reiner ZIP-Upload wird weiterhin vom Vercel-Deployment ausgeschlossen; erst der von GitHub Actions importierte vollständige Projektstand wird gebaut.

## Lokale Verifikation vor dem Upload

- `node tests/v964-peak-recovery-regression.cjs` – 40 Gruppen, 5000 deterministische Szenen.
- `node tests/v964-next-build-artifact-regression.cjs` – gültige/ungültige Next.js-Artefakte.
- `node tests/vercel-production-parity-regression.cjs` – Vercel-Konfigurations- und Versionsprüfung.
- `tsc -p tests/tsconfig.v964-core.json --noEmit` – isolierter vollständiger V964-Core-Check.
- `SONIC_TEST_CONCURRENCY=3 node scripts/v959-regressions-only.cjs` – gesamter begrenzter Regressionstest-Pool.

**Noch erforderlich:** reale Vercel-Auslieferung sowie vollständiger Windows/Linux-TypeScript-/Next.js-Produktionsbuild der importierten V964-ZIP. Ein lokales Regressionsergebnis ist keine Produktionsfreigabe.
