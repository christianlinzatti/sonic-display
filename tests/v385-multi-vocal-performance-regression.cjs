const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache=new Map();
function load(rel){
 const full=path.resolve(root,rel.endsWith('.ts')?rel:rel+'.ts');
 if(cache.has(full))return cache.get(full).exports;
 const code=read(path.relative(root,full));
 const transpiled=ts.transpileModule(code,{fileName:full,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(transpiled.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,rel);
 const mod=new Module(full,module);mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));cache.set(full,mod);
 const original=mod.require.bind(mod);mod.require=id=>id.startsWith('./')?load(path.relative(root,path.resolve(path.dirname(full),id))):original(id);
 mod._compile(transpiled.outputText,full);return mod.exports;
}
const {normalizeVocalAssignmentsV385,resolveManualVocalCueV385,applyManualVocalCueV385}=load('components/visualizer/manualVocalCastingV385');
const {resolveVocalPerformanceQualityV374}=load('components/visualizer/vocalPerformanceQualityV374');
const lyrics={provider:'lrclib',synced:true,plainText:null,
 lines:Array.from({length:10},(_,i)=>({startMs:i*2000,endMs:i*2000+1650,text:`Text ${i}`,
 words:[{startMs:i*2000+100,endMs:i*2000+1000,text:i%2?'muss':'Beat'}]}))};
const slots=[{fromLine:0,toLine:3,role:'lead',slot:0},{fromLine:4,toLine:5,role:'feature',slot:1},
 {fromLine:6,toLine:7,role:'hook',slot:0},{fromLine:8,toLine:9,role:'lead',slot:2}];
assert.deepEqual(normalizeVocalAssignmentsV385([null,{},slots[0],{...slots[0],slot:22},slots[1]],10),[slots[0],slots[1]]);
assert.deepEqual(normalizeVocalAssignmentsV385(slots,3),[]);
const get=(ms,override={})=>resolveManualVocalCueV385({lyrics,progressMs:ms,playing:true,
 count:4,enabled:true,assignments:slots,...override});
assert.equal(get(450).leadSlot,0);
assert.deepEqual(get(450).singingSlots,[0]);
assert.equal(get(2300).handoffFrom,null,'no handoffs inside same authored passage');
assert.equal(get(8050).active,true);
assert.equal(get(8050).role,'feature');
assert.equal(get(8050).leadSlot,1);
assert.equal(get(8050).handoffFrom,0,'feature artist receives lead from verse artist');
assert.equal(get(9010).handoffFrom,null,'one handoff cue, not a whole section');
assert.equal(get(12450).role,'hook');
assert.deepEqual(get(12450).singingSlots,[0,1,2,3]);
assert.equal(get(16450).leadSlot,2);
assert.equal(get(16450,{count:2}).active,false,'invalid artist slot never indexes a non-existent dancer');
assert.equal(get(19800).active,false,'ends at the lyric line ending');
assert.equal(get(1650).active,false,'instrumental gap');
assert.equal(get(500,{playing:false}).active,false);
assert.equal(get(500,{enabled:false}).active,false);
assert.equal(get(500,{assignments:[null,{slot:'oops',fromLine:0,toLine:9,role:'lead'}]}).active,false);
assert.equal(get(500,{manualPriority:true}).active,false);
assert.equal(get(-20).active,false);
assert.equal(get(500,{lyrics:{...lyrics,synced:false}}).active,false);
assert.deepEqual(get(8350),get(8350),'seek deterministic');
assert.deepEqual(get(8350),get(8350,{progressMs:8350}));
const fallback={enabled:false,leadSlot:0,partnerSlot:null,activeSlots:[0,1,2,3],fromSlot:null,
 toSlot:0,event:'none',phase:0,emphasis:0,source:'none',lineIndex:-1,count:4};
assert.deepEqual(applyManualVocalCueV385(fallback,get(1800)),fallback);
const feat=applyManualVocalCueV385(fallback,get(8050));
assert.deepEqual(feat.activeSlots,[0,1,2,3]);
assert.equal(feat.event,'handoff');assert.equal(feat.partnerSlot,0);assert.equal(feat.leadSlot,1);
assert.equal(applyManualVocalCueV385(fallback,get(8050),true).event,'none');
assert.equal(applyManualVocalCueV385(fallback,get(12500)).leadSlot,0);
const qualityOpts={style:'rap',genre:'Deutschrap',lipStrength:90,qualityEnabledV374:true,
 ensembleCountV374:4,stageLeaderV375:1,manualSingingSlotsV385:[1]};
const lead=resolveVocalPerformanceQualityV374(lyrics,8300,true,{...qualityOpts,avatarSlot:1});
const backing=resolveVocalPerformanceQualityV374(lyrics,8300,true,{...qualityOpts,avatarSlot:2});
assert.equal(lead.qualityV374.role,'lead');assert.equal(backing.qualityV374.role,'backing');
assert.ok(backing.face.jaw<=.05+1e-8);assert.ok(backing.face.lipsClosed>=.9);
assert.equal(resolveVocalPerformanceQualityV374(lyrics,12300,true,{...qualityOpts,avatarSlot:2,
 manualSingingSlotsV385:[0,1,2,3]}).qualityV374.role,'ensemble');
const without=resolveVocalPerformanceQualityV374(lyrics,8300,true,{...qualityOpts,avatarSlot:2,manualSingingSlotsV385:undefined});
assert.ok(without.face.jaw>=backing.face.jaw,'legacy lip movement preserved when no assignment');
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VocalRigV368.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx','components/visualizer/StageCameraDirectorV289.tsx',
 'components/visualizer/vocalPerformanceQualityV374.ts','context/UiPreferencesContext.tsx','types/music.ts',
 'components/SettingsPanel.tsx','components/visualizer/MultiVocalPerformanceStudioV385.tsx']){
 assert.ok(read(file).includes('V385'),`${file}: missing integration`);
}
assert.ok(read('components/visualizer/StageCameraDirectorV289.tsx').includes('manualV385.role==="hook"'));
assert.ok(read('components/visualizer/ThreeAvatar.tsx').includes('manualPriority:!!settings.trackId'));
assert.ok(read('components/visualizer/MultiVocalPerformanceStudioV385.tsx').includes('setEditing'));
console.log('PASS V385 manual vocal casting, role lip sync, handoff, hook camera and UI wiring');
