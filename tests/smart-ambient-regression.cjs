const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const smart=read("components/SmartAmbientMode.tsx"),main=read("components/SonicDisplay.tsx"),toolbar=read("components/TouchKioskControls.tsx"),css=read("app/globals.css"),pkg=require("../package.json");
const cases=[
["version",()=>assert.equal(pkg.version,"0.1.0-v248")],
["standby delayed",()=>assert.match(smart,/STANDBY_DELAY_MS = 30000/)],
["only with connection",()=>assert.match(smart,/!playing && connected/)],
["standby opt-in",()=>assert.match(smart,/kioskEnabled && ambientEnabled/)],
["auto opt-in",()=>assert.match(smart,/kioskEnabled && autoLayout && playing/)],
["resume on playback",()=>assert.match(smart,/setIdleSince\(null\)/)],
["persist auto",()=>assert.match(smart,/localStorage\.setItem\(AUTO_KEY/)],
["persist ambient",()=>assert.match(smart,/localStorage\.setItem\(AMBIENT_KEY/)],
["interval cleanup",()=>assert.match(smart,/clearInterval\(timer\)/)],
["clock cleanup",()=>assert.match(smart,/clearInterval\(id\)/)],
["semantic standby",()=>assert.match(smart,/aria-label="Ambient-Standby"/)],
["main hook",()=>assert.match(main,/useSmartAmbient\(isPlaying,connected/)],
["standby renders no track",()=>assert.match(main,/<VisualizerStage(?:\s+stagePalette=\{[^}]+\})?\/>\{standbyOverlay\}/)],
["standby renders track",()=>assert.match(main,/playing=\{isPlaying\}\/>\{standbyOverlay\}/)],
["auto view respected",()=>assert.match(main,/displayView !== "stage"/)],
["toolbar switch",()=>assert.match(toolbar,/Auto-Layout/)],
["ambient switch",()=>assert.match(toolbar,/>Ambient<\/button>/)],
["reduced motion",()=>assert.match(css,/\.sonic-ambient-glow\{animation:none\}/)],
["verify integration",()=>assert.match(pkg.scripts["verify:offline"],/test:smart-ambient/)]
];for(const [name,fn] of cases){fn();console.log("PASS",name)}console.log(`${cases.length} V167 checks passed`);
