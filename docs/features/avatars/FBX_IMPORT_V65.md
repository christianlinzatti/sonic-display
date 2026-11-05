# Sonic Display V65 – Local FBX to GLB

1. Install Blender on your local Windows computer (https://www.blender.org/download/).
2. Set `BLENDER_PATH` in `.env.local` if `blender` is not on PATH, e.g. `BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.5\blender.exe` (adapt to your installation).
3. Restart `npm run dev -- --hostname 127.0.0.1` after editing `.env.local`.
4. Go to Settings → Avatar & Tanz → Avatar-Bibliothek, choose `.fbx`, click **FBX importieren & konvertieren**.
5. The converted `.glb` is saved in `public/avatars/` and automatically selected. Original FBX is not kept.

Requirements/limitations:
- Only works on a **local Next.js development server**. Not enabled in production or on Vercel.
- Blender is an external application and must be installed separately; conversion does not run in the browser.
- 35 MB upload limit, 120-second conversion timeout. Some complex models can exceed these limits.
- Embedded textures and compatible animation clips are exported where Blender supports them; external FBX texture references may need manual adjustment.
- Mixamo FBX files generally work, but retargeting to the Sonic dance engine is not automatic.
- Do not import FBX files from untrusted sources. Blender parses native third-party assets.
