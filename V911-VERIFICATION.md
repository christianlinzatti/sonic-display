# V911 – Validierungsstatus

- **Bestanden:** V911 – 13 Gruppen einschließlich 1.500 Kombinationen; `npm run test:v911`.
- **Bestanden:** isolierter TypeScript-Core `npm run test:v911:types`.
- **Bestanden:** Rückwärtskompatibilität V909, V910 (7 Gruppen), V908 (966 Prüfungen), V907 (1.096 Prüfungen).
- **Bestanden:** Architektur und Syntax (`npm run check:architecture`, `npm run check:syntax`; 1.330 TS/TSX-Dateien).
- **Nicht erfolgreich ausführbar in dieser Umgebung:** `npm run typecheck` endet mit fehlenden `next`, `react`, `@types/node` u. a. (keine installierten npm-Abhängigkeiten). `next build` wurde aus demselben Grund nicht ausgeführt. Der reguläre CI-Workflow enthält beide Schritte und muss auf einem Rechner mit `npm ci` bestehen.
- Echtes Raspberry-Pi-/Chromium-/Govee-Hardwareverhalten: **noch nicht getestet**.

V911 ist als zusätzliche, standardmäßig deaktivierte Option umgesetzt. Die vorhandene V909-Musikautomatik und V910-Bridge bleiben kompatibel; die Govee-LAN-Kommandos werden nicht erweitert.
