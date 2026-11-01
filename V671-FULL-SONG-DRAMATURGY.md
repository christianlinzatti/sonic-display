# V671 – Automatische Songdramaturgie (28.10.2026)

Die automatische Regie bekommt für einen bestätigten Songabschnitt einen dramaturgischen Bogen (Aufbau, Entwicklung, Steigerung, Höhepunkt, Ruhe, Finale) auf bestehenden V604/V654/V669-Gain-Lanes. Ein neues, parallel arbeitendes Bühnen-/Kamera-System entsteht **nicht**. Zwischen belegten Abschnitten und bei Tracks ohne Importdaten läuft nur eine sehr kleine neutrale Kontur – ohne erfundene Solo-, Duett-, Hook- oder Drop-Labels.

Die Intensität bleibt auf ±3,5 % begrenzt, der Übergang an bestätigten Abschnittsgrenzen ist geglättet. Manuelle Kamera-, Dance- und Lichtbefehle werden nicht geändert. Lyrics-Schutz reduziert automatische Akzente. V670 prüft **anschließend** alle drei Lane-Werte als letzte Schutzstufe. Die 3D-Szene selbst wird nicht inspiziert, Lippen- und Texttimings werden nicht verändert.

In `TrackAnalysisControlsV318` zeigt eine neue Vorschau die bestätigten Szenenphasen und den errechneten Höhepunkt. Die Vorschau arbeitet auf lokal gespeicherter V318-Analyse, keine neuen Netzwerkdienste oder API-Schlüssel. Bereits vorhandene V600/V604-Motiv- und Ensemble-Logik führt Solo/Formation/Camera aus; V671 plant keine neuen Kamera-Pfads oder Sprechrollen.

Tests: `npm run test:v671`, `npm run test:v671:types`, `npm run test:smoke:v671`.
