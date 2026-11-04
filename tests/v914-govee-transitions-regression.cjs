'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const source=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const cache=new Map();
const refMap={
 '@/lib/goveeLanV909':'lib/goveeLanV909.ts',
 '@/lib/goveeConcertDirectorV911':'lib/goveeConcertDirectorV911.ts',
 '@/lib/goveeLightShowV912':'lib/goveeLightShowV912.ts',
 '@/lib/goveeTransitionsV914':'lib/goveeTransitionsV914.ts'
};
function load(file){
 if(cache.has(file))return cache.get(file);
 const output=ts.transpileModule(source(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};
 vm.runInNewContext(output,{module:mod,exports:mod.exports,console,require:(id)=>{
  if(!refMap[id])throw Error(`Unexpected import: ${id}`);
  return load(refMap[id]);
 }});
 cache.set(file,mod.exports);return mod.exports;
}
const v914=load('lib/goveeTransitionsV914.ts');
const v912=load('lib/goveeLightShowV912.ts');
const v913=load('lib/goveeColorHarmonyV913.ts');
const v909=load('lib/goveeLanV909.ts');
const ip='192.168.1.31',ip2='192.168.1.32';
const raw={schema:'govee-light-show-v912',id:'show_v914_main',name:'V914-Test',createdAt:1,updatedAt:2,cues:{
 [ip]:{ambient:{color:{r:15,g:10,b:50},brightness:24,fadeMs:3200},verse:{color:{r:20,g:40,b:90},brightness:38,fadeMs:4000,curveV914:'linear',motionV914:'steady'},
 hook:{color:{r:80,g:40,b:190},brightness:67,fadeMs:5000,curveV914:'sine',motionV914:'breath'},
 build:{color:{r:110,g:5,b:180},brightness:59,fadeMs:6400,curveV914:'cinematic',motionV914:'lift'},
 drop:{color:{r:255,g:1,b:120},brightness:94,fadeMs:1800,curveV914:'ease-out',motionV914:'steady'},
 break:{color:{r:14,g:20,b:19},brightness:28,fadeMs:12000,curveV914:'ease-in',motionV914:'steady'}}
}};
const show=v912.normalizeGoveeShowV912(raw);
const config={...v909.DEFAULT_GOVEE_CONFIG_V909,masterBrightness:88,directorEnabledV911:true,directorStrengthV911:80};
const input=(phase='hook',previous='verse',transition=.5,overrides={})=>({show,ip,genre:'Deutschrap',progressMs:23500,
 phase:{phase,previous,transition,verified:true},role:'wall',metrics:{bass:.3,beatStrength:.15,energyEnvelope:.4,volume:.3},microphoneActive:false,config,...overrides});
const json=x=>JSON.parse(JSON.stringify(x));
let n=0;const test=(name,fn)=>{fn();console.log('PASS V914 — '+name);n++;};

test('six strictly defined, bounded, monotonic transition curves',()=>{
 assert.deepEqual(Array.from(v914.GOVEE_TRANSITION_CURVES_V914),['smooth','linear','sine','ease-in','ease-out','cinematic']);
 for(const curve of v914.GOVEE_TRANSITION_CURVES_V914){
  assert.equal(v914.easeGoveeTransitionV914(0,curve),0);
  assert.equal(v914.easeGoveeTransitionV914(1,curve),1);
  let prev=0;
  for(let k=0;k<=1000;k++){
   const next=v914.easeGoveeTransitionV914(k/1000,curve);
   assert.ok(next+1e-10>=prev&&next<=1&&next>=0,curve+' '+k);prev=next;
  }
 }
});
test('cinematic curve holds briefly, ease-out leads, ease-in trails',()=>{
 assert.equal(v914.easeGoveeTransitionV914(.10,'cinematic'),0);
 assert.ok(v914.easeGoveeTransitionV914(.4,'ease-out')>.4);
 assert.ok(v914.easeGoveeTransitionV914(.4,'ease-in')<.4);
 assert.ok(Math.abs(v914.easeGoveeTransitionV914(.5,'sine')-.5)<1e-12);
});
test('malformed progress is clamped and cannot create unsafe RGB',()=>{
 for(const progress of [-100,NaN,Infinity,1e10]){
  const eased=v914.easeGoveeTransitionV914(progress,'linear');assert.ok(eased>=0&&eased<=1);
 }
 for(const name of ['unknown',null,{},'<script>'])assert.equal(v914.normalizeGoveeCurveV914(name),'smooth');
});
test('old V912 lightshows inherit smooth + steady with no migration',()=>{
 const legacy=v912.normalizeGoveeShowV912({schema:'govee-light-show-v912',id:'legacy_test',name:'Alt',createdAt:1,updatedAt:1,
  cues:{[ip2]:{verse:{color:{r:34,g:56,b:78},brightness:55,fadeMs:3200}}}});
 const cue=legacy.cues[ip2].verse;
 assert.equal(cue.curveV914,'smooth');assert.equal(cue.motionV914,'steady');
 assert.equal(legacy.schema,'govee-light-show-v912');
 assert.equal(v914.getGoveeTransitionOptionsV914(legacy,ip2,'verse').curve,'smooth');
});
test('invalid transition settings are cleaned before export and playback',()=>{
 const invalid=v912.normalizeGoveeCueV912({color:{r:256,g:-15,b:123},brightness:900,fadeMs:400,
  curveV914:'__proto__',motionV914:'strobe'});
 assert.equal(invalid.curveV914,'smooth');assert.equal(invalid.motionV914,'steady');
 assert.equal(invalid.brightness,100);assert.equal(invalid.fadeMs,1200);
});
test('all transition options are stored and survive JSON serialization',()=>{
 const output=v912.normalizeGoveeShowV912(json(show));
 for(const phase of ['verse','hook','build','drop','break']){
  assert.equal(output.cues[ip][phase].curveV914,show.cues[ip][phase].curveV914);
  assert.equal(output.cues[ip][phase].motionV914,show.cues[ip][phase].motionV914);
 }
 assert.equal(JSON.stringify(output).includes('token'),false);
});
test('specific cue updates do not mutate unrelated phase, IP or original show',()=>{
 const after=v912.replaceGoveeShowCueV912(show,ip,'hook',{...show.cues[ip].hook,curveV914:'cinematic'});
 assert.equal(show.cues[ip].hook.curveV914,'sine');assert.equal(after.cues[ip].hook.curveV914,'cinematic');
 assert.equal(after.cues[ip].drop.curveV914,'ease-out');
});
test('V913 harmony updates retain all V914 transition parameters',()=>{
 const options={base:{r:38,g:60,b:187},scheme:'triadic',strength:70,masterBrightness:84};
 const after=v913.applyGoveeHarmonyToShowV913(show,[{ip,role:'wall'}],options,['hook','build']);
 assert.equal(after.cues[ip].hook.fadeMs,5000);
 assert.equal(after.cues[ip].hook.curveV914,'sine');
 assert.equal(after.cues[ip].hook.motionV914,'breath');
 assert.equal(after.cues[ip].build.curveV914,'cinematic');
 assert.equal(show.cues[ip].hook.color.r,80);
});
test('advanced planner and legacy planner agree on legacy defaults',()=>{
 const old=v912.normalizeGoveeShowV912({schema:'govee-light-show-v912',id:'old_test',name:'Old',createdAt:1,updatedAt:1,cues:{
  [ip]:{verse:{color:{r:20,g:30,b:40},brightness:30,fadeMs:3200},hook:{color:{r:150,g:160,b:170},brightness:70,fadeMs:3200}}}});
 for(let i=0;i<=100;i++){
  const args=input('hook','verse',i/100,{show:old});
  assert.deepEqual(json(v914.planGoveeAdvancedShowLookV914(args)),json(v912.planGoveeShowLookV912(args)));
 }
});
test('transition begins and ends at exact chosen phase colors when steady',()=>{
 const begin=v914.planGoveeAdvancedShowLookV914(input('drop','verse',0));
 const end=v914.planGoveeAdvancedShowLookV914(input('drop','verse',1));
 const prev=v912.planGoveeShowLookV912(input('verse','verse',1));
 const next=v912.planGoveeShowLookV912(input('drop','drop',1));
 assert.deepEqual(json(begin),json(prev));assert.deepEqual(json(end),json(next));
});
test('different curves produce different mid-transition outputs',()=>{
 const linear=v914.planGoveeAdvancedShowLookV914(input('verse','ambient',.32));
 const cinematic=v914.planGoveeAdvancedShowLookV914(input('build','ambient',.32));
 const start=v914.planGoveeAdvancedShowLookV914(input('build','ambient',0));
 assert.notDeepEqual(json(linear),json(start));assert.notDeepEqual(json(cinematic),json(linear));
});
test('breathing has a 9-second wave and cannot increase maximum brightness',()=>{
 const look={color:{r:123,g:34,b:80},brightness:84};
 const hi=v914.applyGoveeMotionV914(look,'breath',2250,1,90);
 const lo=v914.applyGoveeMotionV914(look,'breath',6750,1,90);
 assert.ok(hi.brightness<=84&&lo.brightness<=84);
 assert.ok(hi.brightness>lo.brightness);
 assert.deepEqual(json(hi.color),json(lo.color));
});
test('soft lift has no brightness discontinuity at the transition endpoints',()=>{
 const look={color:{r:15,g:29,b:220},brightness:70};
 const begin=v914.applyGoveeMotionV914(look,'lift',1200,0,85);
 const mid=v914.applyGoveeMotionV914(look,'lift',1200,.5,85);
 const end=v914.applyGoveeMotionV914(look,'lift',1200,1,85);
 assert.equal(begin.brightness,70);assert.equal(end.brightness,70);assert.ok(mid.brightness>70&&mid.brightness<=85);
});
test('light motion never changes RGB, overdrives master, or produces blackouts',()=>{
 for(let i=0;i<4000;i++){
  const sample={color:{r:i%256,g:(i*19)%256,b:(i*37)%256},brightness:20+i%81};
  const out=v914.applyGoveeMotionV914(sample,v914.GOVEE_MOTION_STYLES_V914[i%3],i*133,i/4000,20+i%81);
  assert.ok(Number.isInteger(out.brightness)&&out.brightness>=20&&out.brightness<=20+i%81);
  assert.deepEqual(json(out.color),json(sample.color));
 }
});
test('4,000 concert cue and curve combinations stay deterministic and valid',()=>{
 const phases=['ambient','verse','hook','build','drop','break'];
 for(let i=0;i<4000;i++){
  const phase=phases[i%6],previous=phases[(i+2)%6];
  const args=input(phase,previous,(i%100)/100,{progressMs:i*89,config:{...config,masterBrightness:20+i%81}});
  const out=v914.planGoveeAdvancedShowLookV914(args);
  assert.ok(Number.isInteger(out.brightness)&&out.brightness>=20&&out.brightness<=args.config.masterBrightness);
  for(const c of Object.values(out.color))assert.ok(Number.isInteger(c)&&c>=0&&c<=255);
  if(i%97===0)assert.deepEqual(json(out),json(v914.planGoveeAdvancedShowLookV914(args)));
 }
});
test('editor preview uses exactly the same V914 engine as music sync',()=>{
 const editor=source('components/GoveeLightShowEditorV912.tsx'),sync=source('components/GoveeMusicSyncV909.tsx');
 assert.match(editor,/planGoveeAdvancedShowLookV914/);assert.match(sync,/planGoveeAdvancedShowLookV914/);
 assert.match(editor,/easeGoveeTransitionV914/);
 assert.match(editor,/Änderungen speichern/);
 assert.doesNotMatch(editor,/goveeBridgeRequestV909|fetch\(/);
 assert.doesNotMatch(source('lib/goveeTransitionsV914.ts'),/fetch\(|localStorage|goveeBridgeRequestV909/);
 assert.doesNotMatch(sync,/action:'power'/);
});
test('all edited TypeScript and TSX files parse with the existing compiler',()=>{
 for(const file of ['lib/goveeTransitionsV914.ts','lib/goveeLightShowV912.ts','lib/goveeColorHarmonyV913.ts','components/GoveeLightShowEditorV912.tsx','components/GoveeMusicSyncV909.tsx']){
  const parsed=ts.createSourceFile(file,source(file),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,file);
 }
});
test('no new bridge endpoints, unchanged opt-in settings and Pi compatibility',()=>{
 const defaults=v909.normalizeGoveeConfigV909({});
 assert.equal(defaults.enabled,false);assert.equal(defaults.autoSync,false);assert.equal(defaults.showEnabledV912,false);
 assert.ok(fs.existsSync(path.join(root,'scripts/govee-lan-bridge.cjs')));
 assert.equal(v914.normalizeGoveeMotionV914('strobe'),'steady');
});
console.log(`V914 PASS ${n} groups (incl. 4,000 concert cue combinations and 4,000 motion checks)`);
