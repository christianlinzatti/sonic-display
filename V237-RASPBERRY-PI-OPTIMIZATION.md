# V237 – Raspberry Pi Optimization Suite 2.0

Aufbauend auf V236. Im Performance-Benchmark-Panel gibt es nun die **Performance prüfen**-Schaltfläche. Sie wertet die aktuellen (nicht simulierten) Render-Diagnosewerte aus und empfiehlt konservativ Renderqualität und Bühnenvariante. Nach Bestätigung gelten Änderungen nur für die aktuelle Sitzung, mit einer Rückgängig-Schaltfläche. Ohne aktuelle Messwerte kann keine Empfehlung übernommen werden.

Es handelt sich **nicht** um einen automatischen Mehrphasen-Benchmark, keine Messung von Pi-Temperatur, GPU-Auslastung oder Betriebssystem-Ressourcen. Die bestehende Pi-Geräteprofilauswahl und der umfassendere Benchmark bleiben verfügbar. Gleichzeitige andere Tuning-Tests vermeiden.

Tests: `npm run verify:offline`; Build auf lokal installierten Dependencies: `npm install && npm run verify`.
