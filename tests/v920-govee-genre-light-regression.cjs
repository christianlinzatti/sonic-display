'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const eventLog=[];const store=new Map();const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 const source=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(source.diagnostics?.length||0,0);
 const mod={exports:{}};cache.set(file,mod);
 const ctx={module:mod,exports:mod.exports,Event:class{constructor(type){this.type=type;}},
  window:{dispatchEvent:event=>eventLog.push(event.type)},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
  require(id){if(!id.startsWith('@/'))throw Error('Unexpected dependency: '+id);
   return load(id.replace(/^@\//,'')+'.ts');}};
 vm.runInNewContext(source.outputText,ctx,{filename:file,timeout:10000});return mod.exports;
}
const g=load('lib/goveeGenreLightV920.ts');
const v919=load('lib/goveeSectionDirectorV919.ts');
const json=x=>JSON.parse(JSON.stringify(x));
const settings={...json(g.DEFAULT_GOVEE_GENRE_V920),enabled:true};
const sectionOpts={...json(v919.DEFAULT_GOVEE_SECTION_V919),enabled:true};
const mk=(sections=[
 {label:'verse',startMs:0,durationMs:10000,confidence:.97},
 {label:'build',startMs:10000,durationMs:10000,confidence:.95},
 {label:'drop',startMs:20000,durationMs:10000,confidence:.98},
 {label:'hook',startMs:30000,durationMs:10000,confidence:.92},
 {label:'break',startMs:40000,durationMs:10000,confidence:.97}])=>({schema:'sonic-track-analysis-v318',trackId:'track-v920',source:'json-import',durationMs:50000,
 tempo:150,timeSignature:4,beats:[],bars:[],sections,importedAt:0});
const base={color:{r:47,g:72,b:110},brightness:55};
const plan=(ms,genre='hardtekk',opts=settings,analysis=mk(),track='track-v920',sectionOptsOverride=sectionOpts)=>{
 const section=v919.planGoveeSectionV919(analysis,track,ms,sectionOptsOverride);
 return g.planGoveeGenreV920(analysis,track,ms,genre,section,opts);
};
const apply=(d,role='rhythm',opts=settings,master=75,look=base)=>g.applyGoveeGenreV920(look,d,role,opts,master);
let tests=0;
function test(name,fn){fn();tests++;console.log('PASS V920 '+name);}
test('default disabled and invalid values cannot enable',()=>{
 assert.equal(g.DEFAULT_GOVEE_GENRE_V920.enabled,false);
 for(const value of [null,undefined,'true',true,0,[],{}, {enabled:'true'},{enabled:1}])
  assert.equal(g.normalizeGoveeGenreV920(value).enabled,false);
 assert.equal(g.loadGoveeGenreV920().enabled,false);
});
test('normalization clamps without NaN or infinity',()=>{
 assert.deepEqual(json(g.normalizeGoveeGenreV920({enabled:true,strength:Infinity,maxChangePoints:200,minConfidence:-10})),
 {enabled:true,strength:65,maxChangePoints:12,minConfidence:50});
});
test('browser persistence has no credentials and emits update',()=>{
 g.saveGoveeGenreV920({...settings,strength:73});
 assert.equal(g.loadGoveeGenreV920().strength,73);
 assert.ok(eventLog.includes(g.GOVEE_GENRE_EVENT_V920));
 assert.equal(Object.keys(JSON.parse(store.get(g.GOVEE_GENRE_KEY_V920))).length,4);
 assert.ok(!/token|ip|endpoint|password|authorization/i.test(store.get(g.GOVEE_GENRE_KEY_V920)));
});
test('malformed localStorage returns disabled configuration',()=>{
 store.set(g.GOVEE_GENRE_KEY_V920,'broken');assert.equal(g.loadGoveeGenreV920().enabled,false);
});
test('explicit family registry recognizes actual MusicGenre keys',()=>{
 for(const [source,target] of Object.entries({deutschrap:'deutschrap',hiphop:'deutschrap',trap:'deutschrap',drill:'deutschrap',boombap:'deutschrap',
  hardtekk:'hardtekk',uptempo:'hardtekk',hardstyle:'hardstyle',rawstyle:'hardstyle',hardcore:'hardstyle',
  rock:'deutschrock',metal:'deutschrock',punkrock:'deutschrock',poprock:'deutschrock'}))
  assert.equal(g.resolveGoveeGenreV920(source),target);
});
test('unknown, pop, techno and ambient never pretend to be a concert family',()=>{
 for(const genre of [undefined,null,'','ambient','pop','techno','house','indiepop','rnb',{},123,'hardstyle___random'])
  assert.equal(g.resolveGoveeGenreV920(genre),null);
});
test('disabled feature and zero strength/ceiling are exact identity',()=>{
 for(const extra of [{enabled:false},{strength:0},{maxChangePoints:0}]){
  const o={...settings,...extra};const d=plan(24000,'hardstyle',o);
  assert.equal(d.active,false);assert.deepEqual(json(apply(d,'rhythm',o)),base);
 }
});
test('V919 disabled always blocks V920 genre changes',()=>{
 const d=plan(24000,'hardstyle',settings,mk(),'track-v920',{...sectionOpts,enabled:false});
 assert.equal(d.active,false);assert.deepEqual(json(apply(d)),base);
});
test('missing and noncurrent analysis produces no changes',()=>{
 for(const analysis of [null,mk([])]){
  const d=plan(24000,'hardstyle',settings,analysis);assert.equal(d.active,false);
 }
 assert.equal(plan(24000,'hardstyle',settings,mk(),'wrong-track').active,false);
});
test('invalid playback positions leave output unchanged',()=>{
 for(const ms of [-1,NaN,Infinity,50000,1e9])assert.equal(plan(ms).active,false);
});
test('unknown genres do not modify verified stages',()=>{
 for(const genre of ['pop','ambient','techno','metalcore','']){
  const d=plan(24000,genre);assert.equal(d.active,false);assert.deepEqual(json(apply(d)),base);
 }
});
test('no label and out-of-window sections never make a genre cue',()=>{
 assert.equal(plan(500,'hardtekk',settings,mk([])).active,false);
 const a=mk([{startMs:0,durationMs:10000,confidence:1}]);assert.equal(plan(500,'hardtekk',settings,a).active,false);
});
test('low-confidence and higher configured min confidence gate correctly',()=>{
 const a=mk([{label:'hook',startMs:0,durationMs:10000,confidence:.75}]);
 assert.equal(plan(500,'hardstyle',{...settings,minConfidence:80},a).active,false);
 assert.equal(plan(500,'hardstyle',{...settings,minConfidence:70},a).active,true);
});
test('forged V919 decision cannot change another track',()=>{
 const a=mk(),fake={active:true,phase:'drop',confidence:.98,intensity:.2,verifiedDropAhead:true};
 assert.equal(g.planGoveeGenreV920(a,'wrong',25000,'hardstyle',fake,settings).active,false);
});
test('forged confidence fails section correlation',()=>{
 const a=mk(),fake={active:true,phase:'drop',confidence:1,intensity:.2,verifiedDropAhead:false};
 assert.equal(g.planGoveeGenreV920(a,a.trackId,23000,'hardstyle',fake,settings).active,false);
});
test('forged phase fails section correlation',()=>{
 const a=mk(),fake={active:true,phase:'hook',confidence:.98,intensity:.2,verifiedDropAhead:false};
 assert.equal(g.planGoveeGenreV920(a,a.trackId,23000,'hardstyle',fake,settings).active,false);
});
test('hardstyle has larger drop and deeper break contrast than deutschrap',()=>{
 const hardDrop=plan(20500,'hardstyle');const rapDrop=plan(20500,'deutschrap');
 const hardBreak=plan(45500,'hardstyle');const rapBreak=plan(45500,'deutschrap');
 assert.ok(hardDrop.weight>rapDrop.weight);assert.ok(hardBreak.weight<rapBreak.weight);
});
test('hardtekk verses are more energetic than subdued deutschrap verses',()=>{
 assert.ok(plan(3000,'hardtekk').weight>plan(3000,'deutschrap').weight);
});
test('deutschrock has stronger hook than its verse',()=>{
 assert.ok(plan(35000,'deutschrock').weight>plan(3000,'deutschrock').weight);
});
test('confirmed build-up progressively increases for four genres',()=>{
 for(const genre of ['deutschrap','hardtekk','hardstyle','deutschrock']){
  const early=plan(10100,genre),late=plan(19850,genre);
  assert.ok(early.active&&late.active&&late.weight>early.weight,genre);
 }
});
test('drop decays slowly but never oscillates',()=>{
 const a=plan(20000,'hardstyle'),b=plan(25000,'hardstyle'),c=plan(29900,'hardstyle');
 assert.ok(a.weight>b.weight&&b.weight>c.weight&&c.weight>0);
});
test('break is restful for all supported genres',()=>{
 for(const genre of ['deutschrap','hardtekk','hardstyle','deutschrock']){
  const d=plan(45500,genre);assert.ok(d.active&&d.weight<0);
  assert.ok(apply(d).brightness<base.brightness);
 }
});
test('all resulting colors remain unchanged and power commands are absent',()=>{
 for(const genre of ['deutschrap','hardtekk','hardstyle','deutschrock']){
  const d=plan(22000,genre),r=apply(d);
  assert.deepEqual(json(r.color),base.color);assert.equal('on' in r,false);assert.equal('off' in r,false);
 }
});
test('ambient fixture reacts less than rhythm fixture',()=>{
 const d=plan(20000,'hardstyle');
 assert.ok(apply(d,'rhythm').brightness>apply(d,'ambient').brightness);
});
test('master cap bounds positive boost, no unbounded flash',()=>{
 const d=plan(20000,'hardstyle');
 const l=apply(d,'rhythm',{...settings,maxChangePoints:12,strength:100},40,{...base,brightness:47});
 assert.ok(l.brightness<=52&&l.brightness>=47);
});
test('low bound prevents blackouts, high bound prevents overdrive',()=>{
 const low=apply(plan(45000,'hardstyle'),'rhythm',settings,15,{...base,brightness:20});
 const high=apply(plan(20500,'hardstyle'),'rhythm',settings,100,{...base,brightness:99});
 assert.ok(low.brightness>=20&&high.brightness<=100);
});
test('identity if applying inactive or disabled settings',()=>{
 assert.deepEqual(json(apply({active:false,genre:null,phase:'ambient',weight:0,confidence:0,reason:'inactive'})),base);
 assert.deepEqual(json(apply(plan(24000),'rhythm',{...settings,enabled:false})),base);
});
test('preview never requires window or dispatches LAN work',()=>{
 const result=g.previewGoveeGenreV920('hardstyle','drop','rhythm',g.DEFAULT_GOVEE_GENRE_V920);
 assert.ok(result.active&&result.result>result.base);
});
test('preview displays four independent roles',()=>{
 const a=['wall','rhythm','neon','ambient'].map(role=>g.previewGoveeGenreV920('hardtekk','drop',role,settings));
 assert.ok(a[1].result>a[3].result);
});
test('live integration layers V920 after V919 and before bass and group',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.ok(sync.includes('const sectionDecision=config.directorEnabledV911'));
 assert.ok(sync.indexOf('const genreDecision=')>sync.indexOf('const sectionDecision='));
 assert.ok(sync.indexOf('const unboosted=genreDecision')>sync.indexOf('const sectionLook='));
 assert.ok(sync.indexOf('const bassLook=')>sync.indexOf('const unboosted=genreDecision'));
 assert.ok(sync.indexOf('const target=applyGoveeGroupBrightnessV915')>sync.indexOf('const unboosted=genreDecision'));
 assert.match(sync,/sectionSettings,genreSettings,cinematicSettings(?:,shockSettings)?(?:,neonSettings)?(?:,energySettings)?(?:,festivalSettings)?(?:,spatialSettings)?(?:,calibrationSettings)?(?:,roadmapSettings)?\]/); // V958 optional postprocessing preserves V920 dependencies.
});
test('settings UI is mounted in existing Govee settings',()=>{
 const panel=read('components/GoveeLanPanelV909.tsx'),ui=read('components/GoveeGenreStudioV920.tsx');
 assert.match(panel,/<GoveeGenreStudioV920 config=\{config\}\/>/);
 assert.match(ui,/V920 · Genre Adaptive Light Intelligence/);
 assert.match(ui,/ohne LAN-Befehle/);
 assert.match(ui,/genre,section,settings/);
});
test('CI and npm commands registered',()=>{
 const pkg=JSON.parse(read('package.json'));
 for(const cmd of ['test:v920','test:v920:types','test:v920:ui-types','verify:v920:focused'])assert.ok(pkg.scripts[cmd]);
 assert.match(read('.github/workflows/v832-continuous-validation.yml'),/V920 Govee Genre Adaptive Light Intelligence/);
 assert.match(pkg.scripts.prebuild,/npm run test:v920/); // V908/V916 gates must remain first.
});
test('no added bridge protocol or forced hardware commands',()=>{
 const gSrc=read('lib/goveeGenreLightV920.ts');
 assert.ok(!/goveeBridgeRequestV909|fetch\(|new WebSocket\(|setInterval\(/.test(gSrc));
 assert.match(read('components/GoveeMusicSyncV909.tsx'),/window\.setInterval\(\(\)=>void tick\(\),1700\)/);
});
test('5000 deterministic genre / phase / role plans remain finite and bounded',()=>{
 const genres=['deutschrap','hardtekk','hardstyle','deutschrock'];const roles=['wall','rhythm','neon','ambient'];
 for(let i=0;i<5000;i++){
  const genre=genres[i%4],role=roles[(i>>2)%4],phase=Math.floor(i/20)%5;
  const point=phase*10000+1000+(i%499);
  const d=plan(point,genre);const a=apply(d,role),b=apply(d,role);
  assert.equal(d.active,true);assert.deepEqual(json(a),json(b));
  assert.ok(Number.isFinite(a.brightness)&&a.brightness>=20&&a.brightness<=100);
  assert.deepEqual(json(a.color),base.color);
 }
});
console.log(`PASS V920 total ${tests} test groups; 5000 deterministic states`);
