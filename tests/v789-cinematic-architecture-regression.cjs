'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const file=path.join(root,rel),source=fs.readFileSync(file,'utf8');const out=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(out.outputText,file);return m.exports;}
const {createArchitectureBarsV789,architectureDesignV789,ARCHITECTURE_MAX_BARS_V789,planArchitectureCueV789}=load('components/visualizer/architecturalLightPlanV789.ts');
const themes=['classic','neon','festival','minimal','cyberpunk','vaporwave','galaxy','white','rock'];
for(const theme of themes){const arr=createArchitectureBarsV789(theme);assert(arr.length>=28 && arr.length<=ARCHITECTURE_MAX_BARS_V789,theme);
 for(const bar of arr){for(const f of ['x','y','z','angle','length','width'])assert(Number.isFinite(bar[f]),`${theme} invalid ${f}`);
  assert(bar.z<=-3.2,`${theme} must be behind performers`); assert(bar.width>0&&bar.length>0);}
 assert.deepEqual(arr,createArchitectureBarsV789(theme),`${theme} deterministic layout`);
}
assert.equal(architectureDesignV789('galaxy'),'halo');assert.equal(architectureDesignV789('rock'),'arena');
assert.equal(architectureDesignV789('minimal'),'quiet');
const base={playing:true,reactive:true,reducedMotion:false,section:'verse',intent:null,
 energy:.6,kick:.5,playbackMs:30000,lyricsProtected:false,blackout:false,manualLighting:false,lowTier:false};
const verse=planArchitectureCueV789(base),hook=planArchitectureCueV789({...base,section:'hook'}),drop=planArchitectureCueV789({...base,section:'drop',intent:'pulse'}),breath=planArchitectureCueV789({...base,section:'break',intent:'breath'});
assert(verse.visible&&hook.opacity>verse.opacity&&drop.opacity>hook.opacity&&breath.opacity<verse.opacity);
assert(planArchitectureCueV789({...base,lyricsProtected:true}).opacity<verse.opacity);
assert(planArchitectureCueV789({...base,manualLighting:true}).opacity<verse.opacity);
assert.equal(planArchitectureCueV789({...base,reducedMotion:true}).scale,1);
assert.equal(planArchitectureCueV789({...base,reducedMotion:true}).chase,0);
assert.equal(planArchitectureCueV789({...base,manualLighting:true}).chase,0);
for(const f of ['blackout','lowTier','muted'])assert.deepEqual(planArchitectureCueV789({...base,[f]:true}),{visible:false,opacity:0,scale:1,chase:0});
for(const weird of [NaN,Infinity,-100,1e8]){
 const result=planArchitectureCueV789({...base,energy:weird,kick:weird,playbackMs:weird});
 assert(Number.isFinite(result.opacity)&&result.opacity>=0&&result.opacity<=.39);
 assert(Number.isFinite(result.scale)); assert(Number.isFinite(result.chase));
}
const source=fs.readFileSync(path.join(root,'components/visualizer/ConcertArchitectureV789.tsx'),'utf8');
for(const text of ['instancedMesh','setMatrixAt','computeBoundingSphere','useFrame','getActivePerformanceTier','getVisualLevelV640','timelineGainRef.current','lyricsProtected','reducedMotion','manualLighting','depthWrite={false}','toneMapped={false}'])assert(source.includes(text),text);
for(const forbidden of ['requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'new SpotLight(', 'castShadow={true}', 'useState('])assert(!source.includes(forbidden),forbidden);
const stage=fs.readFileSync(path.join(root,'components/visualizer/DynamicStage.tsx'),'utf8');
assert(stage.includes('<ConcertArchitectureV789 key={theme}'));assert(stage.includes('manualLighting={manualLightingV763}'));
const pkg=require('../package.json');assert(/^0\.1\.0-v(?:789|79\d|[8-9]\d\d)$/.test(pkg.version));
for(const key of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[key].includes('npm run test:v789 && npm run test:v789:types &&'),key);
console.log('PASS V789: deterministic stage-specific batched architecture, tonal song arc, blackouts, protection and tier fallback');
