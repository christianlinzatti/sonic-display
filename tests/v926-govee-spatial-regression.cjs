'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const storage=new Map(),events=[];
const fakeWindow={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},dispatchEvent:e=>events.push(e.type)};
function load(file){
 const converted=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(converted.diagnostics?.length||0,0);
 const module={exports:{}};
 vm.runInNewContext(converted.outputText,{module,exports:module.exports,localStorage:fakeWindow.localStorage,
  window:fakeWindow,Event:class{constructor(type){this.type=type;}},
  require(id){throw Error('Unexpected runtime dependency '+id);}}, {filename:file,timeout:10000});
 return module.exports;
}
const f=load('lib/goveeSpatialDirectorV926.ts');
const json=v=>JSON.parse(JSON.stringify(v));
const ips=['192.168.1.31','192.168.1.32','192.168.1.33','192.168.1.34'];
const positions={
 [ips[0]]:{x:.1,y:.1},[ips[1]]:{x:.9,y:.15},[ips[2]]:{x:.9,y:.9},[ips[3]]:{x:.1,y:.85},
};
const base={color:{r:80,g:30,b:110},brightness:55};
const defaults=json(f.DEFAULT_GOVEE_SPATIAL_V926);
const settings={...defaults,enabled:true,positions};
const enabled=(change={})=>({...settings,...change});
let groups=0;
const test=(name,fn)=>{fn();groups++;console.log('PASS V926 '+name);};
const plan=(ip=ips[0],ms=3800,s=settings)=>f.planGoveeSpatialV926(ips,ip,ms,'Hardtekk',s);
const apply=(dec=plan(),s=settings,role='wall',initial=base,master=75)=>f.applyGoveeSpatialV926(initial,dec,role,s,master);
const order=(direction,point=positions)=>json(f.resolveGoveeSpatialOrderV926(ips,enabled({direction,positions:point})));

test('opt-in disabled, no stored coordinates by default',()=>{assert.equal(defaults.enabled,false);assert.deepEqual(defaults.positions,{});});
test('all six directions supported and unique',()=>{assert.deepEqual(json(f.GOVEE_SPATIAL_DIRECTIONS_V926),['left-right','right-left','stage-audience','audience-stage','clockwise','counterclockwise']);});
test('malformed input always disabled',()=>{for(const x of [null,undefined,4,[],false,'true',{}, {enabled:'true'},{enabled:1}])assert.equal(f.normalizeGoveeSpatialV926(x).enabled,false);});
test('numerics sanitized and unsupported direction rejected',()=>{const x=f.normalizeGoveeSpatialV926({enabled:true,direction:'strobe',strength:-9,colorMixPercent:400,maxBoostPoints:100,periodMs:NaN});assert.equal(x.direction,'left-right');assert.equal(x.strength,0);assert.equal(x.colorMixPercent,30);assert.equal(x.maxBoostPoints,8);assert.equal(x.periodMs,7800);});
test('non numeric params fallback',()=>{const x=f.normalizeGoveeSpatialV926({strength:'99',colorMixPercent:null,maxBoostPoints:'7',periodMs:Infinity});assert.equal(x.strength,55);assert.equal(x.maxBoostPoints,5);assert.equal(x.periodMs,7800);});
test('corrupt storage fails closed',()=>{storage.set(f.GOVEE_SPATIAL_KEY_V926,'{no');assert.equal(f.loadGoveeSpatialV926().enabled,false);});
test('save/load and same-tab change event',()=>{f.saveGoveeSpatialV926(settings);assert.equal(f.loadGoveeSpatialV926().positions[ips[1]].x,.9);assert.ok(events.includes(f.GOVEE_SPATIAL_EVENT_V926));});
test('no bridge credentials or token in stored values',()=>{assert.doesNotMatch(storage.get(f.GOVEE_SPATIAL_KEY_V926),/token|password|secret|endpoint|masterBrightness|deviceRolesV911/i);});
test('only private IPv4 saved',()=>{const x=f.normalizeGoveeSpatialV926({enabled:true,positions:{'8.8.8.8':{x:.1,y:.2},'127.0.0.1':{x:.3,y:.6},[ips[0]]:{x:.1,y:.2}}});assert.deepEqual(Object.keys(x.positions),[ips[0]]);});
test('coordinates clamped and rounded to three decimals',()=>{const x=f.normalizeGoveeSpatialV926({positions:{[ips[0]]:{x:3.55,y:-.27},[ips[1]]:{x:.3487,y:.4499}}});assert.deepEqual(json(x.positions[ips[0]]),{x:1,y:0});assert.deepEqual(json(x.positions[ips[1]]),{x:.349,y:.45});});
test('invalid point objects never included',()=>{const x=f.normalizeGoveeSpatialV926({positions:{[ips[0]]:null,[ips[1]]:{x:NaN,y:.5},[ips[2]]:{x:'1',y:.6},[ips[3]]:{x:.2,y:.7}}});assert.deepEqual(Object.keys(x.positions),[ips[3]]);});
test('max 32 positions and no huge payload',()=>{const o={};for(let i=1;i<=60;i++)o[`192.168.2.${i}`]={x:.3,y:.8};assert.ok(Object.keys(f.normalizeGoveeSpatialV926({positions:o}).positions).length<=32);});
test('default layout is safe and normalized',()=>{for(let n=1;n<=32;n++)for(let i=0;i<n;i++){const p=f.defaultGoveeSpatialPointV926(i,n);assert.ok(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);}});
test('default four layout has distinct room quadrants',()=>{const x=ips.map((_,i)=>f.defaultGoveeSpatialPointV926(i,4));assert.equal(new Set(x.map(y=>y.x+':'+y.y)).size,4);});
test('unknown position falls back to deterministic layout',()=>{const x=f.getGoveeSpatialPointV926(ips[2],ips,defaults);assert.deepEqual(json(x),json(f.defaultGoveeSpatialPointV926(2,4)));});
test('left-to-right uses physical x, not selection index',()=>{assert.deepEqual(order('left-right'),[ips[0],ips[3],ips[1],ips[2]]);});
test('right-to-left reverses x order',()=>{assert.deepEqual(order('right-left'),[ips[1],ips[2],ips[0],ips[3]]);});
test('stage-to-audience orders increasing y',()=>{assert.deepEqual(order('stage-audience'),[ips[0],ips[1],ips[3],ips[2]]);});
test('audience-to-stage reverses y',()=>{assert.deepEqual(order('audience-stage'),[ips[2],ips[3],ips[1],ips[0]]);});
test('clockwise begins at first fixture after north (back-right)',()=>{assert.deepEqual(order('clockwise'),[ips[1],ips[2],ips[3],ips[0]]);});
test('counterclockwise begins at first fixture before north (back-left)',()=>{assert.deepEqual(order('counterclockwise'),[ips[0],ips[3],ips[2],ips[1]]);});
test('exact cardinal circle order starts at north both ways',()=>{const pts={[ips[0]]:{x:.5,y:.1},[ips[1]]:{x:.9,y:.5},[ips[2]]:{x:.5,y:.9},[ips[3]]:{x:.1,y:.5}};assert.deepEqual(order('clockwise',pts),ips);assert.deepEqual(order('counterclockwise',pts),[ips[0],ips[3],ips[2],ips[1]]);});
test('duplicate coordinates preserve selection order',()=>{const o={[ips[0]]:{x:.5,y:.5},[ips[1]]:{x:.5,y:.5},[ips[2]]:{x:.5,y:.5},[ips[3]]:{x:.5,y:.5}};assert.deepEqual(order('left-right',o),ips);});
test('duplicate IPs are deduplicated',()=>{assert.equal(f.resolveGoveeSpatialOrderV926([ips[0],ips[0],ips[1]],settings).length,2);});
test('public IPs do not participate',()=>{assert.deepEqual(json(f.resolveGoveeSpatialOrderV926(['8.8.8.8',...ips],settings)).sort(),[...ips].sort());});
test('disabled uses legacy selection index',()=>{for(let i=0;i<ips.length;i++)assert.equal(f.spatialIndexV926(ips,ips[i],{...settings,enabled:false}),i);});
test('enabled uses real room rank',()=>{assert.equal(f.spatialIndexV926(ips,ips[3],settings),1);assert.equal(f.spatialIndexV926(ips,ips[2],settings),3);});
test('unselected source cannot drive any wave',()=>{assert.equal(plan('192.168.1.99').active,false);});
test('disabled is identity regardless of song time',()=>{const d=plan(ips[1],5000,{...settings,enabled:false});assert.equal(d.active,false);assert.deepEqual(json(apply(d)),base);});
test('zero strength is identity',()=>{const s=enabled({strength:0});assert.equal(plan(ips[0],4500,s).active,false);assert.deepEqual(json(apply(plan(ips[0],4500,s),s)),base);});
test('zero output options disable wave',()=>{const s=enabled({colorMixPercent:0,maxBoostPoints:0});assert.equal(plan(ips[0],4500,s).active,false);});
test('invalid progress is ignored',()=>{for(const t of [NaN,Infinity,-1,-100])assert.equal(plan(ips[0],t).active,false);});
test('zero time is valid',()=>{assert.equal(plan(ips[0],0).active,true);});
test('empty list is ignored',()=>{assert.equal(f.planGoveeSpatialV926([],ips[0],100,'Hardtekk',settings).active,false);});
test('more than 32 lamps ignored',()=>{assert.equal(f.planGoveeSpatialV926(Array.from({length:33},(_,i)=>`192.168.1.${i+1}`),ips[0],100,'Hardtekk',settings).active,false);});
test('single lamp produces bounded, non-flashing effect',()=>{const dec=f.planGoveeSpatialV926([ips[0]],ips[0],5000,'Hardtekk',settings);assert.equal(dec.active,true);assert.ok(dec.level>=0&&dec.level<=1);});
test('waves use geometric distance as well as order',()=>{const s1=enabled({positions:{...positions,[ips[0]]:{x:.1,y:.1}},direction:'left-right'});const s2=enabled({positions:{...positions,[ips[0]]:{x:.4,y:.1}},direction:'left-right'});assert.notEqual(plan(ips[0],3300,s1).phase,plan(ips[0],3300,s2).phase);});
test('same track time is deterministic',()=>{assert.deepEqual(json(plan(ips[0],3400)),json(plan(ips[0],3400)));});
test('phase and level are bounded at diverse times',()=>{for(let t=0;t<160000;t+=123){const d=plan(ips[2],t);assert.ok(d.level>=0&&d.level<=1&&d.phase>=0&&d.phase<1);}});
test('genre palettes are distinct',()=>{const colors=['Deutschrap','Hardtekk','Hardstyle','Deutschrock'].map(g=>JSON.stringify(f.spatialPaletteV926(g)));assert.equal(new Set(colors).size,4);});
test('role ambient is less intense than wall at a crest',()=>{const s=enabled({direction:'left-right'});const d=plan(ips[0],s.periodMs*positions[ips[0]].x,s);assert.ok(apply(d,s,'wall').brightness>=apply(d,s,'ambient').brightness);});
test('never darkens base',()=>{const d=plan();assert.ok(apply(d).brightness>=base.brightness);});
test('master brightness and max boost are respected',()=>{const s=enabled({strength:100,maxBoostPoints:8});const d=plan(ips[0],s.periodMs*positions[ips[0]].x,s);assert.ok(apply(d,s,'wall',base,60).brightness<=68);});
test('color channels always in range',()=>{for(const role of ['wall','rhythm','neon','ambient']){const v=apply(plan(),settings,role);for(const ch of ['r','g','b'])assert.ok(v.color[ch]>=0&&v.color[ch]<=255);}});
test('zero mix retains exact base color',()=>{const s=enabled({colorMixPercent:0});const v=apply(plan(ips[0],1000,s),s);assert.deepEqual(json(v.color),base.color);});
test('no color effect, zero brightness allowed',()=>{const s=enabled({colorMixPercent:0,maxBoostPoints:0});assert.deepEqual(json(apply(plan(ips[0],1000,s),s)),base);});
test('invalid base preserves input identity',()=>{const bad={color:{r:NaN,g:50,b:30},brightness:50};assert.equal(apply(plan(),settings,'wall',bad),bad);});
test('preview uses supplied IDs without any networking',()=>{const p=f.previewGoveeSpatialV926(ips,settings,3500,'Hardtekk');assert.equal(p.length,4);assert.deepEqual(json(p.map(v=>v.ip)),ips);});
test('preview spatial rank matches real order',()=>{const p=f.previewGoveeSpatialV926(ips,settings,3500,'Hardstyle');assert.equal(p.find(v=>v.ip===ips[3]).rank,1);});
test('preview does not change saved settings',()=>{const before=storage.get(f.GOVEE_SPATIAL_KEY_V926);f.previewGoveeSpatialV926(ips,settings,1700,'Deutschrap');assert.equal(storage.get(f.GOVEE_SPATIAL_KEY_V926),before);});
test('preview simulates even if live opt-in off',()=>{const p=f.previewGoveeSpatialV926(ips,{...settings,enabled:false},4000,'Deutschrock');assert.equal(p.every(v=>v.decision.active),true);});
test('preview devices have no token or endpoint fields',()=>{assert.doesNotMatch(JSON.stringify(f.previewGoveeSpatialV926(ips,settings,500,'rap')),/token|endpoint|password/);});
test('whole-lamp logic only (no segments, strobe, power)',()=>{const src=read('lib/goveeSpatialDirectorV926.ts');assert.doesNotMatch(src,/\bsetInterval\s*\(|\bfetch\s*\(|goveeBridgeRequestV909\s*\(|action:\s*['"](?:power|strobe)/);});
test('live integration has only one LAN command and one scheduler',()=>{
 const src=read('components/GoveeMusicSyncV909.tsx');
 assert.equal((src.match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1);
 assert.ok(src.includes('spatialIndexV926'));
 assert.ok(src.includes('applyGoveeSpatialV926'));
 const deps=new Set((/},\[(config,showLibrary,groups,[^\]]+)\]\);/.exec(src)?.[1]??'').split(',').map(x=>x.trim()));
 for(const name of ['spatialSettings','calibrationSettings','roadmapSettings','syncSettingsV1027',
  'goveeShowEnabledV1042','goveeShowStrengthV1042','arenaShowEnabledV1040',
  'arenaShowPlanV1040','showStageIsArenaV1042','reducedMotionV1042'])
  assert.ok(deps.has(name),`Govee effect must track ${name}`);
});
test('saved V915 group dimmer is last before V911 smoothing',()=>{const src=read('components/GoveeMusicSyncV909.tsx');assert.match(src,/festivalDeliveredLook=easeGoveeLookV911\(previous,\s*applyGoveeGroupBrightnessV915\(spatialUngrouped,group,config\.masterBrightness\)\)/);});
test('UI has save/revert and separate preview',()=>{const src=read('components/GoveeSpatialStudioV926.tsx');for(const t of ['Raumaufstellung speichern','Änderungen verwerfen','Raumwellen-Vorschau','Bühne → Publikum','Kreis im Raum'])assert.ok(src.includes(t));});
test('UI connected to Govee panel and CI runs guard',()=>{const p=read('components/GoveeLanPanelV909.tsx'),ci=read('.github/workflows/v832-continuous-validation.yml');assert.ok(p.includes('<GoveeSpatialStudioV926 config={config} devices={devices}/>'));assert.ok(ci.includes('npm run test:v926 && npm run test:v926:types && npm run test:v926:ui-types'));});
test('prebuild starts with V908 guard and includes V926',()=>{const pkg=JSON.parse(read('package.json'));assert.ok(pkg.scripts.prebuild.includes('npm run test:v908') && pkg.scripts.prebuild.includes('npm run test:v926'));});
test('fixture positions never exported automatically or posted to bridge',()=>{const files=['lib/goveeSpatialDirectorV926.ts','components/GoveeSpatialStudioV926.tsx'];for(const file of files)assert.doesNotMatch(read(file),/\/command|\/devices\/add|sendBeacon|navigator\.geolocation/);});
// 5000 deterministic multi-genre/multi-direction/device combinations.
let checks=0;
for(let i=0;i<5000;i++){
 const ms=(i*1633)%190000,ip=ips[i%4],genre=['Hardtekk','Hardstyle','Deutschrap','Deutschrock'][i%4],
  direction=f.GOVEE_SPATIAL_DIRECTIONS_V926[i%6],role=['wall','rhythm','neon','ambient'][i%4],
  s=enabled({direction,strength:i%101,colorMixPercent:i%31,maxBoostPoints:i%9,periodMs:3500+i%12501});
 const d=f.planGoveeSpatialV926(ips,ip,ms,genre,s);
 const a=f.applyGoveeSpatialV926(base,d,role,s,70);
 assert.ok(Number.isFinite(a.brightness)&&a.brightness>=1&&a.brightness<=100);
 assert.ok(a.brightness>=base.brightness&&a.brightness<=Math.max(base.brightness,Math.min(100,70+s.maxBoostPoints)));
 for(const k of ['r','g','b'])assert.ok(Number.isFinite(a.color[k])&&a.color[k]>=0&&a.color[k]<=255);
 assert.ok(d.level>=0&&d.level<=1);
 checks++;
}
console.log(`PASS V926 – ${groups} test groups, ${checks} deterministic spatial lighting states`);
