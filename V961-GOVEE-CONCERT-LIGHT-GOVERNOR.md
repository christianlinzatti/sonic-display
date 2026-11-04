# V961 – Govee Concert Light Governor

**Basis:** Sonic Display V960. Die opt-in Lichtregelung begrenzt beim bestehenden V909-Sendertakt die maximale Aufhellung pro Auto-Sync-Tick auf 12 Helligkeitsstufen; der erste automatische Befehl beginnt bei maximal 35%. Farbänderungen werden je Tick auf 40 RGB-Stufen pro Kanal begrenzt. Abdunkeln erfolgt sofort, um das aktuelle Gruppen-/Master-Limit nicht zu überschreiten.

- Option in **Ultimate Concert Experience Studio**: **V961: Sanfte Govee-Lichtwechsel**.
- Standardmäßig **aus**, keine Schema-/Storage-Migration nötig.
- Nur bei aktiver Wiedergabe, verifizierten V318-Songphasen, aktivierter V958-Konzertregie und expliziter Govee-Hardware-Freigabe.
- Strikte Ausnahme: gespeicherte V912-Lichtshow, manuell authorisierte V354-Bühnen-Cues, Wiederverbindungs-Fallback V934.
- Kein neuer Poll, kein extra UDP-/HTTP-Request, keine zusätzlichen R3F-Meshes, keine Power- oder Stroboskopkommandos.
- Isolierte Tests: sicherheitsrelevante Regeln sowie 5.000 deterministische Zustände.
- Produktionsfreigabe erfordert volle CI-Proof: Regressionen, projektweites tsc, Next.js build auf Windows + Linux.

**Wichtig:** Kein Schutz gegen fotosensitive Reize durch andere bereits vorhandene Bühnenmodule. Diese Funktion betrifft ausschließlich die opt-in V958-Govee-Mischung; optische Reaktionszeiten sind nicht automatisch kalibriert.

**Produktionsbuild-Hotfix:** Null-sichere Genre-Werte in den V887- und V889-Bühnenplanern; HTML-Select-Eventtypen im V890-Spotlight-Editor. Diese vier Fehler wurden in V960-CI auf Windows und Linux beobachtet. V961 prüft sie ausdrücklich vor dem Gesamtbuild.
