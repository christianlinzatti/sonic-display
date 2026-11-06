# V1035 · AI Arena Show Director (regelbasiert)

Auf Basis V1034: Acht bis sechzehn unabhängige, weltfeste LED-Säulen (Instancing, 2 Draw Calls),
virtuelle Pyro-Spark-Jets (12–48 Partikelinstanzen) und ein stärker reagierendes 360°-Publikum.
Eine lokale Showdramaturgie berücksichtigt tatsächlichen Songfortschritt, vorhandene Verse-/Hook-/Drop-Markierungen und gemessene Audioenergie.
Bei fehlender Songdauer bleibt der Showbogen konservativ; ein Drop wird niemals allein aus Songfortschritt angenommen.
Virtuelle Funken benötigen einen erkannten Drop, einen Beat mit >= 0,72 Stärke und >= 0,45 Energie, plus 5,5 s Cooldown.
Eine Pause oder „Bewegung reduzieren“ setzt das Feuerwerk sofort zurück. Keine HTTP-/KI-Anfrage, keine echte Pyrotechnik.
Die kleinen 3D-Bühnenvorschauen zeigen die LED-Säulen. Die vier neuen Schalter und eine Intensitätsregelung sind unter Dynamic Stage / 360° Arena erreichbar.
Die vorhandenen Bühnen, Avatare, Kameras, Lyrics und V1031–V1034-Funktionen bleiben unverändert.

Validierung: `npm run test:v1035`, `npm run test:v1035:types`, `npm run check:syntax`,
`npm run check:architecture`, `npm run preflight:source`; vollständiger Next.js-Build in GitHub Actions
über Windows und Ubuntu vorgesehen.

