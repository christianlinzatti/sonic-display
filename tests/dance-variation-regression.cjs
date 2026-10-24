require('./helpers/threeAvatarSourcesV492.cjs').install();
const fs=require("node:fs"),assert=require("node:assert/strict"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"../",p),"utf8");
const logic=read("components/visualizer/danceVariationEngine.ts"),ui=read("components/visualizer/SmartChoreographyEvolutionPanel.tsx"),runtime=read("components/visualizer/ThreeAvatar.tsx"),pkg=JSON.parse(read("package.json"));
const checks=[[/composeVariedDanceSequence/,logic],[/scoreDanceMotion/,logic],[/avatarId===input.avatarId/,logic],[/avoidRecent/,logic],[/history.slice/,logic],[/if\(!pool.length\)/,logic],[/phraseBars/,logic],[/Math.min\(16,remaining/,logic],[/Math.pow/,logic],[/intensity/,logic],[/variationLevel/,logic],[/explanation.push/,logic],[/seed>>>0/,logic],[/score:/,logic],[/variationEnabled/,ui],[/setDiversity/,ui],[/setPhraseBars/,ui],[/Dance Variation Engine · V201/,ui],[/Vorschlag übernehmen/,ui],[/propose\(phase\)/,ui],[/selectEvolutionByBeat/,runtime]];
for(const [re,text] of checks)assert.match(text,re);assert.equal(pkg.version,"0.1.0-v248");console.log(`V201: ${checks.length+1} static integration checks passed`);
