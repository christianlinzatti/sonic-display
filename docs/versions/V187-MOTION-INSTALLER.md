# V187 – Motion Installer (ohne Konfigurationsdateien)

## Ziel
Im Avatar-Tab können Administrierende Animationsdateien vom Typ GLB per Dateiauswahl hochladen und automatisch einem vorhandenen Avatar zuweisen, ohne `avatars.local.json`, `avatarModels.default.ts` oder eine URL manuell zu ändern.

## Bedienung
1. Settings → Avatar öffnen; als Administrator anmelden.
2. Im Abschnitt **Motion Installer · V187** einen Avatar auswählen.
3. Eine GLB-Animationsdatei (maximal 35 MB) auswählen.
4. Falls dieser Avatar bereits eine Motion hat, das Ersetzen explizit bestätigen.
5. **Motion installieren & automatisch zuweisen** klicken.

Die Datei wird über den bestehenden sicheren Upload-Endpunkt lokal (nur Development) oder via konfiguriertem Vercel Blob hochgeladen. Ein neuer geschützter API-Endpunkt `/api/avatars/animations/install` ändert anschließend nur `animationUrl` in der serverseitigen Avatar-Metadatenablage; andere Attribute bleiben unverändert. Die Bibliothek wird anschließend aktualisiert. Änderungen an Dateien auf dem Server sind nicht nötig.

## Einschränkungen
- GLB ist erforderlich. FBX/BVH müssen gegebenenfalls zuvor konvertiert werden; eine automatische FBX- oder BVH-Installation wird **nicht** vorgetäuscht.
- Die GLB-Datei muss gültige Animationstracks enthalten, die zum Avatar-Rig passen. Signatur- und Größenprüfung allein garantieren kein Retargeting.
- Pro Avatar kann über dieses bestehende Datenmodell eine Animations-GLB zugewiesen sein (sie kann mehrere Clips enthalten).
- Administrator-Zugang und ein verwendbarer Upload-Speicher müssen konfiguriert sein. Lokal ist der Import nur unter `npm run dev` möglich.
- Wird die Zuordnung nach einem erfolgreichen Upload abgelehnt, kann eine unzugeordnete Datei im Upload-Speicher verbleiben.
