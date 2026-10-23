# Sonic Display V346 – Intelligent Photo Layout Director

- Im Gallery Preview Editor unter dem Mehrbild-Editor den **Photo Layout Director** einschalten. V345-Mehrbild-Modus muss für das Seitenformat aktiviert sein.
- **Auto** wertet den echten aktuellen Songabschnitt, das Genre und den Kick-Akzent aus. Intro/Strophe tendieren zu einem Bild, Refrain zu drei Bildern, Drop zu bis zu acht Bildern. Die Anzeige wechselt nur nach der einstellbaren Mindestdauer. Bei unbekanntem Songabschnitt wird der Beat-Akzent berücksichtigt.
- **Manuell** legt Fokus / Ausgewogen / Impact fest und hat Vorrang vor der Automatik.
- Die Studio-Testparameter beeinflussen ausschließlich die textuelle Vorschlagsanzeige, nicht die Live-Bühne. Für einen echten Wechsel nutzt der Bühnen-Renderer die echten Musiksignale.
- Foto-URLs werden nicht gespeichert. Das bestehende V345-Layout bleibt unverändert; der Director blendet bei Bedarf zusätzliche Ebenen aus und respektiert `reducedMotion`.
- Standardmäßig ist V346 ausgeschaltet, sodass bestehende V345-Benutzereinstellungen unverändert bleiben.

Prüfen: `npm run test:v346`, `npm run verify:offline`, auf einem Rechner mit installierten Abhängigkeiten `npm run verify`.
