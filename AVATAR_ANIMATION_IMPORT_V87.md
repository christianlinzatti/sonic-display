# V87 – Avatar Animation Importer

In **Settings → Avatar & Tanz → Avatar-Bibliothek → Avatar bearbeiten** can you upload a `.glb` file containing skeletal animation clips, then **Save** its assignment. Uploaded assets use Vercel Blob if configured; development without Blob stores uploads in `public/animations`. Admin login is required.

**Rig compatibility:** Imported clip track/bone names must match the avatar rig. No automatic retargeting. Imported clips take priority in choreography/hybrid modes; reactive mode prefers an embedded idle clip. Empty/incompatible clips will not meaningfully animate the rig.

**Security:** Only admins can upload/modify. Public Blob URLs are publicly readable. Production requires `BLOB_READ_WRITE_TOKEN`, `SONIC_ADMIN_PASSWORD`, `SONIC_ADMIN_SESSION_SECRET`.

Local development: `npm run dev`; upload GLB to your avatar settings, then click Save.
