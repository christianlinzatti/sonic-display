require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const files={main:read("components/SonicDisplay.tsx"),stage:read("components/visualizer/VisualizerStage.tsx"),registry:read("components/visualizer/registry.tsx"),avatar:read("components/visualizer/ThreeAvatar.tsx"),lights:read("components/visualizer/DynamicStage.tsx")};
const checks=[
["V169 version",Number(require("../package.json").version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 169],
["opt-in palette propagation",files.main.includes("theme.enabled ? theme.palette : undefined")],
["prop into stage",(files.stage.includes("stagePalette={stagePalette}") || files.stage.includes("stagePalette={stageContentV330.musicPalette??stagePalette}"))],
["typed palette",files.registry.includes("stagePalette?:")],
["3D avatar hands palette to lights",files.avatar.includes("musicPalette={props.stagePalette}") || files.avatar.includes("musicPalette={directedPaletteV352}")],
["reuses point lights",files.lights.includes("key.current.color.lerp")&&files.lights.includes("fill.current.color.lerp")],
["reuses spot light",files.lights.includes("beam.current.color.lerp")],
["no shadow maps",files.avatar.includes("shadows={false}")],
["bounded transition",/Math\.min\(\s*Math\.max\(\s*delta\s*,\s*0\s*\)\s*,\s*\.1\s*\)/.test(files.lights)],
["respects reduced motion",files.lights.includes("reducedMotion ? 1")],
["retains old theme",files.lights.includes("musicPalette?.primary ?? palette.primary")],
["retains beat cues",files.lights.includes("advanceStageCue")],
["quality cap",files.lights.includes("getActivePerformanceTier()")],
];for(const [name,passed] of checks)assert.ok(passed,name);console.log(`${checks.length} V169 checks passed`);
