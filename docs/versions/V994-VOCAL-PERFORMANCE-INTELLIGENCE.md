# V994 – Vocal Performance Intelligence

**Ziel:** Glaubwürdigere Rap-Phrasen und dezente Kopf-/Gesichtsausdrücke ohne neue Animationskonkurrenz.

**Quellen und Grenzen:** Nur bereits synchronisierte Wortmarken (V415), V538-verifizierter Wort-/Sängerstatus, aktive Song-ID und Wiedergabe. Das ist eine deterministische Performance-Regel, **keine** Stimm-, Emotion-, Phonem- oder Silbenerkennung. Der Nutzer aktiviert sie ausdrücklich im Concert Studio.

**Technik:** V994 modifiziert bei geeigneten Rap-Wortphrasen nur die Antwortgeschwindigkeit der vorhandenen Kiefer-/Vokal-Morphs. Lippenverschlüsse, manuelle V420/V423-Dokumente, V644/V662-Viseme, V661-Stems, handverfasste Keyframes, Preview-Posen und fremde Sängerrollen gewinnen. B/P/M-Anfänge werden nicht antizipiert. GLB-Pipeline V368 bleibt alleinige Morph-Autorität, prozeduraler Fallback erhält dieselben schwachen Akzente. Additive Kopfwinkel sind auf 0,014 rad begrenzt, andere Gesichtsakzente bleiben sehr klein und Musikpausen/Seeks hinterlassen keinen Zustand. Auf Low-Tier und bei reduzierter Bewegung aus.

**Manuelle Konfiguration:** Schalter, Stil Natürlich/Rap-Flow/Bühne, Intensität 0–100 %, Mundübergänge, Gesicht und Kopf individuell. Ohne vorhandene synchronisierte Lyrics zeigt die Einstellung keine neue Aktivität.

**Validierung:** `node tests/v994-vocal-performance-intelligence-regression.cjs`, `npm run test:v994:types`, `npm run check:syntax`, `npm run check:architecture`; Next.js-Produktionsbuild auf Node 24 CI. ZIP-Import über vorhandenen Repo-Importer.
