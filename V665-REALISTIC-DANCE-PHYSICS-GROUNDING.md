# V665 – Realistic Dance Physics & Grounding

Die vorhandene V492-Fuß-IK und die GLB-Animationen bleiben unverändert. V665 ergänzt nur eine **abschaltbare, kontaktabhängige Dämpfung** der bereits berechneten additiven Rig-Kanäle (`footStep`, `legGroove`, `weightShift`, `hipSway`, `spineSway`, `hipCounter`). Es gibt keine neue Physics-Engine, Kollisionen, Bodenpositionen oder Hocke-Keyframes.

## Funktion

- In `Einstellungen → Natürlicher Tanz → V665` schaltbar; **standardmäßig aus**. Einstellbar sind Intensität (0–100 %) und Überblenddauer (120–800 ms); das Browser-Speichern schlägt bei gesperrtem Storage mit sichtbarer Meldung fehl.
- Der neue pure Regler `components/visualizer/realisticDanceGroundingV665.ts` nutzt die **vorherige** Kontakt-Beobachtung der bereits existierenden V492-IK. Bei keinem bekannten Kontakt und ohne tatsächlich gewählten Hocke-Clip werden die zusätzlichen Bewegungen nicht verändert.
- Ein sicherer Einzel- oder Doppelstand reduziert nur vorhandene Schritt- und Gewichtsimpulse; beim Abheben des Fußes wird die Dämpfung weich freigegeben. Es werden keine neuen Bewegungen erzeugt. Die Stärke wird erst dann für eine Hocke ausgeweitet, wenn der vorhandene V481/V482-Mechanismus einen kompatiblen Low-Pose-Clip tatsächlich als aktiven Basisclip ausgewählt hat; die Hocke selbst kommt aus diesem Clip.
- Trackwechsel, Rückwärtssprünge, Sprünge in der Zeit, anderes GLB, pausierte Wiedergabe und abgeschaltete Automatik setzen den Übergangszustand zurück.
- Kein Effekt bei Reduced Motion, manuell authored Choreografie, Lyrics-/Kamerapfaden, niedriger Qualitätsstufe oder ohne gültige Fuß-IK. Die Position, die Kontaktpunkte und die eigentliche V492-IK werden nicht verändert.

## Dateien

`components/visualizer/realisticDanceGroundingV665.ts`, `GltfDancerAvatarV492.tsx`, `NaturalDanceControlsV320.tsx`, `tests/v665-realistic-dance-grounding-regression.cjs`, `tests/tsconfig.v665-core.json` sowie Release-Konfiguration/Dokumentation.

Die neue Einstellung wird in die bestehende browserlokale Gesamtsicherung als Avatar-Einstellung übernommen.

## Grenzen

Das ist eine konservative, heuristische Overlay-Stabilisierung **keine gemessene reale Fußsohlenreibung oder inverse Dynamik**. Das Gelingen von natürlichen Hocken, Schritten und Standwechseln hängt weiterhin von kompatiblen GLB-Clips und korrekt kalibriertem humanoidem Rig ab. Vor einer Produktionsfreigabe sind ein vollständiger TypeScript-Check und Next.js-Build mit allen npm-Abhängigkeiten und echte 3D-Browsertests erforderlich.
