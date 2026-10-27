const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=read('components/visualizer/advancedMusicDanceIntelligenceV273.ts');
const host=read('components/visualizer/VisualizerStage.tsx');
assert.match(engine,/candidateSince/);assert.match(engine,/committedAt/);assert.match(engine,/hardtekk/);assert.match(engine,/deutschrap/);
assert.match(engine,/at < s.at - 1200/);assert.match(engine,/if \(!x.playing\)/);
assert.match(host,/advanceDanceIntelligence/);assert.match(host,/detectedSection\s*:\s*(?:rapMotionHookV437\s*\?\s*["']hook["']\s*:\s*)?directedSection\b/);assert.match(host,/liveSection:danceIntelligence.section/);
assert.match(host,/eventSlot\s*:\s*(?:rapMotionHookV437\s*\?[^\n]*:\s*)?(?:danceIntelligenceSlot|danceEventV437)\b/);
// Exercise the actual wired ternary, not just its exact source spelling.
const sectionExpression=host.match(/detectedSection\s*:\s*(rapMotionHookV437\s*\?\s*["']hook["']\s*:\s*directedSection)\b/)?.[1];
if(sectionExpression){
 const vm=require('node:vm');
 assert.equal(vm.runInNewContext(sectionExpression,{rapMotionHookV437:false,directedSection:'verse'}),'verse');
 assert.equal(vm.runInNewContext(sectionExpression,{rapMotionHookV437:true,directedSection:'verse'}),'hook');
}

assert.ok(Number(JSON.parse(read('package.json')).version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 273);
console.log('V273 advanced music dance intelligence integration PASS');
