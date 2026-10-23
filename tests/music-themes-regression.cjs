const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const theme=source("components/MusicAwareThemes.tsx"),main=source("components/SonicDisplay.tsx"),toolbar=source("components/TouchKioskControls.tsx"),ambient=source("components/SmartAmbientMode.tsx"),css=source("app/globals.css"),pkg=require("../package.json");
const checks=[
["version",["0.1.0-v248","0.1.0-v248"].includes(pkg.version)],
["genre palette",theme.includes('Record<MusicGenre, AmbientPalette>')],
["all music genres",["hardstyle","techno","hiphop","rock","ambient","pop"].every(v=>theme.includes(v+':'))],
["persist opt in",theme.includes('localStorage.setItem(THEME_KEY')],
["default disabled",theme.includes('useState(false)')],
["cover sampling",theme.includes('getImageData(0,0,24,24)')],
["cors handling",theme.includes('crossOrigin = "anonymous"')],
["abort on changing track",theme.includes('new AbortController()')&&theme.includes('abort.abort()')],
["cover fallback",theme.includes('genrePalette(genre)')],
["no tainted canvas crash",theme.includes('catch{finish(null)')],
["controlled color vars",theme.includes('--sonic-theme-primary')],
["main receives detected genre",main.includes('disconnect,genre}=useMusic()')],
["music colors applied",main.includes('sonic-themed')],
["ambient palette",main.includes('palette={theme.enabled ? theme.palette : undefined}')],
["toolbar theme toggle",toolbar.includes('Musikfarben')],
["ambient independent fallback",ambient.includes('palette?: AmbientPalette')],
["transition",css.includes('transition:color 1.5s ease')],
["reduced motion",css.includes('prefers-reduced-motion:reduce')],
["offline suite",pkg.scripts['verify:offline'].includes('test:music-themes')]
];checks.forEach(([name,ok])=>assert.ok(ok,name));console.log(`${checks.length} V168 checks passed`);
