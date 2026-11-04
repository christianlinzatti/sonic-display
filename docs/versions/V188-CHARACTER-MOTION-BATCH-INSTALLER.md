# Sonic Display V188 – Character & Motion Batch Installer

## Installation

Unter **Settings → Avatar → Character & Motion Library · V188** mehrere `.glb`-Charakterdateien und mehrere Animations-GLBs auswählen. Vor der Installation können Charaktere in 3D betrachtet werden. Für jede Motion wird der Ziel-Avatar gewählt. **Dateien installieren** lädt jede Datei einzeln hoch und registriert Charaktere automatisch bzw. verknüpft Motions dauerhaft. Administrator-Login erforderlich.

## Technische Umsetzung und Grenzen

- Mit Vercel Blob erfolgt der Upload über `/api/avatars/upload`, Charaktermetadaten werden über `/api/avatars/config` gespeichert.
- Lokal im Next.js-Entwicklungsmodus legt der geschützte Endpunkt `/api/avatars/models/install` Dateien unter `public/avatars/` ab. Motions verwenden den bestehenden `/api/avatars/animations/import`-Endpunkt und `/api/avatars/animations/install`.
- Maximal 35 MB je Datei, GLB-Signatur und Header werden kontrolliert. Pro Auswahl höchstens 30 Dateien.
- Ein aktiver Animationspfad pro Avatar; daher nicht mehrere Motions demselben Ziel gleichzeitig zuweisen. Clips innerhalb einer GLB bleiben erhalten, ein Clip-Browser ist noch nicht enthalten.
- 3D-Vorschau der Charaktere vor Upload; die Vorschau von Animations-Clips und das automatische Retargeting fremder Rigs sind noch nicht implementiert.
- Vercel-Blob-Uploads sind öffentlich zugänglich. Der lokale Dateiupload erfordert Entwicklungsmodus, aktiven Admin-Login und passende Origin.
- Ein installiertes Modell erscheint nach Bibliotheksaktualisierung, wird aber nicht automatisch zum aktiven Avatar gemacht.

## Prüfungen

`npm run test:character-batch`, `npm run check:syntax`, `npm run verify:offline`, `npm run build`.
