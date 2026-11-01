# Sonic Display V662 – Advanced Phoneme Lip-Sync

## Umsetzung

- Baut ausschließlich auf der **ausdrücklich von Menschen zeitlich markierten V644-Visemspur** auf. Das System erkennt keine Phoneme aus Audio und leitet keine Sprecher aus Lyrics, RMS oder Spotify ab.
- Unter **Einstellungen → V644 · Advanced Phoneme Lip-Sync → V662 · Natürliche Lautübergänge** gibt es drei Profile: `Aus · Original V644` (Standard), `Deutschrap · präzise Konsonanten` und `Gesang · weichere Übergänge`.
- Bei **direkt aneinandergrenzenden** manuell markierten Visemintervallen werden beschränkte Übergangsfenster interpoliert; max. 22 ms je Seite für Rap bzw. 38 ms für Gesang, durch 23 % der beiden Eventdauern zusätzlich begrenzt. Die Mitte jedes Events bleibt unverfälscht. Zwischen getrennten Intervallen wird kein Mundsignal hinzugedichtet.
- Lippenverschlüsse bei `PP` und die anderen V644-Mundformen bleiben begrenzt (`jaw ≤ 1-lipsClosed`). Die bestehende V562-Kalibrierung der tatsächlichen GLB-Morphs und Jaw-Bone-Fallbacks bleibt nachgeschaltet. V662 führt **keine eigene GLB-Morphsuche** oder neue Bone-Eingriffe aus.
- Die bestehende `VocalRigV368`-Frame-Regie verwendet V662 nur, wenn **V644 aktiv ist**, die Track-ID und der Sänger-Slot passen, der Song tatsächlich läuft und die vorhandenen Prioritätssperren (manuelle Silben-Edits, V423-Audio-Timing, selbst animierte Faces, Live-Preview) eine Überlagerung erlauben. Rap-Mundkanäle folgen bei V662 etwas schneller als bei V644; beim Singen bleiben sie ruhiger.
- Die einmalige per-Dokument-Indizierung der maximal 4.000 V644-Cues wird bei Dokumentänderung erneuert; danach Laufzeitabfrage pro Frame mit binärer Suche. Kein weiterer `useFrame`, kein Audio-Upload, keine Speicherung des V662-Profils oder zusätzlicher Netzwerkzugriff.
- Ein Songwechsel deaktiviert die alte Spur, auch bei erneutem Besuch des Songs wird keine alte, entfernte V644-Spur wiederhergestellt. Entfernen aller Viseme schaltet V662 ebenfalls aus.

## Einschränkungen

Dies ist **Koartikulation, keine automatische Phonemerkennung**. Die Genauigkeit hängt von der Qualität der manuellen V644-Zeitmarken, dem Vorhandensein passender GLB-Gesichtsmorphs und dem tatsächlichen Audio-Zeitversatz ab. Ein GLB mit nur Kieferknochen kann keine Lippenverschlüsse darstellen; hierfür werden passende Morph-Targets oder ein Face-Rig benötigt. Visuelle Überprüfung an echten Modellen und Referenzvocals ist erforderlich.

## Tests

- `npm run test:v662` – Opt-in, zeitliche Grenzen, Kurven, Rap-/Gesangsprofile, B/P/M-Verschlüsse, 4 Avatar-Slots, Songwechsel, Dokumentupdate, 15.000 Abtastungen, Integration der älteren V644-Prioritäten.
- `npm run test:v662:types` – isolierter TypeScript-Kerncheck.
- `npm run test:smoke:v662` – bestehende V644-/V661-/V631-/V632- und historische Release-Regressionen.
- `npm run check:release`, `npm run typecheck`, `npm run build` – Release-Gate; Produktionsbuild nur mit vollständig installierten Projektabhängigkeiten bestätigt.
