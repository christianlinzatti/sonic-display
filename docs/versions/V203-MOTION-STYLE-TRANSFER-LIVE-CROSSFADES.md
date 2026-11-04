# Sonic Display V203 – Motion Style Transfer & Live Timeline Crossfades

## Live-Überblendungen
Der visuelle Timeline Editor schreibt `crossfade` jetzt zusätzlich direkt in jeden `EvolutionStep` (optionales Feld, rückwärtskompatibel). Bei der Live-Auswahl wird die eingestellte Übergangsdauer der eingehenden Motion für `planDanceTransition` verwendet. Alte gespeicherte Sequenzen nutzen die V192-Einstellung. Der V202-Separatspeicher wird weiter zum Einlesen vorhandener Editor-Werte unterstützt.

## Motion Style Transfer
Neue `MotionStylePanel`-Regler für Gesamt-, Oberkörper- und Unterkörperintensität je Avatar. Die Anpassung arbeitet ausschließlich auf den Quaternion-Animationskurven *nach* dem bestehenden humanoiden Bone-Retargeting. Translation, Skelettlängen und Root-Movement werden nicht synthetisiert. Ohne erkannte Restpose wird der ursprüngliche Track übernommen.

Hinweis: Dies ist eine konservative Amplituden-Anpassung, **kein** semantischer Stiltransfer mit einem ML-Modell und keine Garantie für perfekte Fußkontakte. Nach Änderung laden die GLB-Motions erneut in die Library-Clips.

## Tests
`npm run test:motion-style`, `npm run test:timeline-editor`, `npm run check:syntax`; danach lokal mit installierten Abhängigkeiten `npm run typecheck` und `npm run build`.
